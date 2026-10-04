'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trail, WeatherForecast, FitnessLevel } from '../../../lib/types';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { ElevationChart } from '../../../components/ElevationChart';
import { WeatherWidget } from '../../../components/WeatherWidget';
import { SafetyBanner } from '../../../components/SafetyBanner';
import { TrailDetailsSkeleton } from '../../../components/LoadingSkeleton';
import {
  Mountain,
  MapPin,
  Clock,
  Compass,
  Heart,
  CalendarCheck2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Waves,
  Sun,
  Dog,
  Tent,
  ArrowLeft,
  CheckSquare,
  Square,
  ShieldCheck,
} from 'lucide-react';

export default function TrailDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;
  const router = useRouter();
  const { user, requireAuth } = useAuth();
  const { showToast } = useToast();

  const [trail, setTrail] = useState<Trail | null>(null);
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Feature States
  const [aiDifficulty, setAiDifficulty] = useState<any | null>(null);
  const [selectedFitness, setSelectedFitness] = useState<FitnessLevel>('Intermediate');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [gearChecklist, setGearChecklist] = useState<any | null>(null);
  const [isOvernightCamping, setIsOvernightCamping] = useState(false);
  const [packedItems, setPackedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchTrailAndData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const trailData = await api.get<Trail>(`/trails/${slug}`);
        setTrail(trailData);

        // Fetch Weather
        if (trailData.location?.coordinates) {
          const [lng, lat] = trailData.location.coordinates;
          fetchWeather(lat, lng);
        }

        // Fetch Favorite status if user is logged in
        if (user) {
          try {
            const favRes = await api.get<{ isFavorite: boolean }>(`/favorites/status/${trailData._id || slug}`);
            setIsFavorited(favRes.isFavorite);
          } catch {
            // Ignore for guest
          }
        }

        // Trigger AI Difficulty Analysis
        fetchAiDifficulty(trailData.slug || trailData._id, user?.fitnessLevel || 'Intermediate');

        // Trigger Dynamic Gear Checklist
        fetchGearChecklist(trailData.slug || trailData._id, false);
      } catch (err: any) {
        setError(err.message || 'Could not load trail details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrailAndData();
  }, [slug, user]);

  const fetchWeather = async (lat: number, lon: number) => {
    setIsLoadingWeather(true);
    try {
      const wData = await api.get<WeatherForecast>(`/weather/forecast?lat=${lat}&lon=${lon}`);
      setWeather(wData);
    } catch (err: any) {
      console.warn('Weather fetch failed:', err.message);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const fetchAiDifficulty = async (trailIdOrSlug: string, fitness: FitnessLevel) => {
    try {
      const data = await api.get<any>(`/ai/difficulty-explanation/${trailIdOrSlug}?fitnessLevel=${fitness}`);
      setAiDifficulty(data);
    } catch {
      // Fallback
    }
  };

  const fetchGearChecklist = async (trailIdOrSlug: string, overnight: boolean) => {
    try {
      const data = await api.post<any>('/ai/gear-checklist', {
        trailIdOrSlug,
        isOvernightCamping: overnight,
      });
      setGearChecklist(data);
    } catch {
      // Fallback
    }
  };

  const handleFitnessChange = (newFitness: FitnessLevel) => {
    setSelectedFitness(newFitness);
    if (trail) {
      fetchAiDifficulty(trail.slug || trail._id, newFitness);
    }
  };

  const handleCampingToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsOvernightCamping(checked);
    if (trail) {
      fetchGearChecklist(trail.slug || trail._id, checked);
    }
  };

  const togglePacked = (itemKey: string) => {
    setPackedItems((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

  const handleToggleFavorite = () => {
    if (!trail) return;
    requireAuth(async () => {
      try {
        const res = await api.post<{ isFavorite: boolean; message: string }>(
          `/favorites/toggle/${trail._id || trail.slug}`,
        );
        setIsFavorited(res.isFavorite);
        showToast(res.isFavorite ? 'success' : 'info', res.message);
      } catch (err: any) {
        showToast('error', err.message || 'Could not update favorites');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
        <TrailDetailsSkeleton />
      </div>
    );
  }

  if (error || !trail) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '3rem', maxWidth: '500px', margin: '0 auto' }}>
          <AlertTriangle size={48} color="#f43f5e" style={{ margin: '0 auto 1rem auto' }} />
          <h2>Trail Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0.75rem 0 1.5rem 0' }}>
            {error || 'The requested trail could not be located.'}
          </p>
          <Link href="/discover" className="btn btn-primary">
            Back to Trail Search
          </Link>
        </div>
      </div>
    );
  }

  const durationHours = (trail.estimatedDurationMin / 60).toFixed(1);

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 5rem 1.5rem' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          href="/discover"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            transition: 'color 0.2s ease',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Discovery</span>
        </Link>
      </div>

      {/* Hero Visual Banner */}
      <div
        style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          height: '380px',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '2rem',
        }}
      >
        <img
          src={trail.images?.[0] || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'}
          alt={trail.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(9, 14, 23, 0.95) 0%, rgba(9, 14, 23, 0.35) 60%, rgba(9, 14, 23, 0.1) 100%)',
          }}
        />

        {/* Hero Overlay Info */}
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '2rem',
            right: '2rem',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div style={{ maxWidth: '700px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span className={`badge badge-${trail.difficulty?.toLowerCase()}`}>
                {trail.difficulty}
              </span>
              <span className="tag-pill" style={{ background: 'rgba(0,0,0,0.5)', color: '#ffffff' }}>
                <MapPin size={12} /> {trail.region}, {trail.country}
              </span>
              <span className="tag-pill" style={{ background: 'rgba(0,0,0,0.5)', color: '#fbbf24' }}>
                ★ {trail.rating} ({trail.reviewCount} reviews)
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#ffffff', lineHeight: 1.2 }}>
              {trail.title}
            </h1>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleToggleFavorite}
              className="btn btn-secondary"
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                color: isFavorited ? '#f43f5e' : '#ffffff',
                borderColor: isFavorited ? 'rgba(244, 63, 94, 0.4)' : 'rgba(255,255,255,0.15)',
              }}
            >
              <Heart size={18} fill={isFavorited ? '#f43f5e' : 'none'} />
              <span>{isFavorited ? 'Saved in Favorites' : 'Save Trail'}</span>
            </button>

            <Link href={`/plan?trail=${trail.slug || trail._id}`} className="btn btn-primary">
              <CalendarCheck2 size={18} />
              <span>Plan This Hike</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Safety Banner */}
      <SafetyBanner customMessage={trail.safetyDisclaimer} />

      {/* Key Metrics Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          margin: '1.5rem 0 2rem 0',
        }}
      >
        <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trail Distance</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
            {trail.distanceKm} <span style={{ fontSize: '0.9rem' }}>km</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Elevation Gain</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginTop: 4 }}>
            +{trail.elevationGainM} <span style={{ fontSize: '0.9rem' }}>m</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Peak Altitude</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
            {trail.highestPointM} <span style={{ fontSize: '0.9rem' }}>m</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Est. Duration</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>
            {durationHours} <span style={{ fontSize: '0.9rem' }}>hours</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout: 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Description, Elevation Chart, Waypoints, AI Gear */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Overview */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.85rem' }}>Trail Overview</h3>
            <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '0.95rem' }}>
              {trail.description}
            </p>

            {/* Suitability Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.25rem' }}>
              {trail.hasWaterfall && (
                <span className="tag-pill" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}>
                  <Waves size={14} /> Scenic Waterfall
                </span>
              )}
              {trail.isSunriseSuitable && (
                <span className="tag-pill" style={{ color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.4)' }}>
                  <Sun size={14} /> Sunrise Vantage
                </span>
              )}
              {trail.isDogFriendly && (
                <span className="tag-pill" style={{ color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.4)' }}>
                  <Dog size={14} /> Dog Friendly
                </span>
              )}
              {trail.isCampingAllowed && (
                <span className="tag-pill" style={{ color: '#c084fc', borderColor: 'rgba(192, 132, 252, 0.4)' }}>
                  <Tent size={14} /> Camping Permitted
                </span>
              )}
            </div>
          </div>

          {/* Interactive Elevation Profile Graph */}
          <ElevationChart
            profile={trail.elevationProfile}
            distanceKm={trail.distanceKm}
            elevationGainM={trail.elevationGainM}
            highestPointM={trail.highestPointM}
          />

          {/* Route Waypoints */}
          {trail.waypoints && trail.waypoints.length > 0 && (
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass size={20} color="#10b981" />
                Route Waypoints & Landmarks
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {trail.waypoints.map((wp, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'flex-start',
                      padding: '0.85rem',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid #10b981',
                        color: '#34d399',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>{wp.title}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {wp.distanceFromStartKm} km | {wp.elevationM}m elev
                        </span>
                      </div>
                      {wp.description && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginTop: '0.25rem' }}>
                          {wp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic AI Gear Checklist */}
          {gearChecklist && (
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={20} color="#10b981" />
                  AI Packing & Gear Checklist
                </h3>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#e2e8f0', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isOvernightCamping}
                    onChange={handleCampingToggle}
                    style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                  />
                  <span>Overnight Camping Mode</span>
                </label>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {gearChecklist.categories?.essentials?.map((item: any, i: number) => {
                  const key = `ess_${i}`;
                  const isChecked = !!packedItems[key];
                  return (
                    <div
                      key={key}
                      onClick={() => togglePacked(key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)',
                        border: isChecked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {isChecked ? (
                        <CheckSquare size={18} color="#10b981" />
                      ) : (
                        <Square size={18} color="var(--text-muted)" />
                      )}
                      <span
                        style={{
                          fontSize: '0.875rem',
                          color: isChecked ? '#94a3b8' : '#f8fafc',
                          textDecoration: isChecked ? 'line-through' : 'none',
                        }}
                      >
                        {item.item}
                      </span>
                    </div>
                  );
                })}

                {gearChecklist.categories?.terrainAndWeather?.map((item: any, i: number) => {
                  const key = `ter_${i}`;
                  const isChecked = !!packedItems[key];
                  return (
                    <div
                      key={key}
                      onClick={() => togglePacked(key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)',
                        border: isChecked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                      }}
                    >
                      {isChecked ? (
                        <CheckSquare size={18} color="#10b981" />
                      ) : (
                        <Square size={18} color="var(--text-muted)" />
                      )}
                      <span
                        style={{
                          fontSize: '0.875rem',
                          color: isChecked ? '#94a3b8' : '#f8fafc',
                          textDecoration: isChecked ? 'line-through' : 'none',
                        }}
                      >
                        {item.item}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Weather & AI Fitness Suitability */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Live Weather Forecast */}
          <WeatherWidget weather={weather} isLoading={isLoadingWeather} />

          {/* AI Difficulty & Suitability Analysis */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Sparkles size={20} color="#34d399" />
              <h3 style={{ fontSize: '1.15rem' }}>AI Fitness Suitability</h3>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Test against your fitness level:
              </label>
              <select
                value={selectedFitness}
                onChange={(e) => handleFitnessChange(e.target.value as FitnessLevel)}
                className="input-field"
                style={{ background: '#090e17' }}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            {aiDifficulty && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '10px',
                    padding: '0.75rem',
                    fontSize: '0.85rem',
                    color: '#f8fafc',
                    lineHeight: 1.45,
                  }}
                >
                  {aiDifficulty.recommendationSummary}
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <strong>Estimated Aerobic Pace:</strong> {aiDifficulty.estimatedPace}
                </div>

                <div>
                  <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Key Challenge Factors:
                  </strong>
                  <ul style={{ paddingLeft: '1.1rem', fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {aiDifficulty.analysisFactors?.map((f: string, i: number) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 860px) {
          div[style*="grid-template-columns: 1.6fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
