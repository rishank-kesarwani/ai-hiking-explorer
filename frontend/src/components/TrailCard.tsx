'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trail } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import {
  Heart,
  MapPin,
  Mountain,
  Clock,
  Navigation,
  Sparkles,
  Waves,
  Sun,
  Dog,
  Tent,
} from 'lucide-react';

interface TrailCardProps {
  trail: Trail;
  isFavorited?: boolean;
  onFavoriteChange?: (trailId: string, isFav: boolean) => void;
}

export const TrailCard: React.FC<TrailCardProps> = ({
  trail,
  isFavorited: initialFav = false,
  onFavoriteChange,
}) => {
  const { user, requireAuth } = useAuth();
  const { showToast } = useToast();
  const [isFav, setIsFav] = useState(initialFav);
  const [isTogglingFav, setIsTogglingFav] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    requireAuth(async () => {
      setIsTogglingFav(true);
      try {
        const res = await api.post<{ isFavorite: boolean; message: string }>(
          `/favorites/toggle/${trail._id || trail.slug}`,
        );
        setIsFav(res.isFavorite);
        showToast(res.isFavorite ? 'success' : 'info', res.message);
        if (onFavoriteChange) {
          onFavoriteChange(trail._id, res.isFavorite);
        }
      } catch (err: any) {
        showToast('error', err.message || 'Could not update favorites');
      } finally {
        setIsTogglingFav(false);
      }
    });
  };

  const getDifficultyBadgeClass = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'badge-easy';
      case 'moderate':
        return 'badge-moderate';
      case 'hard':
        return 'badge-hard';
      case 'expert':
        return 'badge-expert';
      default:
        return 'badge-moderate';
    }
  };

  const fallbackImage =
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80';
  const displayImage =
    trail.images && trail.images.length > 0 ? trail.images[0] : fallbackImage;

  const durationHours = (trail.estimatedDurationMin / 60).toFixed(1);

  return (
    <div className="glass-card glass-card-hover" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Image & Overlay */}
      <Link href={`/trails/${trail.slug || trail._id}`} style={{ position: 'relative', display: 'block', height: '190px' }}>
        <img
          src={displayImage}
          alt={trail.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          loading="lazy"
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(9, 14, 23, 0.95) 0%, rgba(9, 14, 23, 0.2) 60%, transparent 100%)',
          }}
        />

        {/* Top Badges */}
        <div
          style={{
            position: 'absolute',
            top: '0.85rem',
            left: '0.85rem',
            right: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 2,
          }}
        >
          <span className={`badge ${getDifficultyBadgeClass(trail.difficulty)}`}>
            {trail.difficulty}
          </span>

          <button
            onClick={handleFavoriteClick}
            disabled={isTogglingFav}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isFav ? '#f43f5e' : '#ffffff',
              transition: 'transform 0.2s ease',
            }}
          >
            <Heart size={18} fill={isFav ? '#f43f5e' : 'none'} />
          </button>
        </div>

        {/* Calculated distance tag if nearby query */}
        {trail.calculatedDistanceKm !== undefined && (
          <div
            style={{
              position: 'absolute',
              bottom: '0.75rem',
              left: '0.85rem',
              background: 'rgba(16, 185, 129, 0.9)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.55rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Navigation size={12} />
            {trail.calculatedDistanceKm} km from you
          </div>
        )}
      </Link>

      {/* Card Content */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
            <MapPin size={14} color="#38bdf8" />
            <span>{trail.region}, {trail.country}</span>
          </div>

          <Link href={`/trails/${trail.slug || trail._id}`}>
            <h3
              style={{
                fontSize: '1.15rem',
                lineHeight: 1.35,
                color: '#ffffff',
                fontWeight: 700,
                transition: 'color 0.2s ease',
              }}
            >
              {trail.title}
            </h3>
          </Link>
        </div>

        {/* AI Match Badge & Reasoning (if present) */}
        {(trail.aiMatchScore || trail.aiScore || trail.recommendationReason || trail.personalizedReason) && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(56, 189, 248, 0.08) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '10px',
              padding: '0.6rem 0.75rem',
              fontSize: '0.8rem',
              lineHeight: 1.4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontWeight: 700, marginBottom: '0.2rem' }}>
              <Sparkles size={14} />
              <span>AI Match {trail.aiMatchScore || trail.aiScore}%</span>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.775rem' }}>
              {trail.recommendationReason || trail.personalizedReason}
            </p>
          </div>
        )}

        {/* Trail Metrics Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '0.65rem 0.5rem',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Distance</div>
            <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#f8fafc' }}>
              {trail.distanceKm} km
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Elevation</div>
            <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#34d399' }}>
              +{trail.elevationGainM}m
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Est. Time</div>
            <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#fbbf24' }}>
              {durationHours}h
            </div>
          </div>
        </div>

        {/* Feature Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: 'auto' }}>
          {trail.hasWaterfall && (
            <span className="tag-pill" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
              <Waves size={12} /> Waterfall
            </span>
          )}
          {trail.isSunriseSuitable && (
            <span className="tag-pill" style={{ color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.3)' }}>
              <Sun size={12} /> Sunrise
            </span>
          )}
          {trail.isDogFriendly && (
            <span className="tag-pill" style={{ color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.3)' }}>
              <Dog size={12} /> Dog-Friendly
            </span>
          )}
          {trail.isCampingAllowed && (
            <span className="tag-pill" style={{ color: '#c084fc', borderColor: 'rgba(192, 132, 252, 0.3)' }}>
              <Tent size={12} /> Camping
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
