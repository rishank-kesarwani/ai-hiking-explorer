'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trail } from '../lib/types';
import { api } from '../lib/api';
import { TrailCard } from '../components/TrailCard';
import { TrailCardSkeleton } from '../components/LoadingSkeleton';
import { SafetyBanner } from '../components/SafetyBanner';
import {
  Sparkles,
  Search,
  Compass,
  MapPin,
  CalendarCheck2,
  Waves,
  Sun,
  Dog,
  Tent,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [nlQuery, setNlQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [featuredTrails, setFeaturedTrails] = useState<Trail[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);

  const sampleQueries = [
    'Easy hikes near Delhi for beginners',
    'Find a scenic 5 km hike',
    'Best sunrise hikes this weekend',
    'Show moderate hikes with waterfalls',
  ];

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get<{ trails: Trail[] }>('/trails/featured');
        if (res && res.trails) {
          setFeaturedTrails(res.trails);
        }
      } catch (err: any) {
        console.warn('Could not load featured trails from backend:', err.message);
      } finally {
        setIsLoadingFeatured(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleNlSearch = (queryText: string) => {
    const text = queryText || nlQuery;
    if (!text.trim()) return;
    router.push(`/discover?q=${encodeURIComponent(text.trim())}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '4.5rem 0 3.5rem 0',
          overflow: 'hidden',
        }}
      >
        <div className="container" style={{ textAlign: 'center', maxWidth: '900px' }}>
          {/* AI Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.95rem',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: '0.825rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
            }}
          >
            <Sparkles size={16} />
            <span>AI-POWERED TRAIL EXPEDITION INTELLIGENCE</span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              lineHeight: 1.15,
              fontWeight: 800,
              marginBottom: '1.25rem',
            }}
          >
            Discover Breathtaking Trails & <span className="gradient-text">Plan Safer Hikes</span>
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '2.5rem',
              maxWidth: '720px',
              margin: '0 auto 2.5rem auto',
            }}
          >
            Ask in natural language, explore real-time elevation profiles, inspect meteorological hazard alerts, and generate AI-crafted packing checklists.
          </p>

          {/* Natural Language Query Search Box */}
          <div
            className="glass-card"
            style={{
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              maxWidth: '760px',
              margin: '0 auto 1.5rem auto',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              boxShadow: '0 15px 35px -5px rgba(0,0,0,0.5), 0 0 30px rgba(16, 185, 129, 0.15)',
            }}
          >
            <div style={{ paddingLeft: '0.75rem', display: 'flex', alignItems: 'center' }}>
              <Search size={22} color="#10b981" />
            </div>
            <input
              type="text"
              placeholder='Try "Easy hikes near Delhi for beginners" or "5 km hike with waterfalls"'
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNlSearch(nlQuery)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '1rem',
                padding: '0.65rem 0.25rem',
                outline: 'none',
              }}
            />
            <button
              onClick={() => handleNlSearch(nlQuery)}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.4rem' }}
            >
              <span>Explore AI</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Sample Query Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quick Prompts:</span>
            {sampleQueries.map((query, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setNlQuery(query);
                  handleNlSearch(query);
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.775rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.03)' }}
              >
                &ldquo;{query}&rdquo;
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Notice Strip */}
      <section className="container">
        <SafetyBanner />
      </section>

      {/* Quick Category Discovery Grid */}
      <section style={{ padding: '2.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem' }}>Explore by Experience</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Target your expedition based on terrain, scenery, and companionship
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
            {[
              { title: 'Waterfalls', icon: Waves, color: '#38bdf8', filter: 'hasWaterfall=true' },
              { title: 'Sunrise Hikes', icon: Sun, color: '#fbbf24', filter: 'isSunriseSuitable=true' },
              { title: 'Dog-Friendly', icon: Dog, color: '#34d399', filter: 'isDogFriendly=true' },
              { title: 'Overnight Camps', icon: Tent, color: '#c084fc', filter: 'isCampingAllowed=true' },
              { title: 'Beginner Easy', icon: ShieldCheck, color: '#10b981', filter: 'difficulty=Easy' },
              { title: 'High Mountain', icon: Compass, color: '#f43f5e', filter: 'terrain=Mountain' },
            ].map((cat, i) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={i}
                  href={`/discover?${cat.filter}`}
                  className="glass-card glass-card-hover"
                  style={{
                    padding: '1.25rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.65rem',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: `rgba(255,255,255,0.05)`,
                      border: `1px solid rgba(255,255,255,0.1)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={22} color={cat.color} />
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                    {cat.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Trails Grid */}
      <section style={{ padding: '2.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem' }}>Featured Iconic Expeditions</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Top-rated verified trails across Delhi NCR, Western Ghats, and the Himalayas
              </p>
            </div>
            <Link href="/discover" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>View All Trails</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {isLoadingFeatured ? (
            <div className="trail-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TrailCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="trail-grid">
              {featuredTrails.map((trail) => (
                <TrailCard key={trail._id || trail.slug} trail={trail} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI Planner Banner CTA */}
      <section style={{ padding: '3rem 0 5rem 0' }}>
        <div className="container">
          <div
            className="glass-card"
            style={{
              padding: '2.5rem',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 78, 59, 0.3) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '2rem',
            }}
          >
            <div style={{ maxWidth: '600px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <Zap size={18} />
                <span>INTELLIGENT EXPEDITION ITINERARIES</span>
              </div>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem', lineHeight: 1.25 }}>
                Planning a Weekend Hike? Let AI Build Your Paced Schedule
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                Calculate personalized aerobic pacing, required water liters, sunrise summit departures, and custom packing checklists tailored to real-time weather.
              </p>
            </div>

            <Link href="/plan" className="btn btn-primary btn-lg">
              <CalendarCheck2 size={20} />
              <span>Launch AI Planner</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
