import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

interface SafetyBannerProps {
  customMessage?: string;
  isHazard?: boolean;
}

export const SafetyBanner: React.FC<SafetyBannerProps> = ({
  customMessage,
  isHazard = false,
}) => {
  return (
    <div
      className={`safety-callout ${isHazard ? 'safety-callout-hazard' : ''}`}
      style={{ margin: '1.25rem 0' }}
    >
      {isHazard ? (
        <ShieldAlert size={22} color="#f43f5e" style={{ flexShrink: 0, marginTop: 2 }} />
      ) : (
        <Info size={22} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
      )}
      <div style={{ fontSize: '0.85rem', lineHeight: 1.5, color: '#e2e8f0' }}>
        <strong style={{ color: isHazard ? '#fb7185' : '#fde68a', display: 'block', marginBottom: 2 }}>
          {isHazard ? 'Hazard Advisory & Caution' : 'Outdoor Activity & AI Safety Disclaimer'}
        </strong>
        {customMessage ||
          'Hiking and outdoor activities carry inherent environmental and physical risks. Weather and trail conditions are based on external provider data and AI approximations. Never treat AI outputs as authoritative safety guidance. Always check with official local park rangers, carry essential hydration, inform a trusted contact, and obey physical trail markings.'}
      </div>
    </div>
  );
};
