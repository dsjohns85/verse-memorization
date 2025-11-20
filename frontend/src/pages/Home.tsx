import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import { VerseStats } from '../types';

export default function Home() {
  const [stats, setStats] = useState<VerseStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await apiClient.getVerseStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Welcome to Verse Memorization</h1>
      <p style={{ fontSize: '1.2rem', marginTop: '1rem', opacity: 0.8 }}>
        Master scripture through spaced repetition
      </p>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
          <div className="card">
            <h3 style={{ marginBottom: '0.5rem' }}>Total Verses</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#646cff' }}>{stats.totalVerses}</p>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '0.5rem' }}>Due for Review</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#646cff' }}>{stats.versesDue}</p>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '0.5rem' }}>Total Reviews</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#646cff' }}>{stats.totalReviews}</p>
          </div>
        </div>
      )}

      <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {stats && stats.versesDue > 0 && (
          <Link to="/review">
            <button className="btn-primary" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
              Start Review ({stats.versesDue} verses)
            </button>
          </Link>
        )}
        <Link to="/add">
          <button className="btn-secondary" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
            Add New Verse
          </button>
        </Link>
      </div>

      <div className="card" style={{ marginTop: '3rem' }}>
        <h2>How It Works</h2>
        <ol style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Add verses you want to memorize</li>
          <li style={{ marginBottom: '0.5rem' }}>Review them using flashcards</li>
          <li style={{ marginBottom: '0.5rem' }}>Rate how well you remember each verse</li>
          <li style={{ marginBottom: '0.5rem' }}>The spaced repetition algorithm schedules optimal review times</li>
          <li style={{ marginBottom: '0.5rem' }}>Track your progress over time</li>
        </ol>
      </div>
    </div>
  );
}
