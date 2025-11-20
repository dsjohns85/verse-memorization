import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import { Verse } from '../types';

export default function Review() {
  const navigate = useNavigate();
  const [verses, setVerses] = useState<Verse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showText, setShowText] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVersesDue();
  }, []);

  const loadVersesDue = async () => {
    try {
      const data = await apiClient.getVersesDue();
      setVerses(data);
    } catch (error) {
      console.error('Failed to load verses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (quality: number) => {
    const currentVerse = verses[currentIndex];

    try {
      await apiClient.createReview({
        verseId: currentVerse.id,
        quality,
      });

      // Move to next verse
      if (currentIndex < verses.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowText(false);
      } else {
        // Review session complete
        alert('Review session complete! Great job!');
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to create review:', error);
      alert('Failed to save review');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    );
  }

  if (verses.length === 0) {
    return (
      <div className="container">
        <h1>Review</h1>
        <div className="card" style={{ marginTop: '2rem' }}>
          <p>No verses due for review right now. Check back later!</p>
          <button
            className="btn-primary"
            onClick={() => navigate('/')}
            style={{ marginTop: '1rem' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentVerse = verses[currentIndex];

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Review</h1>
        <p style={{ marginTop: '0.5rem', opacity: 0.7 }}>
          Verse {currentIndex + 1} of {verses.length}
        </p>
      </div>

      <div className="card" style={{ minHeight: '300px' }}>
        <h2 style={{ marginBottom: '1rem', color: '#646cff' }}>
          {currentVerse.reference} ({currentVerse.translation})
        </h2>

        {!showText ? (
          <div style={{ marginTop: '2rem' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
              Try to recall the verse, then click "Show Verse" to check your answer.
            </p>
            <button
              className="btn-primary"
              onClick={() => setShowText(true)}
              style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
            >
              Show Verse
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem' }}>
              {currentVerse.text}
            </p>

            <div>
              <p style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                How well did you remember it?
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  className="btn-danger"
                  onClick={() => handleRating(0)}
                  title="Complete blackout"
                >
                  0 - Forgot
                </button>
                <button
                  onClick={() => handleRating(1)}
                  style={{ backgroundColor: '#d84315' }}
                  title="Incorrect but remembered"
                >
                  1 - Poor
                </button>
                <button
                  onClick={() => handleRating(2)}
                  style={{ backgroundColor: '#f57c00' }}
                  title="Incorrect but easy to recall"
                >
                  2 - Fair
                </button>
                <button
                  onClick={() => handleRating(3)}
                  style={{ backgroundColor: '#fbc02d' }}
                  title="Correct with serious difficulty"
                >
                  3 - Good
                </button>
                <button
                  onClick={() => handleRating(4)}
                  style={{ backgroundColor: '#689f38' }}
                  title="Correct after hesitation"
                >
                  4 - Very Good
                </button>
                <button
                  className="btn-primary"
                  onClick={() => handleRating(5)}
                  title="Perfect response"
                >
                  5 - Perfect
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
