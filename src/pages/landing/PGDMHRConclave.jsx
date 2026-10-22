import React, { useEffect, useState } from 'react';
import EventClosed from '../../components/EventClosed';
import { API_BASE } from '../../config';

export default function PGDMHRConclave() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'National HR Conclave 2026 | MET Institute of PGDM';

    fetch(`${API_BASE}/events/slug/pgdm-hr-conclave`)
      .then((res) => {
        if (!res.ok) throw new Error('Event fetch failed');
        return res.json();
      })
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching conclave event:', err);
        setLoading(false);
      });
  }, []);

  if (!loading && event && event.isActive === false) {
    return <EventClosed event={event} />;
  }

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <iframe
        src="/pgdm-hr-conclave.html"
        title="National HR Conclave 2026 | MET Institute of PGDM"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
      />
    </div>
  );
}
