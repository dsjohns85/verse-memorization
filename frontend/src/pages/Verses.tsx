import { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { Verse } from '../types';

export default function Verses() {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVerses();
  }, []);

  const loadVerses = async () => {
    try {
      const data = await apiClient.getVerses();
      setVerses(data);
    } catch (error) {
      console.error('Failed to load verses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this verse?')) {
      return;
    }

    try {
      await apiClient.deleteVerse(id);
      setVerses(verses.filter((v) => v.id !== id));
    } catch (error) {
      console.error('Failed to delete verse:', error);
      alert('Failed to delete verse');
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
      <h1>My Verses</h1>

      {verses.length === 0 ? (
        <div className="card" style={{ marginTop: '2rem' }}>
          <p>No verses yet. Add your first verse to get started!</p>
        </div>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          {verses.map((verse) => {
            const lastReview = verse.reviews[0];
            const nextReview = lastReview ? new Date(lastReview.nextReviewAt) : null;
            const isDue = nextReview ? nextReview <= new Date() : true;

            return (
              <div key={verse.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: '0.5rem', color: '#646cff' }}>
                      {verse.reference} ({verse.translation})
                    </h3>
                    <p style={{ marginBottom: '1rem' }}>{verse.text}</p>
                    <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                      {lastReview && (
                        <>
                          <p>Last reviewed: {new Date(lastReview.reviewedAt).toLocaleDateString()}</p>
                          <p>
                            Next review: {nextReview?.toLocaleDateString()}
                            {isDue && <span style={{ color: '#646cff', marginLeft: '0.5rem' }}>● Due now</span>}
                          </p>
                          <p>Reviews: {lastReview.repetitions}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    className="btn-danger"
                    onClick={() => handleDelete(verse.id)}
                    style={{ marginLeft: '1rem' }}
                  >
                    Delete
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
