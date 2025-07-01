import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  username: string;
  bio?: string;
  website?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

interface AuthStore {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Actions
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, username: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  error: null,
  isAuthenticated: false,

  signIn: async (email: string, password: string) => {
    if (!supabase) {
      set({ error: 'Supabase is not configured. Please check your environment variables.' });
      return false;
    }

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }

        set({ 
          user: data.user, 
          profile: profileData,
          isAuthenticated: true,
          loading: false 
        });
        return true;
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to sign in',
        loading: false 
      });
    }

    return false;
  },

  signUp: async (email: string, password: string, username: string) => {
    if (!supabase) {
      set({ error: 'Supabase is not configured. Please check your environment variables.' });
      return false;
    }

    set({ loading: true, error: null });

    try {
      // Check if username is already taken using maybeSingle() to handle zero rows
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (existingProfile) {
        set({ 
          error: 'Username is already taken',
          loading: false 
        });
        return false;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Wait a moment for the database trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
          // Fetch the automatically created profile and update it with the username
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            set({ 
              error: 'Failed to fetch user profile. Please try again.',
              loading: false 
            });
            return false;
          }

          // Update the profile with the username if it doesn't already have one
          if (profileData && !profileData.username) {
            const { data: updatedProfile, error: updateError } = await supabase
              .from('profiles')
              .update({ username })
              .eq('id', data.user.id)
              .select()
              .single();

            if (updateError) {
              console.error('Error updating profile with username:', updateError);
              set({ 
                error: 'Failed to set username. Please try again.',
                loading: false 
              });
              return false;
            }

            set({ 
              user: data.user, 
              profile: updatedProfile,
              isAuthenticated: true,
              loading: false 
            });
          } else {
            set({ 
              user: data.user, 
              profile: profileData,
              isAuthenticated: true,
              loading: false 
            });
          }

          return true;
        } catch (profileError: any) {
          console.error('Profile handling error:', profileError);
          set({ 
            error: 'Failed to set up user profile. Please try again.',
            loading: false 
          });
          return false;
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      set({ 
        error: error.message || 'Failed to create account',
        loading: false 
      });
    }

    return false;
  },

  signOut: async () => {
    if (!supabase) return;

    set({ loading: true });

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({ 
        user: null, 
        profile: null,
        isAuthenticated: false,
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to sign out',
        loading: false 
      });
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    if (!supabase || !get().user) {
      set({ error: 'Not authenticated' });
      return false;
    }

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', get().user!.id)
        .select()
        .single();

      if (error) throw error;

      set({ 
        profile: data,
        loading: false 
      });
      return true;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update profile',
        loading: false 
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setProfile: (profile) => set({ profile }),
}));

// Initialize auth state
if (supabase) {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      useAuthStore.getState().setUser(session.user);
      
      // Fetch user profile
      supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            useAuthStore.getState().setProfile(data);
          }
        });
    }
  });

  // Listen for auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      useAuthStore.getState().setUser(session.user);
    } else if (event === 'SIGNED_OUT') {
      useAuthStore.getState().setUser(null);
      useAuthStore.getState().setProfile(null);
    }
  });
}