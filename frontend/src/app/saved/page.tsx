'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HikingPlan } from '../../lib/types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  BookmarkCheck,
  Calendar,
  Clock,
  Trash2,
  CalendarPlus,
  Compass,
  CheckCircle2,
} from 'lucide-react';

export default function SavedHikesPage() {
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const { showToast } = useToast();
  const [plans, setPlans] = useState<HikingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const fetchPlans = async () => {
      try {
        const data = await api.get<HikingPlan[]>('/hiking-plans');
        setPlans(data || []);
      } catch (err: any) {
        console.warn('Failed to load plans:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, [isAuthenticated]);

  const handleDeletePlan = async (id: string) => {
    try {
      await api.delete(`/hiking-plans/${id}`);
      setPlans((prev) => prev.filter((p) => p._id !== id));
      showToast('info', 'Hiking plan removed');
    } catch (err: any) {
      showToast('error', err.message || 'Could not delete plan');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '3.5rem 2rem', maxWidth: '520px', margin: '0 auto' }}>
          <BookmarkCheck size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>Sign In to View Saved Hikes</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Saved hiking plans, custom itineraries, and checklist progress are synced to your explorer account.
          </p>
          <button onClick={() => openLoginModal()} className="btn btn-primary">
            Sign In / Create Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
            My Saved <span className="gradient-text">Hikes & Plans</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Your planned expeditions, milestones, and packed gear status
          </p>
        </div>

        <Link href="/plan" className="btn btn-primary btn-sm">
          <CalendarPlus size={16} />
          <span>Create New Plan</span>
        </Link>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '14px' }} />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <BookmarkCheck size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No Saved Hiking Plans Yet</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem 0' }}>
            Use our AI Planner to generate custom paced timelines and packing lists for any trail.
          </p>
          <Link href="/plan" className="btn btn-primary">
            Plan a Hike Now
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {plans.map((plan) => {
            const trail = typeof plan.trailId === 'object' ? plan.trailId : null;
            const packedCount = plan.checklistItems?.filter((c) => c.isChecked).length || 0;
            const totalItems = plan.checklistItems?.length || 0;

            return (
              <div
                key={plan._id}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className="badge badge-easy">{plan.status || 'Upcoming'}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Created {new Date(plan.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', color: '#ffffff' }}>{plan.title}</h3>

                  {trail && (
                    <div style={{ fontSize: '0.875rem', color: '#34d399', marginTop: '0.25rem' }}>
                      Trail: {trail.title} ({trail.distanceKm} km | {trail.difficulty})
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.65rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={14} /> {new Date(plan.scheduledDate).toDateString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={14} /> {plan.targetStartTime}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle2 size={14} color="#10b981" /> {packedCount}/{totalItems} gear packed
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {trail && (
                    <Link href={`/trails/${trail.slug || trail._id}`} className="btn btn-secondary btn-sm">
                      <Compass size={14} />
                      <span>View Trail</span>
                    </Link>
                  )}

                  <button
                    onClick={() => handleDeletePlan(plan._id)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                    title="Delete Plan"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
