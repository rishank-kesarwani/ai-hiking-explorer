import React from 'react';
import Link from 'next/link';
import { Compass, ShieldAlert, Heart, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        background: '#070b12',
        padding: '3.5rem 0 2rem 0',
        marginTop: '4rem',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
          {/* Col 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Compass size={20} color="#ffffff" />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                AI HIKING EXPLORER
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Production AI outdoor expedition intelligence. Discover trails, plan paced hiking itineraries, check live forecasts, and pack smart.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: '#f8fafc', marginBottom: '1rem' }}>Exploration</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Link href="/discover" style={{ transition: 'color 0.2s' }}>Discover Trails</Link>
              <Link href="/nearby" style={{ transition: 'color 0.2s' }}>Nearby GPS Trails</Link>
              <Link href="/plan" style={{ transition: 'color 0.2s' }}>AI Itinerary Planner</Link>
              <Link href="/recommendations" style={{ transition: 'color 0.2s' }}>Personalized Matches</Link>
            </div>
          </div>

          {/* Col 3 */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: '#f8fafc', marginBottom: '1rem' }}>Trail Safety</h4>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Hiking inherently involves physical hazards, sudden weather variations, and variable terrain. Trail conditions and AI itineraries are synthesized approximations. Always cross-check with official local park authorities.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © {new Date().getFullYear()} AI Hiking Explorer. Built for outdoor adventurers.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span>Informational Outdoor Guidance</span>
            <span>Render & Vercel Production Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
