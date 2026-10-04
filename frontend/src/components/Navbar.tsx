'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  MapPin,
  CalendarCheck2,
  Sparkles,
  Heart,
  BookmarkCheck,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Search,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Discover', href: '/discover', icon: Compass },
    { name: 'Nearby Trails', href: '/nearby', icon: MapPin },
    { name: 'AI Planner', href: '/plan', icon: CalendarCheck2 },
    { name: 'AI Matches', href: '/recommendations', icon: Sparkles },
    { name: 'Saved Hikes', href: '/saved', icon: BookmarkCheck, requiresAuth: true },
    { name: 'Favorites', href: '/favorites', icon: Heart, requiresAuth: true },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(9, 14, 23, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Brand Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Compass size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              AI HIKING <span style={{ color: '#10b981' }}>EXPLORER</span>
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Smart Trail Discovery
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="desktop-nav">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: isActive ? '#34d399' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={16} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Auth Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                href="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#10b981',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>
                  {user.name?.split(' ')[0]}
                </span>
              </Link>

              <button
                onClick={() => logout()}
                className="btn btn-secondary btn-sm"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openLoginModal()}
              className="btn btn-primary btn-sm"
            >
              <UserIcon size={16} />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-menu-btn"
            style={{
              padding: '0.5rem',
              color: 'var(--text-secondary)',
              display: 'none',
            }}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            background: '#090e17',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  color: isActive ? '#34d399' : '#f8fafc',
                  background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                }}
              >
                <Icon size={18} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 900px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
};
