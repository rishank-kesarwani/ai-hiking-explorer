'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Trail, FitnessLevel } from '../../lib/types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SafetyBanner } from '../../components/SafetyBanner';
import {
  CalendarCheck2,
  Sparkles,
  Clock,
  Droplets,
  Flame,
  Users,
  CheckSquare,
  Square,
  BookmarkPlus,
  Share2,
  AlertCircle,
  MapPin,
} from 'lucide-react';

function PlanContent() {
  const searchParams = useSearchParams();
  const trailParam = searchParams.get('trail') || '';
  const router = useRouter();
  const { user, requireAuth } = useAuth();
  const { showToast } = useToast();

  const [availableTrails, setAvailableTrails] = useState<Trail[]>([]);
  const [selectedTrailSlug, setSelectedTrailSlug] = useState<string>(trailParam);
  const [planTitle, setPlanTitle] = useState('Weekend Expedition');
  const [hikingDate, setHikingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [preferredStartTime, setPreferredStartTime] = useState('06:30');
  const [groupSize, setGroupSize] = useState<number>(2);
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>('Intermediate');
  const [customNotes, setCustomNotes] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<any | null>(null);
  const [checklist, setChecklist] = useState<Array<{ id: string; item: string; isChecked: boolean }>>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchTrails = async () => {
      try {
        const res = await api.get<{ trails: Trail[] }>('/trails/search?limit=30');
        if (res.trails && res.trails.length > 0) {
          setAvailableTrails(res.trails);
          if (!selectedTrailSlug) {
            setSelectedTrailSlug(res.trails[0].slug || res.trails[0]._id);
          }
        }
      } catch (err: any) {
        console.warn('Could not load trails list:', err.message);
      }
    };

    fetchTrails();
  }, [selectedTrailSlug]);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrailSlug) return;
    setIsGenerating(true);

    try {
      const result = await api.post<any>('/ai/itinerary', {
        trailIdOrSlug: selectedTrailSlug,
        hikingDate,
        preferredStartTime,
        fitnessLevel,
        groupSize,
        specialGoals: customNotes,
      });

      setGeneratedItinerary(result);

      // Generate Gear checklist
      const gear = await api.post<any>('/ai/gear-checklist', {
        trailIdOrSlug: selectedTrailSlug,
      });

      const items = [
        ...(gear.categories?.essentials || []),
        ...(gear.categories?.terrainAndWeather || []),
      ].map((g: any, idx: number) => ({
        id: `item_${idx}`,
        item: g.item,
        isChecked: false,
      }));

      setChecklist(items);
      showToast('success', 'AI itinerary & packing schedule generated!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to generate itinerary.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isChecked: !item.isChecked } : item)),
    );
  };

  const handleSaveToAccount = () => {
    if (!generatedItinerary || !selectedTrailSlug) return;

    requireAuth(async () => {
      setIsSaving(true);
      try {
        await api.post('/hiking-plans', {
          title: planTitle,
          trailIdOrSlug: selectedTrailSlug,
          scheduledDate: hikingDate,
          targetStartTime: preferredStartTime,
          participantsCount: groupSize,
          timeline: generatedItinerary.timeline,
          checklistItems: checklist.map((c) => ({
            id: c.id,
            item: c.item,
            isChecked: c.isChecked,
            required: true,
          })),
          customNotes,
        });

        showToast('success', 'Hike plan saved to your account!');
        router.push('/saved');
      } catch (err: any) {
        showToast('error', err.message || 'Failed to save hiking plan.');
      } finally {
        setIsSaving(false);
      }
    });
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          <Sparkles size={16} />
          <span>AI EXPEDITION PLANNER</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
          Plan Your Next <span className="gradient-text">Expedition</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Create an optimized hiking schedule with aerobic pacing, hydration targets, and smart gear checklists
        </p>
      </div>

      <SafetyBanner />

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '2rem', alignItems: 'start', marginTop: '1.5rem' }}>
        {/* Left Config Panel */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarCheck2 size={18} color="#10b981" />
            Trip Configuration
          </h3>

          <form onSubmit={handleGeneratePlan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Plan Name
              </label>
              <input
                type="text"
                required
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Select Trail
              </label>
              <select
                value={selectedTrailSlug}
                onChange={(e) => setSelectedTrailSlug(e.target.value)}
                className="input-field"
                style={{ background: '#090e17' }}
              >
                {availableTrails.map((t) => (
                  <option key={t._id || t.slug} value={t.slug || t._id}>
                    {t.title} ({t.distanceKm}km | {t.difficulty})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Hike Date
                </label>
                <input
                  type="date"
                  required
                  value={hikingDate}
                  onChange={(e) => setHikingDate(e.target.value)}
                  className="input-field"
                  style={{ background: '#090e17' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Departure Time
                </label>
                <input
                  type="time"
                  required
                  value={preferredStartTime}
                  onChange={(e) => setPreferredStartTime(e.target.value)}
                  className="input-field"
                  style={{ background: '#090e17' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Group Size
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={groupSize}
                  onChange={(e) => setGroupSize(parseInt(e.target.value, 10))}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Fitness Level
                </label>
                <select
                  value={fitnessLevel}
                  onChange={(e) => setFitnessLevel(e.target.value as FitnessLevel)}
                  className="input-field"
                  style={{ background: '#090e17' }}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Custom Notes & Goals
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Photography stops, birdwatching, watching sunrise at peak"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="input-field"
                style={{ resize: 'none' }}
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <Sparkles size={16} />
              <span>{isGenerating ? 'Synthesizing Schedule...' : 'Generate AI Plan'}</span>
            </button>
          </form>
        </div>

        {/* Right Output Itinerary & Packing Checklist */}
        <div>
          {generatedItinerary ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Summary Cards Strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                  <Clock size={18} color="#fbbf24" style={{ margin: '0 auto 4px auto' }} />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Duration</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{generatedItinerary.estimatedTotalDurationHours}h</div>
                </div>

                <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                  <Droplets size={18} color="#38bdf8" style={{ margin: '0 auto 4px auto' }} />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Required Water</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>{generatedItinerary.recommendedWaterLiters}L</div>
                </div>

                <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                  <Flame size={18} color="#f43f5e" style={{ margin: '0 auto 4px auto' }} />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Est. Burn</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fb7185' }}>~{generatedItinerary.estimatedCaloriesBurned} kcal</div>
                </div>
              </div>

              {/* Step by Step Timeline */}
              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>
                  Expedition Timeline & Milestones
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {generatedItinerary.timeline?.map((step: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'flex-start',
                        padding: '0.85rem 1rem',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                      }}
                    >
                      <div
                        style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#34d399',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          padding: '0.3rem 0.6rem',
                          borderRadius: '8px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {step.time}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>
                          {step.title}
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginTop: '0.2rem', lineHeight: 1.45 }}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Gear Checklist */}
              {checklist.length > 0 && (
                <div className="glass-card" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                    Interactive Packing Checklist ({checklist.filter((c) => c.isChecked).length}/{checklist.length} packed)
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.5rem' }}>
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.6rem 0.8rem',
                          borderRadius: '8px',
                          background: item.isChecked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)',
                          border: item.isChecked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                        }}
                      >
                        {item.isChecked ? (
                          <CheckSquare size={16} color="#10b981" />
                        ) : (
                          <Square size={16} color="var(--text-muted)" />
                        )}
                        <span style={{ fontSize: '0.825rem', color: item.isChecked ? '#94a3b8' : '#f8fafc', textDecoration: item.isChecked ? 'line-through' : 'none' }}>
                          {item.item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save or Export Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  onClick={handleSaveToAccount}
                  disabled={isSaving}
                  className="btn btn-primary"
                >
                  <BookmarkPlus size={18} />
                  <span>{isSaving ? 'Saving...' : 'Save Plan to My Account'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              className="glass-card"
              style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <CalendarCheck2 size={48} color="var(--text-muted)" />
              <h3 style={{ fontSize: '1.25rem' }}>Configure & Generate Your Hike</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', fontSize: '0.9rem' }}>
                Select a trail on the left panel, customize your scheduled date and departure time, and click &ldquo;Generate AI Plan&rdquo; to build your timeline.
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 360px 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem 0' }}>Loading AI Planner...</div>}>
      <PlanContent />
    </Suspense>
  );
}
