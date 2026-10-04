'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Trail, TrailDifficulty } from '../../lib/types';
import { api } from '../../lib/api';
import { TrailCard } from '../../components/TrailCard';
import { TrailCardSkeleton } from '../../components/LoadingSkeleton';
import { SafetyBanner } from '../../components/SafetyBanner';
import {
  Search,
  Filter,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  LayoutGrid,
  Map as MapIcon,
  AlertCircle,
} from 'lucide-react';

function DiscoverContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialDiff = searchParams.get('difficulty') || '';
  const initialWaterfall = searchParams.get('hasWaterfall') === 'true';
  const initialSunrise = searchParams.get('isSunriseSuitable') === 'true';
  const initialDog = searchParams.get('isDogFriendly') === 'true';
  const initialCamping = searchParams.get('isCampingAllowed') === 'true';
  const initialTerrain = searchParams.get('terrain') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [region, setRegion] = useState('');
  const [difficulty, setDifficulty] = useState<string>(initialDiff);
  const [maxDistance, setMaxDistance] = useState<number>(30);
  const [maxElevation, setMaxElevation] = useState<number>(1500);
  const [hasWaterfall, setHasWaterfall] = useState<boolean>(initialWaterfall);
  const [isSunriseSuitable, setIsSunriseSuitable] = useState<boolean>(initialSunrise);
  const [isDogFriendly, setIsDogFriendly] = useState<boolean>(initialDog);
  const [isCampingAllowed, setIsCampingAllowed] = useState<boolean>(initialCamping);
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'elevation' | 'duration'>('rating');

  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [trails, setTrails] = useState<Trail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTrails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if user entered a complex natural language query
      const isNaturalLanguage =
        searchQuery.trim().split(/\s+/).length > 3 ||
        searchQuery.toLowerCase().includes('for beginners') ||
        searchQuery.toLowerCase().includes('hike') ||
        searchQuery.toLowerCase().includes('near');

      if (isNaturalLanguage && searchQuery.trim().length > 5) {
        const aiRes = await api.post<{
          matchedTrails: Trail[];
          aiSummary: string;
        }>('/ai/nl-search', {
          query: searchQuery,
        });

        if (aiRes && aiRes.matchedTrails) {
          setTrails(aiRes.matchedTrails);
          setAiSummary(aiRes.aiSummary);
          setIsLoading(false);
          return;
        }
      }

      // Standard multi-faceted search
      const params = new URLSearchParams();
      if (searchQuery) params.set('query', searchQuery);
      if (region) params.set('region', region);
      if (difficulty) params.set('difficulty', difficulty);
      if (maxDistance < 30) params.set('maxDistance', maxDistance.toString());
      if (maxElevation < 1500) params.set('maxElevation', maxElevation.toString());
      if (hasWaterfall) params.set('hasWaterfall', 'true');
      if (isSunriseSuitable) params.set('isSunriseSuitable', 'true');
      if (isDogFriendly) params.set('isDogFriendly', 'true');
      if (isCampingAllowed) params.set('isCampingAllowed', 'true');
      if (sortBy) params.set('sortBy', sortBy);

      const res = await api.get<{ trails: Trail[]; total: number }>(
        `/trails/search?${params.toString()}`,
      );
      setTrails(res.trails || []);
      setAiSummary(null);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve trails. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrails();
  }, [region, difficulty, maxDistance, maxElevation, hasWaterfall, isSunriseSuitable, isDogFriendly, isCampingAllowed, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrails();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setRegion('');
    setDifficulty('');
    setMaxDistance(30);
    setMaxElevation(1500);
    setHasWaterfall(false);
    setIsSunriseSuitable(false);
    setIsDogFriendly(false);
    setIsCampingAllowed(false);
    setSortBy('rating');
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
          Discover & Search <span className="gradient-text">Trails</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Filter by difficulty, distance, terrain, and verified suitability tags
        </p>
      </div>

      <SafetyBanner />

      {/* Main Search & Filter Bar */}
      <form onSubmit={handleSearchSubmit} style={{ margin: '1.5rem 0' }}>
        <div
          className="glass-card"
          style={{
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: '1px solid var(--border-focus)',
          }}
        >
          <div style={{ paddingLeft: '0.75rem' }}>
            <Search size={20} color="#10b981" />
          </div>
          <input
            type="text"
            placeholder="Search by trail name, region, terrain or ask natural language prompt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.95rem',
              outline: 'none',
              padding: '0.65rem 0.25rem',
            }}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            <Sparkles size={16} />
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* AI Search Summary Banner (if active) */}
      {aiSummary && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(56, 189, 248, 0.1) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#f8fafc',
            fontSize: '0.9rem',
          }}
        >
          <Sparkles size={20} color="#34d399" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#34d399', display: 'block', marginBottom: 2 }}>
              AI Search Analysis
            </strong>
            {aiSummary}
          </div>
        </div>
      )}

      {/* Layout Grid: Sidebar Filters + Results */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Filter Sidebar */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
              <SlidersHorizontal size={18} color="#10b981" />
              <span>Filter Trails</span>
            </div>
            <button
              onClick={handleResetFilters}
              style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          {/* Region */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="input-field"
              style={{ background: '#090e17' }}
            >
              <option value="">All Regions</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Himachal Pradesh">Himachal Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Uttarakhand">Uttarakhand</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Difficulty Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="input-field"
              style={{ background: '#090e17' }}
            >
              <option value="">Any Difficulty</option>
              <option value="Easy">Easy (Beginner friendly)</option>
              <option value="Moderate">Moderate</option>
              <option value="Hard">Hard (Experienced)</option>
              <option value="Expert">Expert (Alpine / Technical)</option>
            </select>
          </div>

          {/* Max Distance Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              <span>Max Distance</span>
              <strong style={{ color: '#f8fafc' }}>{maxDistance} km</strong>
            </div>
            <input
              type="range"
              min={2}
              max={30}
              step={1}
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: '#10b981' }}
            />
          </div>

          {/* Max Elevation Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              <span>Max Elevation Gain</span>
              <strong style={{ color: '#34d399' }}>+{maxElevation}m</strong>
            </div>
            <input
              type="range"
              min={50}
              max={1500}
              step={50}
              value={maxElevation}
              onChange={(e) => setMaxElevation(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: '#10b981' }}
            />
          </div>

          {/* Suitability Toggles */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Suitability & Features
            </span>

            {[
              { label: 'Waterfall', state: hasWaterfall, set: setHasWaterfall },
              { label: 'Sunrise / Sunset', state: isSunriseSuitable, set: setIsSunriseSuitable },
              { label: 'Dog-Friendly', state: isDogFriendly, set: setIsDogFriendly },
              { label: 'Overnight Camping', state: isCampingAllowed, set: setIsCampingAllowed },
            ].map((toggle, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={toggle.state}
                  onChange={(e) => toggle.set(e.target.checked)}
                  style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                />
                <span>{toggle.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Right Results Column */}
        <div>
          {/* Top Results Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Showing <strong style={{ color: '#f8fafc' }}>{trails.length}</strong> trails
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Sort selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input-field"
                style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.825rem', background: '#0f172a' }}
              >
                <option value="rating">Highest Rated</option>
                <option value="distance">Distance (Shortest first)</option>
                <option value="elevation">Elevation Gain</option>
                <option value="duration">Estimated Duration</option>
              </select>

              {/* View mode toggle */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '0.35rem 0.6rem',
                    borderRadius: '6px',
                    background: viewMode === 'grid' ? '#10b981' : 'transparent',
                    color: '#ffffff',
                  }}
                  title="Grid View"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  style={{
                    padding: '0.35rem 0.6rem',
                    borderRadius: '6px',
                    background: viewMode === 'map' ? '#10b981' : 'transparent',
                    color: '#ffffff',
                  }}
                  title="Map View"
                >
                  <MapIcon size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Content Views */}
          {isLoading ? (
            <div className="trail-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TrailCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div
              className="glass-card"
              style={{
                padding: '3rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <AlertCircle size={40} color="#f43f5e" />
              <h3 style={{ fontSize: '1.25rem' }}>Failed to Load Trails</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>{error}</p>
              <button onClick={() => fetchTrails()} className="btn btn-primary btn-sm">
                Try Again
              </button>
            </div>
          ) : trails.length === 0 ? (
            <div
              className="glass-card"
              style={{
                padding: '3.5rem 2rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <Search size={40} color="var(--text-muted)" />
              <h3 style={{ fontSize: '1.25rem' }}>No matching trails found</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', fontSize: '0.9rem' }}>
                We couldn&apos;t find trails matching all your active filters. Try broadening your distance limit or clearing specific tag constraints.
              </p>
              <button onClick={handleResetFilters} className="btn btn-secondary btn-sm">
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="trail-grid">
              {trails.map((trail) => (
                <TrailCard key={trail._id || trail.slug} trail={trail} />
              ))}
            </div>
          ) : (
            /* Interactive Trail Map View */
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Interactive Trailhead Map Coordinates (Geospatial View):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {trails.map((t) => (
                  <div
                    key={t._id || t.slug}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                    }}
                  >
                    <strong style={{ color: '#34d399', fontSize: '0.95rem' }}>{t.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      GPS: [{t.location?.coordinates?.[1]?.toFixed(4)}, {t.location?.coordinates?.[0]?.toFixed(4)}]
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#e2e8f0', marginTop: '0.25rem' }}>
                      {t.distanceKm} km | {t.difficulty} | +{t.elevationGainM}m elevation
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 860px) {
          div[style*="grid-template-columns: 280px 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem 0' }}><TrailCardSkeleton /></div>}>
      <DiscoverContent />
    </Suspense>
  );
}
