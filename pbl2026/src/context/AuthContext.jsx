// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import {
  loginUser as apiLoginUser,
  registerUser as apiRegisterUser,
  logoutUser as apiLogoutUser,
} from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser]   = useState(null);
  const [initialising, setInitialising] = useState(true);
  const [loading, setLoading]           = useState(false);
  const _skipNextEvent                  = useRef(false);

  useEffect(() => {
    let cancelled = false;

    // IMPORTANT: this callback must NOT await any Supabase call directly.
    // supabase-js runs auth listeners while holding its internal auth lock, and
    // every supabase.from(...) query waits for that same lock. Awaiting a query
    // in here deadlocks the client, so every later query (e.g. pending reviews)
    // hangs forever. Deferring the work with setTimeout releases the lock first.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (cancelled) return;

        if (event === 'INITIAL_SESSION') {
          setTimeout(async () => {
            if (session?.user) {
              const profile = await _fetchProfile(session.user.id);
              if (!cancelled) setCurrentUser(profile);
            }
            if (!cancelled) setInitialising(false);
          }, 0);
          return;
        }
        if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          return;
        }
        if (event === 'SIGNED_IN') {
          if (_skipNextEvent.current) { _skipNextEvent.current = false; return; }
          setTimeout(async () => {
            if (session?.user) {
              const profile = await _fetchProfile(session.user.id);
              if (!cancelled) setCurrentUser(profile);
            }
          }, 0);
        }
      }
    );

    // Safety net — if INITIAL_SESSION never fires within 5s, unblock
    const timer = setTimeout(() => {
      if (!cancelled) {
        console.warn('[Auth] INITIAL_SESSION never fired — unblocking');
        setInitialising(false);
      }
    }, 5000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  /** Fetch profile row. Falls back to a minimal object if table missing. */
  const _fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('[Auth] Profile fetch error:', error.message);
        // Return minimal object so the app still works
        const { data: { user } } = await supabase.auth.getUser();
        return {
          id:     userId,
          email:  user?.email || '',
          name:   user?.user_metadata?.name || user?.email?.split('@')[0] || 'User',
          role:   user?.user_metadata?.role || 'user',
          status: 'Active',
        };
      }
      return data;
    } catch (err) {
      console.warn('[Auth] _fetchProfile threw:', err.message);
      return null;
    }
  };

  // ── Public actions ────────────────────────────────────────────────────────

  const login = async (credentials) => {
    setLoading(true);
    _skipNextEvent.current = true;
    try {
      const res = await apiLoginUser(credentials);
      setCurrentUser(res.user);
      return res;
    } catch (err) {
      _skipNextEvent.current = false;
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    _skipNextEvent.current = true;
    try {
      const res = await apiRegisterUser(userData);
      setCurrentUser(res.user);
      return res;
    } catch (err) {
      _skipNextEvent.current = false;
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    await apiLogoutUser();
  };

  const updateProfileState = (updatedUser) => setCurrentUser(updatedUser);

  if (initialising) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, updateProfileState, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
