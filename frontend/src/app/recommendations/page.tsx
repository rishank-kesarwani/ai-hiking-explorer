'use client';

import React, { useState, useEffect } from 'react';
import { Trail, FitnessLevel } from '../../lib/types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { TrailCard } from '../../components/TrailCard';
import { TrailCardSkeleton } from '../../components/LoadingSkeleton';
import { SafetyBanner } from '../../components/SafetyBanner';
import {
  Sparkles,
  SlidersHorizontal,
  Compass,
  RotateCcw,
  Zap,
} from 'lucide-react';

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>(
    user?.fitnessLevel || 'Intermediate',
  );
  const [selectedTerrains, setSelectedTerrains] = useState<string[]>(
    user?.preferredTerrains || ['Forest', 'Mountain'],
  );
  const [isDogFriendly, setIsDogFriendly] = useState<boolean>(
    user?.dogFriendlyPreference || false,
  );
  const [isFamilyFriendly, setIsFamilyFriendly] = useState<boolean>(
    user?.familyFriendlyPreference || false,
  );

  const [recommendations, setRecommendations] = useState<Trail[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const availableTerrains = [
    'Forest',
    'Mountain',
    'Rocky',
    'Waterfall',
    'Desert',
    'Alpine',
    'River',
  ];

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const data = await api.post<any>('/ai/recommendations', {
        fitnessLevel,
        preferredTerrains: selectedTerrains,
        isDogFriendly,
        isFamilyFriendly,
      });

      setRecommendations(data.recommendations || []);
      setAiSummary(data.aiSummary || null);
    } catch (err: any) {
      console.warn('Failed to load AI recommendations:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [fitnessLevel, selectedTerrains, isDogFriendly, isFamilyFriendly]);

  const toggleTerrain = (terrain: string) => {
    if (selectedTerrains.includes(terrain)) {
      setSelectedTerrains((prev) => prev.filter((t) => t !== terrain));
    } else {
      setSelectedTerrains((prev) => [...prev, terrain]);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          <Sparkles size={16} />
          <span>ALGORITHMIC EXPEDITION MATCHING</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
          Personalized AI <span className="gradient-text">Recommendations</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Trails ranked and justified according to your fitness profile and natural terrain preferences
        </p>
      </div>

      <SafetyBanner />

      {/* Control Bar: Fitness & Preferences */}
      <div
        className="glass-card"
        style={{
          padding: '1.5rem',
          margin: '1.5rem 0 2rem 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Fitness level buttons */}
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Select Fitness Experience:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(['Beginner', 'Intermediate', 'Advanced', 'Expert'] as FitnessLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFitnessLevel(lvl)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: fitnessLevel === lvl ? '#ffffff' : 'var(--text-secondary)',
                    background: fitnessLevel === lvl ? '#10b981' : 'rgba(255,255,255,0.04)',
                    border: fitnessLevel === lvl ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                    transition: 'all 0.2s',
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Dog / Family suitability */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isDogFriendly}
                onChange={(e) => setIsDogFriendly(e.target.checked)}
                style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
              />
              <span>Dog-Friendly</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isFamilyFriendly}
                onChange={(e) => setIsFamilyFriendly(e.target.checked)}
                style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
              />
              <span>Family-Friendly</span>
            </label>
          </div>
        </div>

        {/* Terrains Chips */}
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
            Preferred Terrains:
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {availableTerrains.map((terrain) => {
              const active = selectedTerrains.includes(terrain);
              return (
                <button
                  key={terrain}
                  onClick={() => toggleTerrain(terrain)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    color: active ? '#34d399' : 'var(--text-muted)',
                    background: active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: active ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
                  }}
                >
                  {terrain}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Rationale Banner */}
      {aiSummary && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(56, 189, 248, 0.1) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#f8fafc',
            fontSize: '0.9rem',
          }}
        >
          <Zap size={20} color="#34d399" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#34d399', display: 'block', marginBottom: 2 }}>
              AI Match Synthesis
            </strong>
            {aiSummary}
          </div>
        </div>
      )}

      {/* Recommendations Cards */}
      {isLoading ? (
        <div className="trail-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <TrailCardSkeleton key={i} />
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Sparkles size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No Direct AI Recommendations Found</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem 0' }}>
            Try adjusting your terrain filters or changing your fitness profile.
          </p>
          <button onClick={() => setSelectedTerrains(['Forest', 'Mountain'])} className="btn btn-primary btn-sm">
            Reset Preferences
          </button>
        </div>
      ) : (
        <div className="trail-grid">
          {recommendations.map((trail) => (
            <TrailCard key={trail._id || trail.slug} trail={trail} />
          ))}
        </div>
      )}
    </div>
  );
}
