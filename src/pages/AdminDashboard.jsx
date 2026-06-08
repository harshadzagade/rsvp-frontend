import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

const inferInstitute = (eventTitle = '', slug = '', venue = '') => {
  const source = `${eventTitle} ${slug} ${venue}`.toLowerCase();
  if (source.includes('pgdm')) return 'PGDM';
  if (source.includes('ics')) return 'ICS';
  if (source.includes('iop') || source.includes('pharmacy')) return 'IOP';
  if (source.includes('imm') || source.includes('mass media')) return 'IMM';
  return 'Other';
};

const formatMoney = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString();
};

const normalizeLabel = (key) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

const getRsvpAmount = (rsvp) => {
  const event = rsvp?.event;
  if (!event) return 0;

  let amount = event.fee || 0;
  const rules = event.feeOptions?.options || [];
  const formData = rsvp.formData || {};

  for (const rule of rules) {
    const logic = rule.logic || 'AND';
    const conditions = rule.conditions || [];
    const matches = conditions.map((cond) => {
      return (formData[cond.field] || '').toString().toLowerCase() === (cond.value || '').toLowerCase();
    });
    const isMatch = logic === 'AND' ? matches.every(Boolean) : matches.some(Boolean);
    if (isMatch) {
      amount = rule.fee;
      break;
    }
  }

  return amount;
};

const extractField = (data, searchKeys) => {
  if (typeof data !== 'object' || data === null) return null;
  const entries = Object.entries(data);
  const normalizedTargets = searchKeys.map(k => k.toLowerCase().replace(/[^a-z0-9]/g, ''));
  for (const [key, value] of entries) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalizedTargets.includes(normalizedKey) && value) {
      return value;
    }
  }
  for (const [key, value] of entries) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const target of normalizedTargets) {
      if ((normalizedKey.includes(target) || target.includes(normalizedKey)) && value) {
        return value;
      }
    }
  }
  return null;
};

const getRsvpName = (r) => {
  if (!r) return 'No Name';
  if (r.fullName) return r.fullName;
  const data = r.formData || {};
  const value = extractField(data, ['fullname', 'name', 'nameasrequiredonthecertificate']);
  if (value) return value;
  
  const first = extractField(data, ['firstname', 'first']);
  const last = extractField(data, ['lastname', 'last']);
  if (first || last) {
    return `${first || ''} ${last || ''}`.trim();
  }
  return 'No Name';
};

const getRsvpEmail = (r) => {
  if (!r) return '-';
  if (r.email) return r.email;
  const data = r.formData || {};
  return extractField(data, ['email', 'emailaddress']) || '-';
};

const getRsvpMobile = (r) => {
  if (!r) return '-';
  if (r.mobile) return r.mobile;
  const data = r.formData || {};
  return extractField(data, ['mobile', 'whatsappnumber', 'whatsapp', 'contactnumber', 'contact', 'phone']) || '-';
};


const filterRsvps = (rsvps, filters) => {
  return rsvps.filter((rsvp) => {
    const title = rsvp.event?.title || '';
    const venue = rsvp.event?.venue || '';
    const year = rsvp.event?.date ? new Date(rsvp.event.date).getFullYear().toString() : '';
    const institute = inferInstitute(title, rsvp.event?.slug || '', venue);
    const status = (rsvp.status || '').toLowerCase();
    
    const name = getRsvpName(rsvp);
    const email = getRsvpEmail(rsvp);
    const mobile = getRsvpMobile(rsvp);
    const searchText = `${title} ${venue} ${name} ${email} ${mobile} ${rsvp.formData?.category || ''} ${rsvp.formData?.organisation || ''}`.toLowerCase();

    return (
      (!filters.search || searchText.includes(filters.search.toLowerCase())) &&
      (!filters.year || year === filters.year) &&
      (!filters.institute || institute === filters.institute) &&
      (!filters.status || status === filters.status.toLowerCase()) &&
      (!filters.eventId || rsvp.eventId.toString() === filters.eventId)
    );
  });
};

const filterEvents = (events, filters) => {
  return events.filter((event) => {
    const year = event.date ? new Date(event.date).getFullYear().toString() : '';
    const institute = inferInstitute(event.title, event.slug, event.venue);
    const searchText = `${event.title} ${event.venue} ${event.slug || ''}`.toLowerCase();

    return (
      (!filters.search || searchText.includes(filters.search.toLowerCase())) &&
      (!filters.year || year === filters.year) &&
      (!filters.institute || institute === filters.institute)
    );
  });
};

const getStatusClasses = (status = '') => {
  const normalized = status.toLowerCase();
  if (normalized === 'success') return 'bg-emerald-100 text-emerald-700';
  if (normalized === 'failed') return 'bg-rose-100 text-rose-700';
  return 'bg-amber-100 text-amber-700';
};

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rsvps, setRsvps] = useState([]);
  const [activeView, setActiveView] = useState('overview');
  const [selectedRsvpId, setSelectedRsvpId] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    year: '',
    institute: '',
    eventId: '',
    status: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
    const role = user?.role;

    if (!token || !['ADMIN', 'SUPERADMIN'].includes(role)) {
      navigate('/admin/login');
      return;
    }

    const eventRequest = axios.get('/api/events', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const rsvpRequest = axios.get('/api/admin/rsvps', {
      headers: { Authorization: `Bearer ${token}` },
    });

    Promise.all([eventRequest, rsvpRequest])
      .then(([eventRes, rsvpRes]) => {
        setEvents(eventRes.data);
        setRsvps(rsvpRes.data);
      })
      .catch((err) => {
        console.error('Dashboard load error:', err);
        navigate('/admin/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const yearOptions = useMemo(() => {
    const years = new Set();
    events.forEach((event) => {
      if (event.date) years.add(new Date(event.date).getFullYear().toString());
    });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [events]);

  const filteredEvents = useMemo(() => filterEvents(events, filters), [events, filters]);
  const filteredRsvps = useMemo(() => filterRsvps(rsvps, filters), [rsvps, filters]);

  useEffect(() => {
    if (!filteredRsvps.length) {
      setSelectedRsvpId(null);
      return;
    }

    const stillVisible = filteredRsvps.some((rsvp) => rsvp.id === selectedRsvpId);
    if (!stillVisible) {
      setSelectedRsvpId(filteredRsvps[0].id);
    }
  }, [filteredRsvps, selectedRsvpId]);

  const selectedRsvp = useMemo(
    () => filteredRsvps.find((rsvp) => rsvp.id === selectedRsvpId) || null,
    [filteredRsvps, selectedRsvpId]
  );

  const selectedRsvpFields = useMemo(() => {
    if (!selectedRsvp) return [];
    const formData = selectedRsvp.formData || {};
    const formFields = selectedRsvp.event?.formFields || [];
    
    const fieldsToShow = [];
    const displayedKeys = new Set();

    // 1. Map fields according to the event's formFields configuration in order
    if (Array.isArray(formFields)) {
      formFields.forEach((field) => {
        const key = field.name;
        // Find matching value from formData with case fallbacks
        let value = formData[key];
        if (value === undefined || value === null || value === '') {
          const lowerKey = key.toLowerCase();
          const upperKey = key.toUpperCase();
          const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
          value = formData[lowerKey] !== undefined && formData[lowerKey] !== null ? formData[lowerKey] :
                  formData[upperKey] !== undefined && formData[upperKey] !== null ? formData[upperKey] :
                  formData[capitalizedKey] !== undefined && formData[capitalizedKey] !== null ? formData[capitalizedKey] : 
                  formData[field.label] !== undefined && formData[field.label] !== null ? formData[field.label] : '';
        }
        
        if (value !== undefined && value !== null && value !== '') {
          fieldsToShow.push({
            key,
            label: field.label || normalizeLabel(key),
            value: value,
          });
        }
        displayedKeys.add(key.toLowerCase());
        if (field.label) {
          displayedKeys.add(field.label.toLowerCase());
        }
      });
    }

    // 2. Add any remaining keys in formData that are not system-related or already displayed
    Object.entries(formData).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      if (
        displayedKeys.has(lowerKey) ||
        lowerKey === 'txnid' ||
        value === '' ||
        value === null ||
        value === undefined
      ) {
        return;
      }
      
      fieldsToShow.push({
        key,
        label: normalizeLabel(key),
        value,
      });
    });

    return fieldsToShow;
  }, [selectedRsvp]);

  const summary = useMemo(() => {
    const icsEvents = events.filter((event) => inferInstitute(event.title, event.slug, event.venue) === 'ICS').length;
    const iopEvents = events.filter((event) => inferInstitute(event.title, event.slug, event.venue) === 'IOP').length;
    const pgdmEvents = events.filter((event) => inferInstitute(event.title, event.slug, event.venue) === 'PGDM').length;
    const immEvents = events.filter((event) => inferInstitute(event.title, event.slug, event.venue) === 'IMM').length;

    const icsRsvps = rsvps.filter((rsvp) => inferInstitute(rsvp.event?.title, rsvp.event?.slug || '', rsvp.event?.venue) === 'ICS').length;
    const iopRsvps = rsvps.filter((rsvp) => inferInstitute(rsvp.event?.title, rsvp.event?.slug || '', rsvp.event?.venue) === 'IOP').length;
    const pgdmRsvps = rsvps.filter((rsvp) => inferInstitute(rsvp.event?.title, rsvp.event?.slug || '', rsvp.event?.venue) === 'PGDM').length;
    const immRsvps = rsvps.filter((rsvp) => inferInstitute(rsvp.event?.title, rsvp.event?.slug || '', rsvp.event?.venue) === 'IMM').length;

    const successfulPayments = rsvps.filter((rsvp) => rsvp.status === 'success').length;

    return {
      totalEvents: events.length,
      totalRsvps: rsvps.length,
      icsEvents,
      iopEvents,
      pgdmEvents,
      immEvents,
      icsRsvps,
      iopRsvps,
      pgdmRsvps,
      immRsvps,
      successfulPayments,
    };
  }, [events, rsvps]);

  const handleExport = async () => {
    const token = localStorage.getItem('admin_token');

    try {
      const response = await axios.get('/api/admin/rsvps', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const exportRows = filterRsvps(response.data, filters).map((rsvp) => {
        const row = {
          ID: rsvp.id,
          Institute: inferInstitute(rsvp.event?.title, rsvp.event?.slug, rsvp.event?.venue),
          Event: rsvp.event?.title || '',
          FullName: rsvp.fullName,
          Email: rsvp.email,
          Mobile: rsvp.mobile,
          Category: rsvp.formData?.category || '',
          ParticipationMode: rsvp.formData?.participationMode || '',
          Amount: getRsvpAmount(rsvp),
          TxnID: rsvp.txnid,
          Status: rsvp.status,
          RegisteredAt: new Date(rsvp.createdAt).toLocaleString(),
        };

        if (rsvp.formData && typeof rsvp.formData === 'object') {
          Object.entries(rsvp.formData).forEach(([key, value]) => {
            row[normalizeLabel(key)] = value;
          });
        }

        return row;
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
    navigate('/admin/login');
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 p-4 lg:flex-row lg:p-6">
        <aside className="w-full rounded-3xl bg-slate-900 p-5 text-white shadow-xl lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-72 lg:flex-shrink-0">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">MET Admin</p>
            <h1 className="mt-2 text-2xl font-bold">Payments and Events</h1>
            <p className="mt-2 text-sm text-slate-300">Manage IMM and PGDM, ICS events, review registrations, and inspect payment details without the screen stretching sideways.</p>
          </div>

          <div className="mt-8 space-y-2">
            <button
              onClick={() => setActiveView('overview')}
              className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${activeView === 'overview' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
            >
              Dashboard Overview
            </button>
            <button
              onClick={() => setActiveView('rsvps')}
              className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${activeView === 'rsvps' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
            >
              RSVP and Payments
            </button>
            <button
              onClick={() => setActiveView('events')}
              className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${activeView === 'events' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
            >
              Events Library
            </button>
            <button
              onClick={() => navigate('/admin/create-event')}
              className="w-full rounded-2xl bg-red-500 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-red-400"
            >
              Create New Event
            </button>
          </div>

          <div className="mt-8 rounded-2xl bg-slate-800 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">Quick Notes</p>
            <p className="mt-2">Select a registration row to see all submitted form fields in the detail panel.</p>
          </div>

          <button
            onClick={handleLogout}
            className="mt-8 w-full rounded-2xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
          >
            Logout
          </button>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <section className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-red-600">Admin Dashboard</p>
                <h2 className="mt-2 text-3xl font-bold">Filter registrations by year, institute, and status</h2>
              </div>
              <button
                onClick={handleExport}
                className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Export Current Results
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <input
                type="text"
                placeholder="Search name, email, category..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium"
              />
              <select
                value={filters.year}
                onChange={(e) => updateFilter('year', e.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium"
              >
                <option value="">All years</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={filters.institute}
                onChange={(e) => updateFilter('institute', e.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium"
              >
                <option value="">All institutes</option>
                <option value="ICS">ICS</option>
                <option value="IOP">IOP</option>
                <option value="IMM">IMM</option>
                <option value="PGDM">PGDM</option>
                <option value="Other">Other</option>
              </select>
              <select
                value={filters.eventId}
                onChange={(e) => updateFilter('eventId', e.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium truncate max-w-full"
              >
                <option value="">All events</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id.toString()}>
                    {event.title}
                  </option>
                ))}
              </select>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium"
              >
                <option value="">All statuses</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="initiated">Initiated</option>
              </select>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Total Events</p>
              <p className="mt-2 text-3xl font-bold">{summary.totalEvents}</p>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Total RSVPs</p>
              <p className="mt-2 text-3xl font-bold">{summary.totalRsvps}</p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">ICS RSVPs</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">{summary.icsRsvps}</p>
              <p className="text-xs text-slate-400 mt-1">{summary.icsEvents} events</p>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">IOP RSVPs</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">{summary.iopRsvps}</p>
              <p className="text-xs text-slate-400 mt-1">{summary.iopEvents} events</p>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">IMM RSVPs</p>
              <p className="mt-2 text-3xl font-bold text-amber-600">{summary.immRsvps}</p>
              <p className="text-xs text-slate-400 mt-1">{summary.immEvents} events</p>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Successful Payments</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">{summary.successfulPayments}</p>
            </div>
          </section>

          {loading ? (
            <div className="rounded-3xl bg-white p-10 text-center text-red-500 shadow-sm">Loading dashboard...</div>
          ) : (
            <>
              {(activeView === 'overview' || activeView === 'rsvps') && (
                <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.95fr)]">
                  <div className="min-w-0 rounded-3xl bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">RSVP and Payments</h3>
                        <p className="mt-1 text-sm text-slate-500">Showing {filteredRsvps.length} filtered registration records.</p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {filteredRsvps.map((rsvp) => {
                        const isActive = rsvp.id === selectedRsvpId;
                        return (
                          <button
                            key={rsvp.id}
                            type="button"
                            onClick={() => setSelectedRsvpId(rsvp.id)}
                            className={`w-full rounded-2xl border p-4 text-left transition ${isActive ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'}`}
                          >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isActive ? 'bg-white/15 text-white' : 'bg-slate-200 text-slate-700'}`}>
                                    {inferInstitute(rsvp.event?.title, rsvp.event?.slug, rsvp.event?.venue)}
                                  </span>
                                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isActive ? 'bg-emerald-400/20 text-emerald-100' : getStatusClasses(rsvp.status)}`}>
                                    {rsvp.status}
                                  </span>
                                </div>
                                <h4 className="mt-3 text-lg font-semibold">{getRsvpName(rsvp)}</h4>
                                <p className={`mt-1 truncate text-sm ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>{getRsvpEmail(rsvp)}</p>
                                <p className={`mt-1 text-sm ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>{rsvp.event?.title}</p>
                              </div>
                              <div className={`grid grid-cols-2 gap-3 text-sm sm:min-w-[260px] ${isActive ? 'text-slate-200' : 'text-slate-600'}`}>
                                <div>
                                  <p className="text-xs uppercase tracking-wide opacity-70">Category</p>
                                  <p className="mt-1 font-medium">{rsvp.formData?.category || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide opacity-70">Mode</p>
                                  <p className="mt-1 font-medium">{rsvp.formData?.participationMode || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide opacity-70">Amount</p>
                                  <p className="mt-1 font-medium">{formatMoney(getRsvpAmount(rsvp))}</p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide opacity-70">Registered</p>
                                  <p className="mt-1 font-medium">{formatDateTime(rsvp.createdAt)}</p>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {filteredRsvps.length === 0 && (
                      <p className="py-6 text-center text-slate-500">No RSVP submissions match the current filters.</p>
                    )}
                  </div>

                  <div className="rounded-3xl bg-white p-5 shadow-sm xl:sticky xl:top-6 xl:self-start xl:max-h-[calc(100vh-3rem)] xl:flex xl:flex-col">
                    <h3 className="text-2xl font-bold flex-shrink-0">Registration Details</h3>
                    {!selectedRsvp ? (
                      <p className="mt-4 text-sm text-slate-500 flex-shrink-0">Select a registration to view payment details and submitted form fields.</p>
                    ) : (() => {
                      const displayName = getRsvpName(selectedRsvp);
                      const displayEmail = getRsvpEmail(selectedRsvp);
                      const displayMobile = getRsvpMobile(selectedRsvp);

                      return (
                        <div className="mt-5 overflow-y-auto pr-2 space-y-6 flex-1 min-h-0 custom-scrollbar">
                          <div className="rounded-2xl bg-slate-900 p-5 text-white flex-shrink-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">
                                {inferInstitute(selectedRsvp.event?.title, selectedRsvp.event?.slug, selectedRsvp.event?.venue)}
                              </span>
                              <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-xs font-semibold text-emerald-100">
                                {selectedRsvp.status}
                              </span>
                            </div>
                            <h4 className="mt-4 text-2xl font-bold">{displayName}</h4>
                            <p className="mt-1 text-sm text-slate-300">{displayEmail}</p>
                            <p className="mt-1 text-sm text-slate-300">{displayMobile}</p>
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 p-4">
                              <p className="text-xs uppercase tracking-wide text-slate-400">Event</p>
                              <p className="mt-2 font-semibold text-slate-900">{selectedRsvp.event?.title}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 p-4">
                              <p className="text-xs uppercase tracking-wide text-slate-400">Txn ID</p>
                              <p className="mt-2 font-semibold text-slate-900 break-all">{selectedRsvp.txnid}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 p-4">
                              <p className="text-xs uppercase tracking-wide text-slate-400">Payment Amount</p>
                              <p className="mt-2 font-semibold text-slate-900">{formatMoney(getRsvpAmount(selectedRsvp))}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 p-4">
                              <p className="text-xs uppercase tracking-wide text-slate-400">Registered At</p>
                              <p className="mt-2 font-semibold text-slate-900">{formatDateTime(selectedRsvp.createdAt)}</p>
                            </div>
                          </div>

                          <div>
                            <h5 className="text-lg font-semibold text-slate-900">Submitted Form Fields</h5>
                            <div className="mt-3 grid grid-cols-1 gap-3">
                              {selectedRsvpFields.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                                  No additional form fields were submitted beyond the core contact details.
                                </div>
                              ) : (
                                selectedRsvpFields.map((field) => (
                                  <div key={field.key} className="rounded-2xl border border-slate-200 p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-400">{field.label}</p>
                                    <p className="mt-2 whitespace-pre-wrap break-words text-sm font-medium text-slate-900">{String(field.value)}</p>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </section>
              )}

              {(activeView === 'overview' || activeView === 'events') && (
                <section className="rounded-3xl bg-white p-5 shadow-sm">
                  <div>
                    <h3 className="text-2xl font-bold">Events Library</h3>
                    <p className="mt-1 text-sm text-slate-500">Showing {filteredEvents.length} events after filtering.</p>
                  </div>

                  <div className="mt-5 overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                      <thead className="bg-slate-100 text-slate-600">
                        <tr>
                          <th className="px-4 py-3">#</th>
                          <th className="px-4 py-3">Institute</th>
                          <th className="px-4 py-3">Title</th>
                          <th className="px-4 py-3">Slug</th>
                          <th className="px-4 py-3">Venue</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Fee</th>
                          <th className="px-4 py-3">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEvents.map((event, index) => (
                          <tr key={event.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="px-4 py-3">{event.id}</td>
                            <td className="px-4 py-3 font-medium">{inferInstitute(event.title, event.slug, event.venue)}</td>
                            <td className="px-4 py-3">{event.title}</td>
                            <td className="px-4 py-3">{event.slug}</td>
                            <td className="px-4 py-3">{event.venue}</td>
                            <td className="px-4 py-3">{new Date(event.date).toLocaleDateString()}</td>
                            <td className="px-4 py-3">{formatMoney(event.fee)}</td>
                            <td className="px-4 py-3 text-slate-500">{new Date(event.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredEvents.length === 0 && (
                      <p className="py-6 text-center text-slate-500">No events match the current filters.</p>
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
