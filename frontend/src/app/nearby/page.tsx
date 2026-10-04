'use client';

import React, { useState, useEffect } from 'react';
import { Trail } from '../../lib/types';
import { api } from '../../lib/api';
import { TrailCard } from '../../components/TrailCard';
import { TrailCardSkeleton } from '../../components/LoadingSkeleton';
import { SafetyBanner } from '../../components/SafetyBanner';
import {
  Navigation,
  MapPin,
  SlidersHorizontal,
  Compass,
  AlertCircle,
  LocateFixed,
} from 'lucide-react';

export default function NearbyPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('Delhi NCR');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(50);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('Using Delhi NCR coordinates');
  const [error, setError] = useState<string | null>(null);

  // Default coordinate presets
  const cityPresets: Record<string, { lat: number; lng: number }> = {
    'Delhi NCR': { lat: 28.5583, lng: 77.1264 },
    'Himachal (Dharamshala/Triund)': { lat: 32.2577, lng: 76.3533 },
    'Maharashtra (Western Ghats)': { lat: 18.4239, lng: 73.3854 },
    'Uttarakhand (Mussoorie/Nag Tibba)': { lat: 30.5847, lng: 78.1528 },
  };

  const detectBrowserLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsDetectingGps(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationStatus(
            `GPS Coordinates: [${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}]`,
          );
          setIsDetectingGps(false);
        },
        (err) => {
          console.warn('Geolocation denied or failed, using preset:', err.message);
          setUserLocation(cityPresets['Delhi NCR']);
          setLocationStatus('GPS unavailable. Using Delhi NCR baseline.');
          setIsDetectingGps(false);
        },
        { timeout: 8000 },
      );
    } else {
      setUserLocation(cityPresets['Delhi NCR']);
    }
  };

  useEffect(() => {
    detectBrowserLocation();
  }, []);

  const fetchNearbyTrails = async () => {
    if (!userLocation) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.get<{ trails: Trail[] }>(
        `/trails/nearby?latitude=${userLocation.lat}&longitude=${userLocation.lng}&maxDistanceKm=${maxDistanceKm}&limit=12`,
      );
      setTrails(res.trails || []);
    } catch (err: any) {
      setError(err.message || 'Failed to search nearby trails.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation) {
      fetchNearbyTrails();
    }
  }, [userLocation, maxDistanceKm]);

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    const preset = cityPresets[cityName];
    if (preset) {
      setUserLocation(preset);
      setLocationStatus(`Preset: ${cityName} coordinates`);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          <Compass size={16} />
          <span>GEOSPATIAL TRAILHEAD LOCATOR</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
          Nearby Trails & <span className="gradient-text">Trailheads</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Find hiking trails ranked by accurate straight-line distance to your current location
        </p>
      </div>

      <SafetyBanner />

      {/* Control Bar */}
      <div
        className="glass-card"
        style={{
          padding: '1.5rem',
          margin: '1.5rem 0 2rem 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          alignItems: 'end',
        }}
      >
        {/* City preset */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            Current Region Preset
          </label>
          <select
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            className="input-field"
            style={{ background: '#090e17' }}
          >
            {Object.keys(cityPresets).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* GPS Button */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            Browser GPS
          </label>
          <button
            type="button"
            onClick={detectBrowserLocation}
            disabled={isDetectingGps}
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            <LocateFixed size={18} color="#34d399" />
            <span>{isDetectingGps ? 'Locating...' : 'Use My GPS'}</span>
          </button>
        </div>

        {/* Search Radius */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            <span>Search Radius</span>
            <strong style={{ color: '#34d399' }}>{maxDistanceKm} km</strong>
          </div>
          <input
            type="range"
            min={10}
            max={150}
            step={5}
            value={maxDistanceKm}
            onChange={(e) => setMaxDistanceKm(parseInt(e.target.value, 10))}
            style={{ width: '100%', accentColor: '#10b981' }}
          />
        </div>
      </div>

      <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <MapPin size={14} color="#38bdf8" />
        <span>{locationStatus}</span>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="trail-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <TrailCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertCircle size={40} color="#f43f5e" style={{ margin: '0 auto 1rem auto' }} />
          <h3>Error Fetching Nearby Trails</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1rem 0' }}>{error}</p>
          <button onClick={fetchNearbyTrails} className="btn btn-primary btn-sm">
            Retry Search
          </button>
        </div>
      ) : trails.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <Navigation size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No trails found within {maxDistanceKm} km</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem 0' }}>
            Try increasing the radius slider up to 150 km or select a different region preset.
          </p>
          <button onClick={() => setMaxDistanceKm(100)} className="btn btn-primary btn-sm">
            Expand Radius to 100 km
          </button>
        </div>
      ) : (
        <div className="trail-grid">
          {trails.map((trail) => (
            <TrailCard key={trail._id || trail.slug} trail={trail} />
          ))}
        </div>
      )}
    </div>
  );
}
