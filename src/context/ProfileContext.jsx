/**
 * Profile context. Tracks whether user has completed onboarding.
 */
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { fetchProfile, deleteProfile } from '../services/profileService';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchProfile(user.id)
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const refreshProfile = async () => {
    if (!user?.id) return;
    const p = await fetchProfile(user.id);
    setProfile(p);
  };

  const resetProfile = async () => {
    if (!user?.id) return;
    await deleteProfile(user.id);
    setProfile(null);
  };

  const hasProfile = !!profile;

  return (
    <ProfileContext.Provider value={{ profile, hasProfile, loading, refreshProfile, resetProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return ctx;
}
