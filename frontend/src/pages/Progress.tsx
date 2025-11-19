import { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { ReviewStats } from '../types';

export default function Progress() {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [days]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getReviewStats(days);
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
      <h1>Progress</h1>

      <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <label htmlFor="days" style={{ marginRight: '1rem' }}>
          Show last:
        </label>
        <select
          id="days"
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          style={{ padding: '0.5rem' }}
        >
          <option value="7">7 days</option>
          <option value="30">30 days</option>
          <option value="90">90 days</option>
          <option value="365">1 year</option>
        </select>
      </div>

      {stats && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="card">
              <h3 style={{ marginBottom: '0.5rem' }}>Total Reviews</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#646cff' }}>
                {stats.totalReviews}
              </p>
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '0.5rem' }}>Average Quality</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#646cff' }}>
                {stats.averageQuality.toFixed(1)} / 5
              </p>
            </div>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Daily Activity</h2>
            {Object.keys(stats.reviewsByDate).length === 0 ? (
              <p>No reviews in this period</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Reviews</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Avg Quality</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.reviewsByDate)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .map(([date, data]) => (
                        <tr key={date} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <td style={{ padding: '0.5rem' }}>{new Date(date).toLocaleDateString()}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'right' }}>{data.count}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                            {(data.totalQuality / data.count).toFixed(1)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
