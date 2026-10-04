import React from 'react';
import { render, screen } from '@testing-library/react';
import { TrailCard } from '../components/TrailCard';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { Trail } from '../lib/types';

const mockTrail: Trail = {
  _id: '507f1f77bcf86cd799439011',
  title: 'Aravalli Biodiversity Park Nature Loop',
  slug: 'aravalli-biodiversity-park-loop',
  description: 'Tranquil semi-arid forest trail on the southern ridge of Delhi NCR.',
  region: 'Delhi NCR',
  country: 'India',
  location: { type: 'Point', coordinates: [77.1264, 28.5583] },
  difficulty: 'Easy',
  distanceKm: 5.2,
  elevationGainM: 85,
  highestPointM: 275,
  estimatedDurationMin: 90,
  routeType: 'Loop',
  terrains: ['Forest', 'Rocky'],
  tags: ['Dog-Friendly', 'Scenic'],
  isDogFriendly: true,
  isFamilyFriendly: true,
  isCampingAllowed: false,
  isSunriseSuitable: true,
  isSunsetSuitable: true,
  hasWaterfall: false,
  rating: 4.6,
  reviewCount: 340,
  images: ['https://images.unsplash.com/photo-1544717305-2782549b5136'],
};

describe('TrailCard Component', () => {
  it('should render trail title, difficulty badge, distance, and elevation', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <TrailCard trail={mockTrail} />
        </AuthProvider>
      </ToastProvider>,
    );

    expect(screen.getByText('Aravalli Biodiversity Park Nature Loop')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
    expect(screen.getByText('5.2 km')).toBeInTheDocument();
    expect(screen.getByText('+85m')).toBeInTheDocument();
  });
});
