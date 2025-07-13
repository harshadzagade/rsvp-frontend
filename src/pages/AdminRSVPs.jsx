import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function AdminRSVPs() {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');

    axios.get('/api/admin/rsvps', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setRsvps(res.data);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to fetch RSVPs:', err);
      setLoading(false);
    });
  }, []);

  const handleExport = () => {
    const exportData = rsvps.map(r => ({
      'RSVP ID': r.id,
      'Event': r.event?.title,
      'Full Name': r.fullName,
      'Email': r.email,
      'Mobile': r.mobile,
      'Txn ID': r.txnid,
      'Status': r.status,
      'Registered At': new Date(r.createdAt).toLocaleString()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'RSVPs');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'rsvps.xlsx');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-red-600">All RSVP Records</h2>
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Export to Excel
        </button>
      </div>

      {loading ? (
        <p className="text-center text-red-500 animate-pulse">Loading RSVPs...</p>
      ) : rsvps.length === 0 ? (
        <p className="text-center text-gray-500">No RSVP data available.</p>
      ) : (
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full text-sm text-left bg-white">
            <thead className="bg-gray-100">
              <tr className="text-gray-700">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Txn ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Registered At</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
