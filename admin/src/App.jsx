import React, { useState } from 'react';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);

  return (
    <div style={{ minHeight: '100vh', padding: '24px', backgroundColor: '#0f0a1c', position: 'relative' }}>
      <div className="film-grain-overlay"></div>
      <div className="stage-glow-bg">
        <div className="glow-bubble glow-purple"></div>
        <div className="glow-bubble glow-cyan"></div>
        <div className="glow-bubble glow-gold"></div>
        <div className="glow-bubble glow-rose"></div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, margin: '0 auto', width: '100%' }}>
        <AdminDashboard 
          events={events}
          tickets={tickets}
          onUpdateEvents={setEvents}
          onUpdateTickets={setTickets}
        />
      </div>
    </div>
  );
}

export default App;
