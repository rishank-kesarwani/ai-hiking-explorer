'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trail } from '../../lib/types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { TrailCard } from '../../components/TrailCard';
import { TrailCardSkeleton } from '../../components/LoadingSkeleton';
import { Heart, Compass, Search } from 'lucide-react';

export default function FavoritesPage() {
  const { isAuthenticated, openLoginModal } = useAuth();
  const [favoriteTrails, setFavoriteTrails] = useState<Trail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.get<Array<{ trail: Trail }>>('/favorites');
      const trails = (data || []).map((item) => item.trail).filter(Boolean);
      setFavoriteTrails(trails);
    } catch (err: any) {
      console.warn('Failed to load favorites:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [isAuthenticated]);

  const handleFavoriteChange = (trailId: string, isFav: boolean) => {
    if (!isFav) {
      setFavoriteTrails((prev) => prev.filter((t) => t._id !== trailId));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '3.5rem 2rem', maxWidth: '520px', margin: '0 auto' }}>
          <Heart size={48} color="#f43f5e" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>Sign In to View Favorites</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Bookmark trails you love, save dream expeditions, and access them across all your devices.
          </p>
          <button onClick={() => openLoginModal()} className="btn btn-primary">
            Sign In / Create Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
          My Favorite <span className="gradient-text">Trails</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Bookmarked expeditions and scenic hiking routes
        </p>
      </div>

      {isLoading ? (
        <div className="trail-grid">
          {[1, 2, 3].map((i) => (
            <TrailCardSkeleton key={i} />
          ))}
        </div>
      ) : favoriteTrails.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Heart size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No Favorite Trails Saved Yet</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem 0' }}>
            Click the heart icon on any trail card or details page to add it to your personal favorites.
          </p>
          <Link href="/discover" className="btn btn-primary">
            Explore Trails
          </Link>
        </div>
      ) : (
        <div className="trail-grid">
          {favoriteTrails.map((trail) => (
            <TrailCard
              key={trail._id || trail.slug}
              trail={trail}
              isFavorited={true}
              onFavoriteChange={handleFavoriteChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
