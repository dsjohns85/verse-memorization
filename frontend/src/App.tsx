import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Verses from './pages/Verses';
import AddVerse from './pages/AddVerse';
import Review from './pages/Review';
import Progress from './pages/Progress';
import './App.css';

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <Link to="/" className="nav-brand">
              📖 Verse Memorization
            </Link>
            <div className="nav-links">
              <Link to="/">Home</Link>
              <Link to="/verses">My Verses</Link>
              <Link to="/add">Add Verse</Link>
              <Link to="/review">Review</Link>
              <Link to="/progress">Progress</Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/verses" element={<Verses />} />
          <Route path="/add" element={<AddVerse />} />
          <Route path="/review" element={<Review />} />
          <Route path="/progress" element={<Progress />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
