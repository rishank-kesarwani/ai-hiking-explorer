'use client';

import React, { useState } from 'react';
import { ElevationPoint } from '../lib/types';
import { Mountain } from 'lucide-react';

interface ElevationChartProps {
  profile?: ElevationPoint[];
  distanceKm?: number;
  elevationGainM?: number;
  highestPointM?: number;
}

export const ElevationChart: React.FC<ElevationChartProps> = ({
  profile,
  distanceKm = 5,
  elevationGainM = 100,
  highestPointM = 300,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; dist: number; elev: number } | null>(null);

  // Generate fallback points if profile not explicitly supplied
  const points: ElevationPoint[] =
    profile && profile.length > 1
      ? profile
      : [
          { distanceKm: 0, elevationM: highestPointM - elevationGainM },
          { distanceKm: distanceKm * 0.25, elevationM: highestPointM - elevationGainM * 0.5 },
          { distanceKm: distanceKm * 0.5, elevationM: highestPointM },
          { distanceKm: distanceKm * 0.75, elevationM: highestPointM - elevationGainM * 0.4 },
          { distanceKm: distanceKm, elevationM: highestPointM - elevationGainM * 0.85 },
        ];

  const minElev = Math.min(...points.map((p) => p.elevationM));
  const maxElev = Math.max(...points.map((p) => p.elevationM));
  const maxDist = Math.max(...points.map((p) => p.distanceKm));

  const paddingX = 40;
  const paddingY = 30;
  const width = 650;
  const height = 220;

  const getX = (dist: number) =>
    paddingX + (dist / (maxDist || 1)) * (width - paddingX * 2);

  const getY = (elev: number) => {
    const range = maxElev - minElev || 1;
    return (
      height -
      paddingY -
      ((elev - minElev) / range) * (height - paddingY * 2)
    );
  };

  // Generate SVG path
  const pathD = points.reduce((acc, point, index) => {
    const x = getX(point.distanceKm);
    const y = getY(point.elevationM);
    if (index === 0) return `M ${x} ${y}`;
    return `${acc} L ${x} ${y}`;
  }, '');

  const areaD = `${pathD} L ${getX(maxDist)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`;

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Mountain size={18} color="#10b981" />
          Interactive Elevation Profile
        </h4>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Highest Peak: <strong style={{ color: '#34d399' }}>{maxElev}m</strong> | Base: <strong>{minElev}m</strong>
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', minWidth: '450px' }}
        >
          <defs>
            <linearGradient id="elevationGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#059669" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="rgba(255,255,255,0.06)"
            strokeDasharray="4 4"
          />

          {/* Area fill */}
          <path d={areaD} fill="url(#elevationGradient)" />

          {/* Line curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data point dots */}
          {points.map((p, idx) => {
            const cx = getX(p.distanceKm);
            const cy = getY(p.elevationM);
            return (
              <g key={idx}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={idx === 0 || idx === points.length - 1 ? 5 : 4}
                  fill="#ffffff"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint({ x: cx, y: cy, dist: p.distanceKm, elev: p.elevationM })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}

          {/* X-axis labels */}
          <text x={paddingX} y={height - 8} fill="#64748b" fontSize="11" textAnchor="start">
            0 km
          </text>
          <text x={width / 2} y={height - 8} fill="#64748b" fontSize="11" textAnchor="middle">
            {(maxDist / 2).toFixed(1)} km
          </text>
          <text x={width - paddingX} y={height - 8} fill="#64748b" fontSize="11" textAnchor="end">
            {maxDist.toFixed(1)} km
          </text>
        </svg>
      </div>

      {hoveredPoint && (
        <div
          style={{
            position: 'absolute',
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: '20px',
            transform: 'translateX(-50%)',
            background: '#0f172a',
            border: '1px solid #10b981',
            borderRadius: '8px',
            padding: '0.35rem 0.65rem',
            fontSize: '0.775rem',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <strong>{hoveredPoint.elev}m</strong> elev at {hoveredPoint.dist} km
        </div>
      )}
    </div>
  );
};
