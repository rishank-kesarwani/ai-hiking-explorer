import React from 'react';
import { WeatherForecast } from '../lib/types';
import {
  CloudSun,
  Wind,
  Droplets,
  Sun,
  Sunset,
  AlertTriangle,
  Compass,
} from 'lucide-react';

interface WeatherWidgetProps {
  weather: WeatherForecast | null;
  isLoading?: boolean;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  weather,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="skeleton" style={{ height: '28px', width: '40%' }} />
        <div className="skeleton" style={{ height: '80px', width: '100%' }} />
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CloudSun size={22} color="#38bdf8" />
          <h4 style={{ fontSize: '1.1rem' }}>Trailhead Weather & Forecast</h4>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Provider: {weather.provider}
        </span>
      </div>

      {/* Hazard Warning Alert */}
      {weather.isHazardous && weather.hazardWarnings.length > 0 && (
        <div
          style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem',
          }}
        >
          <AlertTriangle size={20} color="#f43f5e" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong style={{ color: '#fb7185', fontSize: '0.875rem', display: 'block', marginBottom: 3 }}>
              Hazardous Weather Advisory
            </strong>
            <ul style={{ paddingLeft: '1.2rem', color: '#f8fafc', fontSize: '0.825rem' }}>
              {weather.hazardWarnings.map((warn, i) => (
                <li key={i}>{warn}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Current Conditions Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '0.75rem',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '1rem',
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>Temperature</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
            {weather.temperatureC}°C
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{weather.condition}</div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>Wind Speed</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Wind size={16} /> {weather.windSpeedKmh} <span style={{ fontSize: '0.75rem' }}>km/h</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Feels {weather.feelsLikeC}°C</div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>Rain Probability</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Droplets size={16} /> {weather.precipitationProbabilityPercent}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Humidity {weather.humidityPercent}%</div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>Sunrise / Sunset</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Sun size={14} /> {weather.sunriseTime}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 2 }}>
            <Sunset size={14} /> {weather.sunsetTime}
          </div>
        </div>
      </div>

      {/* 7-Day Forecast Row */}
      {weather.dailyForecast && weather.dailyForecast.length > 0 && (
        <div>
          <h5 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
            7-Day Weather Outlook
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.5rem' }}>
            {weather.dailyForecast.slice(0, 7).map((day, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '0.6rem 0.4rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', margin: '3px 0' }}>
                  {day.tempMaxC}° / {day.tempMinC}°
                </div>
                <div style={{ fontSize: '0.675rem', color: '#38bdf8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {day.condition}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
        {weather.disclaimer}
      </div>
    </div>
  );
};
