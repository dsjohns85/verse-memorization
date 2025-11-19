import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';

export default function AddVerse() {
  const navigate = useNavigate();
  const [reference, setReference] = useState('');
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState('NIV');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reference || !text) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await apiClient.createVerse({
        reference,
        text,
        translation,
      });

      alert('Verse added successfully!');
      navigate('/verses');
    } catch (error) {
      console.error('Failed to create verse:', error);
      alert('Failed to add verse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Add New Verse</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: '2rem', maxWidth: '600px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="reference" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Reference *
          </label>
          <input
            type="text"
            id="reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g., John 3:16"
            style={{ width: '100%' }}
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="translation" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Translation
          </label>
          <select
            id="translation"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="NIV">NIV</option>
            <option value="ESV">ESV</option>
            <option value="KJV">KJV</option>
            <option value="NASB">NASB</option>
            <option value="NLT">NLT</option>
            <option value="MSG">MSG</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="text" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Verse Text *
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter the verse text..."
            rows={6}
            style={{ width: '100%' }}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Verse'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/verses')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
