import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import { esvApiClient } from '../services/esvApi';

export default function AddVerse() {
  const navigate = useNavigate();
  const [reference, setReference] = useState('');
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState('ESV');
  const [loading, setLoading] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);

  const handleLookup = async () => {
    if (!reference) {
      alert('Please enter a verse reference');
      return;
    }

    setLookingUp(true);
    try {
      const passage = await esvApiClient.getPassage(reference);
      setReference(passage.canonical); // Use canonical reference
      setText(passage.text);
      setTranslation('ESV'); // ESV API returns ESV text
    } catch (error) {
      console.error('Failed to lookup verse:', error);
      alert(error instanceof Error ? error.message : 'Failed to lookup verse from ESV API');
    } finally {
      setLookingUp(false);
    }
  };

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
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g., John 3:16 or Romans 8:28-30"
              style={{ flex: 1 }}
              required
            />
            <button
              type="button"
              className="btn-primary"
              onClick={handleLookup}
              disabled={lookingUp || !reference}
              style={{ whiteSpace: 'nowrap' }}
            >
              {lookingUp ? 'Looking up...' : 'Lookup ESV'}
            </button>
          </div>
          <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }}>
            Enter a verse reference and click "Lookup ESV" to fetch the text automatically
          </p>
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
            <option value="ESV">ESV (English Standard Version)</option>
            <option value="NIV">NIV</option>
            <option value="KJV">KJV</option>
            <option value="NASB">NASB</option>
            <option value="NLT">NLT</option>
            <option value="MSG">MSG</option>
          </select>
          <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }}>
            ESV is the primary translation. Use "Lookup ESV" button to automatically fetch ESV text.
          </p>
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
