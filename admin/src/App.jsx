import React, { useState, useEffect } from 'react';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('admin_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('admin_theme', theme);
  }, [theme]);

  return (
    <div style={{ minHeight: '100vh', padding: '24px', backgroundColor: 'var(--bg-dark)', position: 'relative', transition: 'background-color 0.3s ease' }}>
      <div className="film-grain-overlay"></div>
      {theme === 'dark' && (
        <div className="stage-glow-bg">
          <div className="glow-bubble glow-purple"></div>
          <div className="glow-bubble glow-cyan"></div>
          <div className="glow-bubble glow-gold"></div>
          <div className="glow-bubble glow-rose"></div>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 2, margin: '0 auto', width: '100%' }}>
        <AdminDashboard 
          events={events}
          tickets={tickets}
          onUpdateEvents={setEvents}
          onUpdateTickets={setTickets}
          theme={theme}
          setTheme={setTheme}
        />
      </div>
    </div>
  );
}

export default App;
