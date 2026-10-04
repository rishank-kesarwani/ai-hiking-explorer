'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Lock, Mail, User as UserIcon, Sparkles } from 'lucide-react';
import { FitnessLevel } from '../lib/types';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login, register } = useAuth();
  const { showToast } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>('Beginner');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please provide your name');
        await register(email, password, name, fitnessLevel);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please check your credentials.';
      setError(msg);
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeLoginModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="#10b981" />
              {isRegister ? 'Join AI Hiking Explorer' : 'Welcome Back Hiker'}
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {isRegister
                ? 'Unlock personalized AI recommendations & trip saving'
                : 'Sign in to access your saved trails and plans'}
            </p>
          </div>
          <button onClick={closeLoginModal} style={{ color: 'var(--text-muted)', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(null); }}
            style={{
              flex: 1,
              padding: '0.75rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: !isRegister ? '#10b981' : 'var(--text-muted)',
              borderBottom: !isRegister ? '2px solid #10b981' : 'none',
              background: !isRegister ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(null); }}
            style={{
              flex: 1,
              padding: '0.75rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: isRegister ? '#10b981' : 'var(--text-muted)',
              borderBottom: isRegister ? '2px solid #10b981' : 'none',
              background: isRegister ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                color: '#fb7185',
                fontSize: '0.85rem',
              }}
            >
              {error}
            </div>
          )}

          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex River"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2.4rem' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Your Hiking Experience Level
              </label>
              <select
                value={fitnessLevel}
                onChange={(e) => setFitnessLevel(e.target.value as FitnessLevel)}
                className="input-field"
                style={{ background: '#0b1120' }}
              >
                <option value="Beginner">Beginner (0-5 km, gentle trails)</option>
                <option value="Intermediate">Intermediate (5-15 km, rolling hills)</option>
                <option value="Advanced">Advanced (15-25 km, steep ridges)</option>
                <option value="Expert">Expert (25+ km, technical alpine peaks)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {isSubmitting
              ? 'Authenticating...'
              : isRegister
              ? 'Create Explorer Account'
              : 'Sign In to Explorer'}
          </button>
        </form>
      </div>
    </div>
  );
};
