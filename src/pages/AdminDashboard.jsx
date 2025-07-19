import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rsvps, setRsvps] = useState([]);
  const [rsvpFormKeys, setRsvpFormKeys] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
    const role = user?.role;

    if (!token || !['ADMIN', 'SUPERADMIN'].includes(role)) {
      return navigate('/login');
    }

    axios.get('/api/events', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setEvents(res.data);
        setFilteredEvents(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        navigate('/login');
      });

    axios.get('/api/admin/rsvps', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setRsvps(res.data);

        // Extract all form field keys across RSVPs
        const allKeys = new Set();
        res.data.forEach(r => {
          if (r.formData && typeof r.formData === 'object') {
            Object.keys(r.formData).forEach(key => allKeys.add(key));
          }
        });
        setRsvpFormKeys(Array.from(allKeys));
      })
      .catch(err => {
        console.error('Failed to fetch RSVPs:', err);
      });

  }, [navigate]);

  useEffect(() => {
    const filtered = events.filter(event =>
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.venue.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [search, events]);



  const handleExport = async () => {
    const token = localStorage.getItem('admin_token');

    try {
      const response = await axios.get('/api/admin/rsvps', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const rsvps = response.data;

      const exportRows = [];

      rsvps.forEach(rsvp => {
        const row = {
          ID: rsvp.id,
          Event: rsvp.event?.title || '',
          FullName: rsvp.fullName,
          Email: rsvp.email,
          Mobile: rsvp.mobile,
          TxnID: rsvp.txnid,
          Status: rsvp.status,
          RegisteredAt: new Date(rsvp.createdAt).toLocaleString()
        };

        if (rsvp.formData && typeof rsvp.formData === 'object') {
          Object.entries(rsvp.formData).forEach(([key, value]) => {
            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize first letter
            row[formattedKey] = value;
          });
        }

        exportRows.push(row);
      });

      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'RSVPs');
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'rsvps.xlsx');

    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export RSVP data. Please try again.');
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 py-4">
        <h1 className="text-2xl font-bold text-red-600">Admin Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <input
            type="text"
            placeholder="Search by title or venue..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md w-full sm:w-auto"
          />
          <button
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Export to Excel
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
          >
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-red-500 font-medium animate-pulse">Loading events...</div>
      ) : (
        <div className="overflow-x-auto shadow rounded-lg">
          <h2 className="text-xl font-bold mt-12 mb-4 text-red-600">RSVP Submissions</h2>
          <div className="overflow-x-auto shadow rounded-lg mb-12">
            <table className="min-w-full text-sm text-left bg-white">
              <thead className="bg-gray-100">
                <tr className="text-gray-700">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Txn ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  {rsvpFormKeys.map(key => (
                    <th key={key} className="px-4 py-3">{key.charAt(0).toUpperCase() + key.slice(1)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rsvps.map((rsvp, index) => (
                  <tr key={rsvp.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2">{rsvp.id}</td>
                    <td className="px-4 py-2">{rsvp.event?.title}</td>
                    <td className="px-4 py-2">{rsvp.fullName}</td>
                    <td className="px-4 py-2">{rsvp.email}</td>
                    <td className="px-4 py-2">{rsvp.mobile}</td>
                    <td className="px-4 py-2">{rsvp.txnid}</td>
                    <td className="px-4 py-2 capitalize">{rsvp.status}</td>
                    <td className="px-4 py-2 text-gray-500">{new Date(rsvp.createdAt).toLocaleString()}</td>
                    {rsvpFormKeys.map(key => (
                      <td key={key} className="px-4 py-2">
                        {rsvp.formData?.[key] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rsvps.length === 0 && (
              <p className="text-center py-4 text-gray-500">No RSVP submissions yet.</p>
            )}
          </div>

          <table className="min-w-full text-sm text-left bg-white">
            <thead className="bg-gray-100">
              <tr className="text-gray-700">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Fee</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event, index) => (
                <tr
                  key={event.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-4 py-3">{event.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{event.title}</td>
                  <td className="px-4 py-3">{event.venue}</td>
                  <td className="px-4 py-3">{new Date(event.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">₹{Number(event.fee).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(event.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center px-4 py-4 text-gray-500">No events found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
