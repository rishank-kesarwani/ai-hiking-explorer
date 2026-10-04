import React from 'react';

export const TrailCardSkeleton: React.FC = () => {
  return (
    <div className="glass-card" style={{ height: '380px', display: 'flex', flexDirection: 'column' }}>
      <div className="skeleton" style={{ height: '180px', width: '100%', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }} />
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="skeleton" style={{ height: '24px', width: '70%' }} />
        <div className="skeleton" style={{ height: '16px', width: '40%' }} />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
          <div className="skeleton" style={{ height: '28px', width: '80px', borderRadius: '9999px' }} />
          <div className="skeleton" style={{ height: '28px', width: '80px', borderRadius: '9999px' }} />
        </div>
      </div>
    </div>
  );
};

export const TrailDetailsSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem 0' }}>
      <div className="skeleton" style={{ height: '320px', width: '100%', borderRadius: '24px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton" style={{ height: '90px', borderRadius: '14px' }} />
        ))}
      </div>
      <div className="skeleton" style={{ height: '250px', width: '100%', borderRadius: '20px' }} />
    </div>
  );
};
