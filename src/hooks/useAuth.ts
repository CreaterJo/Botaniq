"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase, UserProfile } from '@/lib/supabase';
import { generateUsername, isValidUsername } from '@/lib/usernameGenerator';

const SESSION_KEY = 'botaniq_session';

interface Session {
  userId: string;
  username: string;
  createdAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  isOffline: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isOffline: false
  });

  // Load session from localStorage
  const loadSession = useCallback((): Session | null => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const session = JSON.parse(stored) as Session;
        if (session.userId && session.username && isValidUsername(session.username)) {
          return session;
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
    return null;
  }, []);

  // Save session to localStorage
  const saveSession = useCallback((session: Session) => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }, []);

  // Clear session
  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }, []);

  // Register new user with unique username
  const registerUser = useCallback(async (): Promise<UserProfile | null> => {
    if (!supabase) {
      // Offline mode: create local user
      const localUser: UserProfile = {
        id: crypto.randomUUID(),
        username: generateUsername(),
        created_at: new Date().toISOString(),
        last_seen: new Date().toISOString()
      };
      saveSession({
        userId: localUser.id,
        username: localUser.username,
        createdAt: localUser.created_at
      });
      return localUser;
    }

    // Try to register with Supabase
    let retries = 3;
    while (retries > 0) {
      const username = generateUsername();

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .insert([{ username }])
          .select()
          .single();

        if (error) {
          // Username collision - retry with new username
          if (error.code === '23505') {
            retries--;
            continue;
          }
          throw error;
        }

        if (data) {
          saveSession({
            userId: data.id,
            username: data.username,
            createdAt: data.created_at
          });
          return data;
        }
      } catch (error) {
        console.error('Registration error:', error);
        retries--;

        if (retries === 0) {
          // Fallback to offline mode
          const localUser: UserProfile = {
            id: crypto.randomUUID(),
            username: generateUsername(),
            created_at: new Date().toISOString(),
            last_seen: new Date().toISOString()
          };
          saveSession({
            userId: localUser.id,
            username: localUser.username,
            createdAt: localUser.created_at
          });
          setState(prev => ({ ...prev, isOffline: true }));
          return localUser;
        }
      }
    }

    return null;
  }, [saveSession]);

  // Fetch user from Supabase
  const fetchUser = useCallback(async (userId: string): Promise<UserProfile | null> => {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  }, []);

  // Update last_seen timestamp
  const updateLastSeen = useCallback(async (userId: string) => {
    if (!supabase) return;

    try {
      await supabase
        .from('user_profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Failed to update last_seen:', error);
    }
  }, []);

  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Check for existing session
      const session = loadSession();

      if (session) {
        // Try to fetch user from Supabase
        const user = await fetchUser(session.userId);

        if (user) {
          setState({
            user,
            loading: false,
            error: null,
            isOffline: false
          });
          updateLastSeen(session.userId);
        } else {
          // Use local session
          setState({
            user: {
              id: session.userId,
              username: session.username,
              created_at: session.createdAt,
              last_seen: new Date().toISOString()
            },
            loading: false,
            error: null,
            isOffline: !supabase
          });
        }
      } else {
        // Register new user
        const newUser = await registerUser();

        if (newUser) {
          setState({
            user: newUser,
            loading: false,
            error: null,
            isOffline: !supabase
          });
        } else {
          setState({
            user: null,
            loading: false,
            error: 'Failed to create user session',
            isOffline: true
          });
        }
      }
    };

    initAuth();
  }, [loadSession, fetchUser, updateLastSeen, registerUser]);

  // Logout (creates new session)
  const logout = useCallback(async () => {
    clearSession();
    const newUser = await registerUser();

    if (newUser) {
      setState({
        user: newUser,
        loading: false,
        error: null,
        isOffline: !supabase
      });
    }
  }, [clearSession, registerUser]);

  // Retry connection
  const retryConnection = useCallback(async () => {
    if (!state.user) return;

    const user = await fetchUser(state.user.id);
    if (user) {
      setState(prev => ({
        ...prev,
        user,
        isOffline: false
      }));
    }
  }, [state.user, fetchUser]);

  return {
    ...state,
    logout,
    retryConnection
  };
};
