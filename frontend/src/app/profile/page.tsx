'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { FitnessLevel, User } from '../../lib/types';
import {
  User as UserIcon,
  Bell,
  Sliders,
  CheckCircle2,
  LogOut,
  Save,
  Shield,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, openLoginModal, logout, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>(
    user?.fitnessLevel || 'Beginner',
  );
  const [dogFriendly, setDogFriendly] = useState<boolean>(
    user?.dogFriendlyPreference || false,
  );
  const [familyFriendly, setFamilyFriendly] = useState<boolean>(
    user?.familyFriendlyPreference || false,
  );
  const [hikeReminders, setHikeReminders] = useState<boolean>(
    user?.notificationSettings?.upcomingHikeReminders ?? true,
  );
  const [weatherAlerts, setWeatherAlerts] = useState<boolean>(
    user?.notificationSettings?.weatherAlerts ?? true,
  );
  const [gearReminders, setGearReminders] = useState<boolean>(
    user?.notificationSettings?.gearChecklistReminders ?? true,
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setFitnessLevel(user.fitnessLevel || 'Beginner');
      setDogFriendly(user.dogFriendlyPreference || false);
      setFamilyFriendly(user.familyFriendlyPreference || false);
      setHikeReminders(user.notificationSettings?.upcomingHikeReminders ?? true);
      setWeatherAlerts(user.notificationSettings?.weatherAlerts ?? true);
      setGearReminders(user.notificationSettings?.gearChecklistReminders ?? true);
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '3.5rem 2rem', maxWidth: '500px', margin: '0 auto' }}>
          <UserIcon size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
          <h2>Sign In to Manage Your Profile</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0.75rem 0 1.5rem 0' }}>
            Configure your fitness limits, preferred terrains, and notification preferences.
          </p>
          <button onClick={() => openLoginModal()} className="btn btn-primary">
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await api.put('/users/profile', {
        name,
        bio,
        fitnessLevel,
        dogFriendlyPreference: dogFriendly,
        familyFriendlyPreference: familyFriendly,
        notificationSettings: {
          upcomingHikeReminders: hikeReminders,
          weatherAlerts,
          gearChecklistReminders: gearReminders,
        },
      });

      await refreshUser();
      showToast('success', 'Profile and preferences updated successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem', maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
          Explorer <span className="gradient-text">Profile & Settings</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Manage your fitness parameters, companion preferences, and expedition alerts
        </p>
      </div>

      <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Basic Details */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserIcon size={18} color="#10b981" />
            Account Information
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="input-field"
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Explorer Bio
              </label>
              <textarea
                rows={3}
                placeholder="Trail enthusiast, peak bagger, nature photographer..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input-field"
                style={{ resize: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Hiking Experience & Limits */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={18} color="#10b981" />
            Hiking Experience & Defaults
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Fitness / Experience Level
              </label>
              <select
                value={fitnessLevel}
                onChange={(e) => setFitnessLevel(e.target.value as FitnessLevel)}
                className="input-field"
                style={{ background: '#090e17' }}
              >
                <option value="Beginner">Beginner (0-5 km, gentle trails)</option>
                <option value="Intermediate">Intermediate (5-15 km, rolling hills)</option>
                <option value="Advanced">Advanced (15-25 km, steep ridges)</option>
                <option value="Expert">Expert (25+ km, technical alpine peaks)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={dogFriendly}
                  onChange={(e) => setDogFriendly(e.target.checked)}
                  style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                />
                <span>Default to Dog-Friendly Trails</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={familyFriendly}
                  onChange={(e) => setFamilyFriendly(e.target.checked)}
                  style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                />
                <span>Default to Family-Friendly Trails</span>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} color="#10b981" />
            Notification Preferences
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={hikeReminders}
                onChange={(e) => setHikeReminders(e.target.checked)}
                style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
              />
              <span>24h Upcoming Hike Reminders</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={weatherAlerts}
                onChange={(e) => setWeatherAlerts(e.target.checked)}
                style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
              />
              <span>Weather Hazard & Severe Rain Alerts</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={gearReminders}
                onChange={(e) => setGearReminders(e.target.checked)}
                style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
              />
              <span>Packing & Gear Preparation Prompts</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => logout()}
            className="btn btn-secondary"
            style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary"
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
