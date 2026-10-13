import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import {
  Link2, Power, Edit3, CheckCircle, XCircle, Copy, Plus, Trash2, X, Eye, EyeOff,
  Settings, Users, ShieldCheck, Key, Mail, MessageSquare, Save, Check, UserPlus,
  Palette, Layout, Sparkles
} from 'lucide-react';

const inferInstitute = (eventTitle = '', slug = '', venue = '', eventInstitute = '') => {
  if (eventInstitute) {
    return eventInstitute.toUpperCase();
  }
  const sSlug = (slug || '').toLowerCase();
  const sTitle = (eventTitle || '').toLowerCase();
  const sVenue = (venue || '').toLowerCase();

  if (sSlug.includes('iop') || sSlug.includes('pharmacy') || sTitle.includes('iop') || sTitle.includes('pharmacy') || sVenue.includes('iop') || sVenue.includes('pharmacy')) {
    return 'IOP';
  }
  if (sSlug.includes('pgdm') || sTitle.includes('pgdm') || sVenue.includes('pgdm')) {
    return 'PGDM';
  }
  if (sSlug.includes('imm') || sTitle.includes('imm') || sVenue.includes('imm') || sTitle.includes('mass media') || sSlug.includes('sfx')) {
    return 'IMM';
  }
  if (sSlug.includes('ics') || sSlug.includes('cism') || sSlug.includes('icetcism') || /\bics\b/i.test(sTitle) || /\bics\b/i.test(sVenue)) {
    return 'ICS';
  }
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
  if (!r) return 'No Email';
  if (r.email) return r.email;
  const data = r.formData || {};
  return extractField(data, ['email', 'emailaddress', 'useremail']) || 'No Email';
};

const getRsvpMobile = (r) => {
  if (!r) return '-';
  if (r.mobile) return r.mobile;
  const data = r.formData || {};
  return extractField(data, ['mobile', 'whatsappnumber', 'contactnumber', 'phone', 'contact']) || '-';
};

const filterRsvps = (rsvps, filters) => {
  return rsvps.filter((rsvp) => {
    const title = rsvp.event?.title || '';
    const venue = rsvp.event?.venue || '';
    const year = rsvp.event?.date ? new Date(rsvp.event.date).getFullYear().toString() : '';
    const institute = inferInstitute(title, rsvp.event?.slug || '', venue, rsvp.event?.institute);
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
    const institute = inferInstitute(event.title, event.slug, event.venue, event.institute);
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
  const navigate = useNavigate();

  // Logged in user info
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('admin_user') || '{}');
    } catch {
      return {};
    }
  });

  const isSuperAdmin = currentUser?.role === 'SUPERADMIN';

  const isRestrictedToInstitute = useMemo(() => {
    if (!currentUser || isSuperAdmin) return null;
    const inst = currentUser.institute?.toUpperCase();
    if (inst && !['ALL', 'MUMBAI EDUCATIONAL TRUST'].includes(inst)) {
      return inst;
    }
    return null;
  }, [currentUser, isSuperAdmin]);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rsvps, setRsvps] = useState([]);
  const [activeView, setActiveView] = useState(() => {
    const userRole = JSON.parse(localStorage.getItem('admin_user') || '{}')?.role;
    return userRole === 'SUPERADMIN' ? 'overview' : 'rsvps';
  }); // 'overview' | 'status-board' | 'rsvps' | 'events' | 'settings' | 'users'
  const [selectedRsvpId, setSelectedRsvpId] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    year: '',
    institute: isRestrictedToInstitute || '',
    eventId: '',
    status: '',
  });

  // Institute Settings State
  const [instituteSettings, setInstituteSettings] = useState([]);
  const [activeSettingCode, setActiveSettingCode] = useState(isRestrictedToInstitute || 'IMM');
  const [savingSetting, setSavingSetting] = useState(false);
  const [settingSuccess, setSettingSuccess] = useState('');
  const [showPasswordMap, setShowPasswordMap] = useState({});
  const [settingSubTab, setSettingSubTab] = useState('gateway'); // 'gateway' | 'template'
  const [templatePreviewEventId, setTemplatePreviewEventId] = useState('');

  // Team & Users State
  const [usersList, setUsersList] = useState([]);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN',
    institute: 'IMM',
  });
  const [userActionSuccess, setUserActionSuccess] = useState('');
  const [userActionError, setUserActionError] = useState('');

  // Add New Institute State
  const [newInstituteModalOpen, setNewInstituteModalOpen] = useState(false);
  const [newInstituteForm, setNewInstituteForm] = useState({
    instituteCode: '',
    instituteName: '',
    payuKey: '',
    payuSalt: '',
    payuBaseUrl: 'https://secure.payu.in/_payment',
    emailUser: '',
    emailPass: '',
    adminEmails: '',
    whatsappLink: '',
    whatsappText: '',
    emailSubject: '',
    emailHeading: '',
    emailBody: '',
    emailFooter: '',
    brandColor: '#B91C1C',
  });

  const availableInstituteCodes = useMemo(() => {
    const defaultCodes = ['IMM', 'IOP', 'ICS', 'PGDM'];
    const dbCodes = (instituteSettings || []).map(s => s.instituteCode?.toUpperCase()).filter(Boolean);
    return Array.from(new Set([...defaultCodes, ...dbCodes]));
  }, [instituteSettings]);

  // Initial Load
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
    const role = user?.role;

    if (!token || !['ADMIN', 'SUPERADMIN', 'VIEWER'].includes(role)) {
      navigate('/admin/login');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const eventRequest = axios.get('/api/events', { headers });
    const rsvpRequest = axios.get('/api/admin/rsvps', { headers });
    const settingsRequest = role === 'SUPERADMIN' 
      ? axios.get('/api/admin/settings', { headers }).catch(() => ({ data: [] }))
      : Promise.resolve({ data: [] });
    const usersRequest = role === 'SUPERADMIN'
      ? axios.get('/api/admin/users', { headers }).catch(() => ({ data: [] }))
      : Promise.resolve({ data: [] });

    Promise.all([eventRequest, rsvpRequest, settingsRequest, usersRequest])
      .then(([eventRes, rsvpRes, setRes, usrRes]) => {
        setEvents(eventRes.data);
        setRsvps(rsvpRes.data);
        setInstituteSettings(setRes.data || []);
        setUsersList(usrRes.data || []);
      })
      .catch((err) => {
        console.error('Dashboard load error:', err);
        navigate('/admin/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  // Sync institute filter if user is restricted
  useEffect(() => {
    if (isRestrictedToInstitute) {
      setFilters(prev => ({ ...prev, institute: isRestrictedToInstitute }));
      setActiveSettingCode(isRestrictedToInstitute);
    }
  }, [isRestrictedToInstitute]);

  const yearOptions = useMemo(() => {
    const years = new Set();
    events.forEach((event) => {
      if (event.date) years.add(new Date(event.date).getFullYear().toString());
    });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [events]);

  const filteredEvents = useMemo(() => filterEvents(events, filters), [events, filters]);
  const filteredRsvps = useMemo(() => filterRsvps(rsvps, filters), [rsvps, filters]);

  const availableEventsForDropdown = useMemo(() => {
    const targetInst = isRestrictedToInstitute || filters.institute;
    if (!targetInst) return events;
    return events.filter((e) => inferInstitute(e.title, e.slug, e.venue, e.institute) === targetInst);
  }, [events, isRestrictedToInstitute, filters.institute]);

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

    if (Array.isArray(formFields)) {
      formFields.forEach((field) => {
        const key = field.name;
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
    const icsEvents = events.filter((event) => inferInstitute(event.title, event.slug, event.venue, event.institute) === 'ICS').length;
    const iopEvents = events.filter((event) => inferInstitute(event.title, event.slug, event.venue, event.institute) === 'IOP').length;
    const pgdmEvents = events.filter((event) => inferInstitute(event.title, event.slug, event.venue, event.institute) === 'PGDM').length;
    const immEvents = events.filter((event) => inferInstitute(event.title, event.slug, event.venue, event.institute) === 'IMM').length;

    const icsRsvps = rsvps.filter((rsvp) => inferInstitute(rsvp.event?.title, rsvp.event?.slug || '', rsvp.event?.venue, rsvp.event?.institute) === 'ICS').length;
    const iopRsvps = rsvps.filter((rsvp) => inferInstitute(rsvp.event?.title, rsvp.event?.slug || '', rsvp.event?.venue, rsvp.event?.institute) === 'IOP').length;
    const pgdmRsvps = rsvps.filter((rsvp) => inferInstitute(rsvp.event?.title, rsvp.event?.slug || '', rsvp.event?.venue, rsvp.event?.institute) === 'PGDM').length;
    const immRsvps = rsvps.filter((rsvp) => inferInstitute(rsvp.event?.title, rsvp.event?.slug || '', rsvp.event?.venue, rsvp.event?.institute) === 'IMM').length;

    const activeLinksCount = events.filter((e) => e.isActive !== false).length;
    const inactiveLinksCount = events.filter((e) => e.isActive === false).length;
    const successfulPayments = rsvps.filter((rsvp) => rsvp.status === 'success').length;

    return {
      totalEvents: events.length,
      totalRsvps: rsvps.length,
      activeLinksCount,
      inactiveLinksCount,
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

  // Toggle Event Active/Inactive Status
  const handleToggleStatus = async (eventId, currentIsActive) => {
    const token = localStorage.getItem('admin_token');
    const newStatus = !currentIsActive;

    try {
      const response = await axios.patch(`/api/events/${eventId}/status`, 
        { isActive: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEvents((prev) =>
        prev.map((evt) => (evt.id === eventId ? { ...evt, isActive: newStatus } : evt))
      );
    } catch (err) {
      console.error('Failed to toggle event link status:', err);
      alert('Could not update event status. Please try again.');
    }
  };

  // Copy Link to Clipboard
  const handleCopyLink = (slug) => {
    const fullUrl = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2500);
    });
  };

  // Delete Event (SuperAdmin only)
  const handleDeleteEvent = async (event) => {
    if (!window.confirm(`Are you sure you want to permanently delete event "${event.title}" (/${event.slug})?`)) {
      return;
    }
    const token = localStorage.getItem('admin_token');
    try {
      await axios.delete(`/api/events/${event.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
      if (editingEvent?.id === event.id) setEditingEvent(null);
      alert(`Event "${event.title}" was deleted successfully.`);
    } catch (err) {
      console.error('Failed to delete event:', err);
      alert(err.response?.data?.error || 'Could not delete event. If it has participants, deactivate it instead.');
    }
  };

  // Open Edit Event Modal
  const handleOpenEditModal = (event) => {
    setEditingEvent({
      ...event,
      institute: event.institute || inferInstitute(event.title, event.slug, event.venue),
      formFields: Array.isArray(event.formFields) ? JSON.parse(JSON.stringify(event.formFields)) : [],
    });
  };

  // Save Event Edit
  const handleSaveEventEdit = async (e) => {
    e.preventDefault();
    if (!editingEvent) return;

    const token = localStorage.getItem('admin_token');
    try {
      const res = await axios.put(
        `/api/events/${editingEvent.id}`,
        {
          title: editingEvent.title,
          slug: (editingEvent.slug || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
          venue: editingEvent.venue,
          fee: editingEvent.fee,
          date: editingEvent.date,
          institute: editingEvent.institute,
          isActive: editingEvent.isActive,
          formFields: editingEvent.formFields,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEvents((prev) =>
        prev.map((evt) => (evt.id === editingEvent.id ? res.data : evt))
      );
      setEditingEvent(null);
      alert('Event and Form configuration updated successfully!');
    } catch (err) {
      console.error('Failed to update event:', err);
      alert('Failed to update event. Please check inputs.');
    }
  };

  // Save Institute Settings
  const handleSaveSetting = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    const current = instituteSettings.find(s => s.instituteCode === activeSettingCode) || {};

    setSavingSetting(true);
    setSettingSuccess('');
    try {
      const res = await axios.put(
        `/api/admin/settings/${activeSettingCode}`,
        current,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInstituteSettings(prev =>
        prev.map(s => s.instituteCode === activeSettingCode ? res.data.setting : s)
      );
      setSettingSuccess(`Configuration for ${activeSettingCode} saved successfully!`);
      setTimeout(() => setSettingSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save institute configuration.');
    } finally {
      setSavingSetting(false);
    }
  };

  const handleAddNewInstitute = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    const code = (newInstituteForm.instituteCode || '').trim().toUpperCase();
    if (!code) {
      alert('Institute Code is required (e.g. IIT, SEBA, MOM)');
      return;
    }

    try {
      const res = await axios.put(
        `/api/admin/settings/${code}`,
        {
          ...newInstituteForm,
          instituteCode: code,
          instituteName: newInstituteForm.instituteName || code,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInstituteSettings(prev => {
        const withoutCurrent = prev.filter(s => s.instituteCode !== code);
        return [...withoutCurrent, res.data.setting];
      });

      setActiveSettingCode(code);
      setNewInstituteModalOpen(false);
      setSettingSuccess(`New institute "${code}" created and configured successfully!`);
      setTimeout(() => setSettingSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to create new institute setting:', err);
      alert('Failed to add new institute. Please check inputs.');
    }
  };

  const updateActiveSettingField = (field, val) => {
    setInstituteSettings(prev => {
      const exists = prev.some(s => s.instituteCode === activeSettingCode);
      if (!exists) {
        return [...prev, { instituteCode: activeSettingCode, [field]: val }];
      }
      return prev.map(s => s.instituteCode === activeSettingCode ? { ...s, [field]: val } : s);
    });
  };

  // Users Management Handlers
  const handleOpenUserModal = (user = null) => {
    setUserActionError('');
    setUserActionSuccess('');
    if (user) {
      setEditingUserId(user.id);
      setUserForm({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        institute: user.institute || 'IMM',
      });
    } else {
      setEditingUserId(null);
      setUserForm({
        name: '',
        email: '',
        password: '',
        role: 'ADMIN',
        institute: isRestrictedToInstitute || 'IMM',
      });
    }
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    setUserActionError('');
    setUserActionSuccess('');

    try {
      if (editingUserId) {
        const payload = {
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          institute: userForm.institute,
        };
        if (userForm.password.trim()) {
          payload.password = userForm.password;
        }

        const res = await axios.put(`/api/admin/users/${editingUserId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUsersList(prev => prev.map(u => u.id === editingUserId ? res.data.user : u));
        setUserActionSuccess('User updated successfully!');
      } else {
        if (!userForm.password) {
          setUserActionError('Password is required for new user.');
          return;
        }
        const res = await axios.post('/api/admin/users', userForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsersList(prev => [res.data, ...prev]);
        setUserActionSuccess('User created successfully!');
      }
      setUserModalOpen(false);
      setTimeout(() => setUserActionSuccess(''), 4000);
    } catch (err) {
      console.error('User save error:', err);
      setUserActionError(err.response?.data?.error || 'Failed to save user.');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (id === currentUser.id) {
      alert('You cannot delete your own account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return;

    const token = localStorage.getItem('admin_token');
    try {
      await axios.delete(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsersList(prev => prev.filter(u => u.id !== id));
      setUserActionSuccess(`User "${name}" deleted.`);
      setTimeout(() => setUserActionSuccess(''), 4000);
    } catch (err) {
      console.error('Delete user error:', err);
      alert('Failed to delete user.');
    }
  };

  // Export to Excel
  const handleExport = () => {
    try {
      const exportData = filteredRsvps.map((rsvp) => {
        const title = rsvp.event?.title || 'Unknown Event';
        const venue = rsvp.event?.venue || '-';
        const eventDate = rsvp.event?.date ? new Date(rsvp.event.date).toLocaleDateString() : '-';
        const institute = inferInstitute(title, rsvp.event?.slug || '', venue, rsvp.event?.institute);
        const name = getRsvpName(rsvp);
        const email = getRsvpEmail(rsvp);
        const mobile = getRsvpMobile(rsvp);
        const amount = getRsvpAmount(rsvp);

        const row = {
          'RSVP ID': rsvp.id,
          'Participant Name': name,
          'Email': email,
          'Mobile': mobile,
          'Event Title': title,
          'Institute': institute,
          'Event Date': eventDate,
          'Venue': venue,
          'Status': rsvp.status?.toUpperCase() || 'INITIATED',
          'Amount (Rs.)': amount,
          'Transaction ID': rsvp.txnid || '-',
          'Registration Date': formatDateTime(rsvp.createdAt),
        };

        if (rsvp.formData && typeof rsvp.formData === 'object') {
          Object.entries(rsvp.formData).forEach(([k, v]) => {
            const cleanKey = normalizeLabel(k);
            if (!row[cleanKey] && v !== null && v !== undefined) {
              row[cleanKey] = typeof v === 'object' ? JSON.stringify(v) : String(v);
            }
          });
        }

        return row;
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'RSVPs');
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, `met_rsvps_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'institute' || key === 'year') {
        const targetInst = isRestrictedToInstitute || (key === 'institute' ? value : next.institute);
        const targetYear = key === 'year' ? value : next.year;
        if (next.eventId) {
          const selectedEvent = events.find(e => e.id.toString() === next.eventId);
          if (selectedEvent) {
            const inst = inferInstitute(selectedEvent.title, selectedEvent.slug, selectedEvent.venue, selectedEvent.institute);
            const year = selectedEvent.date ? new Date(selectedEvent.date).getFullYear().toString() : '';
            if ((targetInst && inst !== targetInst) || (targetYear && year !== targetYear)) {
              next.eventId = '';
            }
          }
        }
      }
      return next;
    });
  };

  const activeSettingObj = instituteSettings.find(s => s.instituteCode === activeSettingCode) || {
    instituteCode: activeSettingCode,
    instituteName: '',
    payuKey: '',
    payuSalt: '',
    payuBaseUrl: 'https://secure.payu.in/_payment',
    emailUser: '',
    emailPass: '',
    adminEmails: '',
    whatsappLink: '',
    whatsappText: '',
    emailSubject: '',
    emailHeading: '',
    emailBody: '',
    emailFooter: '',
    brandColor: '#B91C1C',
  };

  const eventsForActiveSetting = useMemo(() => {
    return events.filter(e => inferInstitute(e.title, e.slug, e.venue, e.institute) === activeSettingCode);
  }, [events, activeSettingCode]);

  const selectedPreviewEvent = useMemo(() => {
    if (templatePreviewEventId) {
      return events.find(e => e.id.toString() === templatePreviewEventId) || null;
    }
    return eventsForActiveSetting[0] || null;
  }, [events, templatePreviewEventId, eventsForActiveSetting]);

  const samplePreviewData = useMemo(() => ({
    name: 'Rahul Sharma',
    eventName: selectedPreviewEvent ? selectedPreviewEvent.title : (activeSettingCode === 'IMM' ? 'SFX & Prosthetic Make-up Seminar' : `${activeSettingCode} National Conference 2026`),
    date: selectedPreviewEvent?.date ? new Date(selectedPreviewEvent.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '18th Oct 2026, 10:00 AM',
    venue: selectedPreviewEvent?.venue || 'MET Convention Centre, Bandra West, Mumbai',
    amount: selectedPreviewEvent?.fee ? String(selectedPreviewEvent.fee) : '2000',
    txnid: 'TXN982341',
    instituteName: activeSettingObj.instituteName || activeSettingCode,
  }), [selectedPreviewEvent, activeSettingCode, activeSettingObj.instituteName]);

  const renderPreviewText = (template, fallback = '') => {
    let text = (template !== undefined && template !== null && template !== '') ? template : fallback;
    if (!text) return '';
    return text
      .replace(/\{name\}/g, samplePreviewData.name)
      .replace(/\{eventName\}/g, samplePreviewData.eventName)
      .replace(/\{eventTitle\}/g, samplePreviewData.eventName)
      .replace(/\{confName\}/g, samplePreviewData.eventName)
      .replace(/\{date\}/g, samplePreviewData.date)
      .replace(/\{venue\}/g, samplePreviewData.venue)
      .replace(/\{amount\}/g, samplePreviewData.amount)
      .replace(/\{txnid\}/g, samplePreviewData.txnid)
      .replace(/\{instituteName\}/g, samplePreviewData.instituteName);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 p-4 lg:flex-row lg:p-6">
        
        {/* Sidebar */}
        <aside className="w-full rounded-3xl bg-slate-900 p-5 text-white shadow-xl lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-72 lg:flex-shrink-0 flex flex-col justify-between">
          <div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-red-400 font-bold">MET Admin Portal</p>
              <h1 className="mt-1 text-2xl font-bold">Payments & Events</h1>
              <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-800/80 px-3 py-1.5 border border-slate-700 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-semibold text-slate-200 truncate max-w-[160px]">
                  {currentUser.name || 'Admin'}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-600/30 text-red-300 font-bold uppercase">
                  {currentUser.role || 'ADMIN'}
                </span>
              </div>
              {isRestrictedToInstitute && (
                <p className="mt-1.5 text-[11px] text-amber-300 font-medium">
                  🔒 Scoped to: <strong className="text-white">{isRestrictedToInstitute}</strong>
                </p>
              )}
            </div>

            <div className="mt-6 space-y-1.5">
              {/* If user is not SUPERADMIN, they only see Registrations and Export */}
              {!isSuperAdmin ? (
                <>
                  <button
                    onClick={() => setActiveView('rsvps')}
                    className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-bold transition flex items-center justify-between ${activeView === 'rsvps' ? 'bg-white text-slate-900 shadow-md' : 'bg-slate-800/60 text-slate-200 hover:bg-slate-800'}`}
                  >
                    <span>Registered Participants</span>
                    <span className="rounded-full bg-red-600 text-white px-2.5 py-0.5 text-xs font-bold">
                      {filteredRsvps.length}
                    </span>
                  </button>

                  <div className="pt-2">
                    <button
                      onClick={handleExport}
                      className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-left text-sm font-bold text-white transition hover:bg-emerald-500 shadow-md flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" /> Export Excel ({filteredRsvps.length})
                    </button>
                  </div>
                </>
              ) : (
                /* SUPERADMIN Full Management Menu */
                <>
                  <button
                    onClick={() => setActiveView('overview')}
                    className={`w-full rounded-2xl px-4 py-2.5 text-left text-sm font-medium transition flex items-center gap-2.5 ${activeView === 'overview' ? 'bg-white text-slate-900 font-bold shadow-md' : 'bg-slate-800/60 text-slate-200 hover:bg-slate-800'}`}
                  >
                    <span>Dashboard Overview</span>
                  </button>

                  <button
                    onClick={() => setActiveView('status-board')}
                    className={`w-full rounded-2xl px-4 py-2.5 text-left text-sm font-medium transition flex items-center justify-between ${activeView === 'status-board' ? 'bg-white text-slate-900 font-bold shadow-md' : 'bg-slate-800/60 text-slate-200 hover:bg-slate-800'}`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Link2 className="w-4 h-4 text-emerald-400" />
                      <span>Link Board</span>
                    </span>
                    <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-xs font-bold">
                      {summary.activeLinksCount} Open
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveView('rsvps')}
                    className={`w-full rounded-2xl px-4 py-2.5 text-left text-sm font-medium transition flex items-center justify-between ${activeView === 'rsvps' ? 'bg-white text-slate-900 font-bold shadow-md' : 'bg-slate-800/60 text-slate-200 hover:bg-slate-800'}`}
                  >
                    <span>RSVP & Payments</span>
                    <span className="rounded-full bg-slate-700 text-slate-300 px-2 py-0.5 text-xs font-bold">
                      {summary.totalRsvps}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveView('events')}
                    className={`w-full rounded-2xl px-4 py-2.5 text-left text-sm font-medium transition flex items-center gap-2.5 ${activeView === 'events' ? 'bg-white text-slate-900 font-bold shadow-md' : 'bg-slate-800/60 text-slate-200 hover:bg-slate-800'}`}
                  >
                    <span>Events Library</span>
                  </button>

                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={() => setActiveView('settings')}
                      className={`w-full rounded-2xl px-4 py-2.5 text-left text-sm font-medium transition flex items-center gap-2.5 ${activeView === 'settings' ? 'bg-white text-slate-900 font-bold shadow-md' : 'bg-slate-800/60 text-slate-200 hover:bg-slate-800'}`}
                    >
                      <Settings className="w-4 h-4 text-amber-400" />
                      <span>Payment & Email Setup</span>
                    </button>

                    <button
                      onClick={() => setActiveView('users')}
                      className={`w-full rounded-2xl px-4 py-2.5 text-left text-sm font-medium transition flex items-center justify-between ${activeView === 'users' ? 'bg-white text-slate-900 font-bold shadow-md' : 'bg-slate-800/60 text-slate-200 hover:bg-slate-800'}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span>User Logins & Access</span>
                      </span>
                      <span className="rounded-full bg-blue-500/20 text-blue-300 px-2 py-0.5 text-xs font-bold">
                        {usersList.length}
                      </span>
                    </button>
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={() => navigate('/admin/create-event')}
                      className="w-full rounded-2xl bg-red-600 px-4 py-2.5 text-left text-sm font-bold text-white transition hover:bg-red-500 shadow-md flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Create New Event
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
            <div className="rounded-2xl bg-slate-800/70 p-3 text-[11px] text-slate-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Zero-loss guarantee: Editing forms or toggling gateways never deletes stored RSVP records.</span>
            </div>

            <button
              onClick={handleLogout}
              className="w-full rounded-2xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Log Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 space-y-6">

          {/* Filter Bar (Visible in overview, status-board, rsvps, events) */}
          {['overview', 'status-board', 'rsvps', 'events'].includes(activeView) && (
            <section className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-600">Event Link & Registration Control</p>
                  <h2 className="mt-1 text-2xl font-bold">Filter by Institute, Status & Event</h2>
                </div>
                <button
                  onClick={handleExport}
                  className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500 shadow-sm flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Export Excel ({filteredRsvps.length} Records)
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {/* 1. Institute Selector */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">🏛️ Institute</label>
                  <select
                    value={filters.institute}
                    disabled={!!isRestrictedToInstitute}
                    onChange={(e) => updateFilter('institute', e.target.value)}
                    className={`rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500 ${isRestrictedToInstitute ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-800'}`}
                  >
                    {!isRestrictedToInstitute && <option value="">All Institutes</option>}
                    {availableInstituteCodes.map((code) => (
                      <option key={code} value={code}>
                        {code} {code === 'IMM' ? '(Management & SFX)' : code === 'IOP' ? '(Pharmacy)' : code === 'ICS' ? '(Computer Science)' : code === 'PGDM' ? '(AMDC)' : ''}
                      </option>
                    ))}
                    {!isRestrictedToInstitute && <option value="Other">Other</option>}
                  </select>
                </div>

                {/* 2. Event Selector (Adjacent to Institute) */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    🎯 Event ({availableEventsForDropdown.length})
                  </label>
                  <select
                    value={filters.eventId}
                    onChange={(e) => updateFilter('eventId', e.target.value)}
                    className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold truncate max-w-full focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-slate-800"
                  >
                    <option value="">
                      {filters.institute
                        ? `All ${filters.institute} Events (${availableEventsForDropdown.length})`
                        : `All Events (${availableEventsForDropdown.length})`}
                    </option>
                    {availableEventsForDropdown.map((event) => (
                      <option key={event.id} value={event.id.toString()}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Payment Status */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">💳 Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => updateFilter('status', e.target.value)}
                    className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-slate-800"
                  >
                    <option value="">All statuses</option>
                    <option value="success">Success (Paid)</option>
                    <option value="failed">Failed</option>
                    <option value="initiated">Initiated</option>
                  </select>
                </div>

                {/* 4. Year */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">📅 Year</label>
                  <select
                    value={filters.year}
                    onChange={(e) => updateFilter('year', e.target.value)}
                    className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-slate-800"
                  >
                    <option value="">All years</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* 5. Search Bar */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">🔍 Search</label>
                  <input
                    type="text"
                    placeholder="Search name, email..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-slate-800"
                  />
                </div>
              </div>
            </section>
          )}

          {/* VIEW: SETTINGS (Payment & Email Setup) */}
          {activeView === 'settings' && (
            <div className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      Gateway & Email Configuration
                    </span>
                    <h2 className="text-2xl font-bold mt-2 text-slate-900">Configure Institute PayU & Email Settings</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Configure PayU gateway credentials (Key, Salt), SMTP sender email, App password, and CC recipient lists per institute.
                    </p>
                  </div>
                  {settingSuccess && (
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-xs font-bold text-emerald-700 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" /> {settingSuccess}
                    </div>
                  )}
                </div>

                {/* Institute selector tabs */}
                <div className="flex flex-wrap items-center gap-2 mt-6">
                  {availableInstituteCodes.map((code) => {
                    const isAllowed = !isRestrictedToInstitute || isRestrictedToInstitute === code;
                    const instObj = (instituteSettings || []).find(s => s.instituteCode === code);
                    return (
                      <button
                        key={code}
                        disabled={!isAllowed}
                        onClick={() => {
                          setActiveSettingCode(code);
                          setSettingSuccess('');
                        }}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 border ${
                          activeSettingCode === code
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : isAllowed
                              ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <span>{code}</span>
                        <span className="text-[10px] font-normal opacity-80">
                          {code === 'IMM' ? '(SFX & Management)' : code === 'IOP' ? '(Pharmacy)' : code === 'ICS' ? '(Computer Science)' : code === 'PGDM' ? '(AMDC)' : instObj?.instituteName ? `(${instObj.instituteName.slice(0, 15)})` : ''}
                        </span>
                      </button>
                    );
                  })}

                  {/* Add New Institute Button */}
                  {(!isRestrictedToInstitute || currentUser.role === 'SUPERADMIN') && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewInstituteForm({
                          instituteCode: '',
                          instituteName: '',
                          payuKey: '',
                          payuSalt: '',
                          payuBaseUrl: 'https://secure.payu.in/_payment',
                          emailUser: '',
                          emailPass: '',
                          adminEmails: '',
                          whatsappLink: '',
                          whatsappText: '',
                        });
                        setNewInstituteModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Add New Institute
                    </button>
                  )}
                </div>

                {/* Sub-tab Navigation */}
                <div className="flex flex-wrap items-center gap-3 mt-6 border-b border-slate-200 pb-3">
                  <button
                    type="button"
                    onClick={() => setSettingSubTab('gateway')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      settingSubTab === 'gateway'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Payment Gateway & Credentials</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingSubTab('template')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      settingSubTab === 'template'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5 text-amber-300" />
                    <span>Email Template Designer & Live UI Preview</span>
                    <span className="px-1.5 py-0.5 bg-white/20 text-[10px] rounded-full uppercase tracking-wider font-extrabold">Live</span>
                  </button>
                </div>

                {/* Settings Form */}
                <form onSubmit={handleSaveSetting} className="mt-6 space-y-6">
                  
                  {/* SUB-TAB 1: GATEWAY & CREDENTIALS */}
                  {settingSubTab === 'gateway' && (
                    <div className="space-y-6">
                      {/* General Institute Info */}
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-red-600" /> Institute Identity
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Institute Code</label>
                            <input
                              type="text"
                              value={activeSettingCode}
                              disabled
                              className="w-full px-3.5 py-2 rounded-xl bg-slate-200 border border-slate-300 font-bold text-xs text-slate-700"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Institute Display Name</label>
                            <input
                              type="text"
                              value={activeSettingObj.instituteName || ''}
                              onChange={(e) => updateActiveSettingField('instituteName', e.target.value)}
                              placeholder="e.g. MET Institute of Management"
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-red-500"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* PayU Gateway Section */}
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                            <Key className="w-4 h-4 text-amber-600" /> PayU Payment Gateway Credentials
                          </h3>
                          {activeSettingCode === 'IMM' && (
                            <span className="bg-red-100 text-red-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                              ⭐ Active for SFX & Make-up Seminar
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">PayU Merchant Key</label>
                            <input
                              type="text"
                              value={activeSettingObj.payuKey || ''}
                              onChange={(e) => updateActiveSettingField('payuKey', e.target.value)}
                              placeholder="e.g. wRoVzf"
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">PayU Merchant Salt</label>
                            <div className="relative">
                              <input
                                type={showPasswordMap[`salt_${activeSettingCode}`] ? 'text' : 'password'}
                                value={activeSettingObj.payuSalt || ''}
                                onChange={(e) => updateActiveSettingField('payuSalt', e.target.value)}
                                placeholder="Enter merchant salt"
                                className="w-full px-3.5 py-2 pr-9 rounded-xl bg-white border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-red-500"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswordMap(p => ({ ...p, [`salt_${activeSettingCode}`]: !p[`salt_${activeSettingCode}`] }))}
                                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                              >
                                {showPasswordMap[`salt_${activeSettingCode}`] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Endpoint URL</label>
                            <input
                              type="text"
                              value={activeSettingObj.payuBaseUrl || 'https://secure.payu.in/_payment'}
                              onChange={(e) => updateActiveSettingField('payuBaseUrl', e.target.value)}
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-red-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Email & CC Notifications Section */}
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-blue-600" /> Email Notifications & CC List
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">SMTP Sender Email (Gmail/Workspace)</label>
                            <input
                              type="email"
                              value={activeSettingObj.emailUser || ''}
                              onChange={(e) => updateActiveSettingField('emailUser', e.target.value)}
                              placeholder="e.g. mdp_imm@met.edu"
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Email App Password</label>
                            <div className="relative">
                              <input
                                type={showPasswordMap[`mail_${activeSettingCode}`] ? 'text' : 'password'}
                                value={activeSettingObj.emailPass || ''}
                                onChange={(e) => updateActiveSettingField('emailPass', e.target.value)}
                                placeholder="Enter 16-character Google App Password"
                                className="w-full px-3.5 py-2 pr-9 rounded-xl bg-white border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-red-500"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswordMap(p => ({ ...p, [`mail_${activeSettingCode}`]: !p[`mail_${activeSettingCode}`] }))}
                                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                              >
                                {showPasswordMap[`mail_${activeSettingCode}`] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-slate-700">
                              CC Recipients / Admin Alert Emails
                            </label>
                            <span className="text-[11px] text-slate-400">Comma-separated</span>
                          </div>
                          <input
                            type="text"
                            value={activeSettingObj.adminEmails || ''}
                            onChange={(e) => updateActiveSettingField('adminEmails', e.target.value)}
                            placeholder="e.g. dean_imm@met.edu, coordinator@met.edu, accounts@met.edu"
                            className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
                          />
                          <p className="text-[11px] text-slate-500 mt-1">
                            💡 Anyone listed here will automatically receive a CC copy of all registration confirmation emails and payment alerts for this institute.
                          </p>
                        </div>
                      </div>

                      {/* WhatsApp Integration Section (Optional) */}
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-emerald-600" /> WhatsApp Community Integration
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold uppercase tracking-wide">
                            Optional (ऐच्छिक)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          💡 WhatsApp ग्रुप लिंक देणे सक्तीचे नाही (100% Optional). जर तुमच्या इव्हेंटसाठी WhatsApp ग्रुप नसेल किंवा लिंक नको असेल, तर हे रिकाaction ठेवा (Leave blank). अशा वेळी ईमेलमध्ये WhatsApp चा कोणताही बॉक्स दिसणार नाही.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Group Joining Link (Optional - Leave blank if none)</label>
                            <input
                              type="url"
                              value={activeSettingObj.whatsappLink || ''}
                              onChange={(e) => updateActiveSettingField('whatsappLink', e.target.value)}
                              placeholder="https://chat.whatsapp.com/... (किंवा रिकामे ठेवा)"
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Custom Joining Message in Email (Optional)</label>
                            <input
                              type="text"
                              value={activeSettingObj.whatsappText || ''}
                              onChange={(e) => updateActiveSettingField('whatsappText', e.target.value)}
                              placeholder="We have received your registration..."
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 2: EMAIL TEMPLATE DESIGNER & LIVE PREVIEW */}
                  {settingSubTab === 'template' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Left Column: Template Form Controls (5 cols) */}
                      <div className="lg:col-span-5 space-y-5">
                        
                        {/* Associated Events for Active Setting */}
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-amber-500" /> Associated Events for {activeSettingCode}
                            </label>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
                              {eventsForActiveSetting.length} Event{eventsForActiveSetting.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Select an event to preview and configure this email template for:
                          </p>
                          {eventsForActiveSetting.length > 0 ? (
                            <div className="pt-1">
                              <select
                                value={templatePreviewEventId || (selectedPreviewEvent?.id?.toString() || '')}
                                onChange={(e) => setTemplatePreviewEventId(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-red-500"
                              >
                                {eventsForActiveSetting.map((evt) => (
                                  <option key={evt.id} value={evt.id.toString()}>
                                    🎯 {evt.title} (/{evt.slug})
                                  </option>
                                ))}
                              </select>
                              {selectedPreviewEvent && (
                                <p className="text-[11px] text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
                                  <span>✓ Currently previewing:</span>
                                  <strong className="font-bold">{selectedPreviewEvent.title}</strong>
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">No events currently linked to {activeSettingCode}</p>
                          )}
                        </div>

                        {/* Brand Theme Accent Color */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                              <Palette className="w-4 h-4 text-red-600" /> Brand Theme Color
                            </label>
                            <span className="text-[11px] font-mono font-bold text-slate-500">
                              {activeSettingObj.brandColor || '#B91C1C'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={activeSettingObj.brandColor || '#B91C1C'}
                              onChange={(e) => updateActiveSettingField('brandColor', e.target.value)}
                              className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5 bg-white shadow-sm"
                            />
                            <div className="flex flex-wrap items-center gap-1.5">
                              {[
                                { color: '#B91C1C', name: 'Crimson' },
                                { color: '#C8282B', name: 'MET Red' },
                                { color: '#1E40AF', name: 'Navy' },
                                { color: '#059669', name: 'Emerald' },
                                { color: '#7C3AED', name: 'Purple' },
                                { color: '#D97706', name: 'Amber' },
                              ].map((preset) => (
                                <button
                                  key={preset.color}
                                  type="button"
                                  onClick={() => updateActiveSettingField('brandColor', preset.color)}
                                  className={`h-7 px-2.5 rounded-lg text-[10px] font-bold text-white transition shadow-xs flex items-center gap-1 ${
                                    (activeSettingObj.brandColor || '#B91C1C') === preset.color ? 'ring-2 ring-offset-2 ring-slate-900' : 'opacity-85 hover:opacity-100'
                                  }`}
                                  style={{ backgroundColor: preset.color }}
                                >
                                  {preset.name}
                                </button>
                              ))}
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Colors the top email header banner, buttons, and summary borders.
                          </p>
                        </div>

                        {/* Subject Line */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Email Subject Line
                          </label>
                          <input
                            type="text"
                            value={activeSettingObj.emailSubject || ''}
                            onChange={(e) => updateActiveSettingField('emailSubject', e.target.value)}
                            placeholder="Registration & Payment Confirmed - {eventName}"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-red-500"
                          />
                          <div className="flex flex-wrap gap-1 pt-1">
                            <span className="text-[10px] text-slate-400 self-center mr-1">Insert tag:</span>
                            {['{eventName}', '{name}', '{amount}', '{date}'].map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                  const cur = activeSettingObj.emailSubject || 'Registration & Payment Confirmed - {eventName}';
                                  updateActiveSettingField('emailSubject', `${cur} ${tag}`);
                                }}
                                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-mono font-bold text-slate-600 shadow-2xs"
                              >
                                + {tag}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Header Banner Heading */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Email Banner Header Text
                          </label>
                          <input
                            type="text"
                            value={activeSettingObj.emailHeading || ''}
                            onChange={(e) => updateActiveSettingField('emailHeading', e.target.value)}
                            placeholder="🎉 Registration Confirmed!"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-red-500"
                          />
                          <p className="text-[11px] text-slate-500">
                            Displayed inside the colored header banner directly below the institute title.
                          </p>
                        </div>

                        {/* Custom Confirmation Message Body */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                              Custom Confirmation Message
                            </label>
                            <span className="text-[10px] text-slate-400">Supports multiline text</span>
                          </div>
                          <textarea
                            rows={6}
                            value={activeSettingObj.emailBody || ''}
                            onChange={(e) => updateActiveSettingField('emailBody', e.target.value)}
                            placeholder={`Dear {name},\n\nThank you for registering for {eventName}! Your registration and payment of Rs. {amount} have been successfully verified.\n\nWe look forward to welcoming you to the session.`}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-normal focus:ring-2 focus:ring-red-500 leading-relaxed font-sans"
                          />
                          <div className="flex flex-wrap gap-1 pt-1">
                            <span className="text-[10px] text-slate-400 self-center mr-1">Dynamic placeholders:</span>
                            {['{name}', '{eventName}', '{amount}', '{date}', '{venue}', '{txnid}', '{instituteName}'].map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                  const cur = activeSettingObj.emailBody || '';
                                  updateActiveSettingField('emailBody', cur ? `${cur} ${tag}` : tag);
                                }}
                                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-mono font-bold text-red-600 shadow-2xs"
                              >
                                + {tag}
                              </button>
                            ))}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            💡 Placeholders will be replaced automatically with each registrant's actual details.
                          </p>
                        </div>

                        {/* Email Sign-off / Footer */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Footer Sign-off & Contact Info
                          </label>
                          <textarea
                            rows={4}
                            value={activeSettingObj.emailFooter || ''}
                            onChange={(e) => updateActiveSettingField('emailFooter', e.target.value)}
                            placeholder={`Warm regards,\n${activeSettingObj.instituteName || activeSettingCode}\nMumbai Educational Trust (MET)\nBandra West, Mumbai - 400050`}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 leading-relaxed font-sans"
                          />
                        </div>
                      </div>

                      {/* Right Column: Live Email Client Mockup Preview (7 cols) */}
                      <div className="lg:col-span-7 sticky top-8">
                        <div className="rounded-3xl border border-slate-300 bg-slate-900 shadow-2xl overflow-hidden text-slate-800">
                          
                          {/* Mockup Window Bar */}
                          <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                              <span className="text-xs font-bold text-slate-300 ml-2 font-mono flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Live Confirmation Email Preview
                              </span>
                            </div>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                              Recipient Client View
                            </span>
                          </div>

                          {/* Event Preview Selector Toolbar */}
                          <div className="bg-slate-800/95 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" /> Previewing For Event:
                              </span>
                            </div>
                            {eventsForActiveSetting.length > 0 ? (
                              <select
                                value={templatePreviewEventId || (selectedPreviewEvent?.id?.toString() || '')}
                                onChange={(e) => setTemplatePreviewEventId(e.target.value)}
                                className="rounded-xl border border-slate-600 bg-slate-700/90 px-3 py-1 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                              >
                                {eventsForActiveSetting.map((evt) => (
                                  <option key={evt.id} value={evt.id.toString()}>
                                    {evt.title} (/{evt.slug})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Default Template Preview</span>
                            )}
                          </div>

                          {/* Email Headers Meta Box */}
                          <div className="bg-slate-800/90 px-5 py-3 border-b border-slate-700 text-slate-300 text-xs space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-400 w-16">From:</span>
                              <span className="text-white font-mono">{activeSettingObj.emailUser || 'mdp_imm@met.edu'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-400 w-16">To:</span>
                              <span className="text-white font-mono">rahul.sharma@example.com</span>
                            </div>
                            {activeSettingObj.adminEmails && (
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-400 w-16">Cc:</span>
                                <span className="text-amber-300 font-mono text-[11px] truncate">{activeSettingObj.adminEmails}</span>
                              </div>
                            )}
                            <div className="flex items-start gap-2 pt-1 border-t border-slate-700/60 mt-1">
                              <span className="font-semibold text-slate-400 w-16">Subject:</span>
                              <span className="text-emerald-300 font-bold">
                                {renderPreviewText(activeSettingObj.emailSubject, 'Registration & Payment Confirmed - {eventName}')}
                              </span>
                            </div>
                          </div>

                          {/* Email Body Container (styled as HTML email) */}
                          <div className="bg-slate-100 p-4 sm:p-6 overflow-y-auto max-h-[620px]">
                            <div className="max-w-[560px] mx-auto bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
                              
                              {/* Colored Header Banner */}
                              <div
                                className="p-6 text-white text-center transition-colors duration-200"
                                style={{ backgroundColor: activeSettingObj.brandColor || '#B91C1C' }}
                              >
                                <p className="text-xs uppercase tracking-[0.25em] font-semibold opacity-90">
                                  {activeSettingObj.instituteName || activeSettingCode}
                                </p>
                                <h1 className="text-xl sm:text-2xl font-extrabold mt-1">
                                  {renderPreviewText(activeSettingObj.emailHeading, '🎉 Registration Confirmed!')}
                                </h1>
                              </div>

                              {/* Email Body Content */}
                              <div className="p-6 space-y-5 text-xs text-slate-700 leading-relaxed">
                                
                                {/* Custom Message Body */}
                                <div className="whitespace-pre-line text-slate-800 text-[13px] bg-slate-50/70 p-4 rounded-xl border border-slate-100 font-sans">
                                  {renderPreviewText(
                                    activeSettingObj.emailBody,
                                    `Dear {name},\n\nThank you for registering for {eventName}! Your registration and payment of Rs. {amount} have been successfully verified.\n\nWe look forward to welcoming you to the session.`
                                  )}
                                </div>

                                {/* WhatsApp Community Card (Optional - only appears if whatsappLink is set) */}
                                {Boolean(activeSettingObj.whatsappLink && activeSettingObj.whatsappLink.trim()) && (
                                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 flex items-start gap-3">
                                    <MessageSquare className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                      <p className="font-bold text-emerald-950 text-xs">Official WhatsApp Group (Optional)</p>
                                      <p className="text-[11px] text-emerald-800 mt-0.5">
                                        {activeSettingObj.whatsappText || 'Join our WhatsApp group for updates, session schedule, and query resolution.'}
                                      </p>
                                      <a
                                        href={activeSettingObj.whatsappLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-block mt-2 px-3 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-lg shadow-xs hover:bg-emerald-700"
                                      >
                                        Join WhatsApp Group →
                                      </a>
                                    </div>
                                  </div>
                                )}

                                {/* Programme Details Box */}
                                <div className="rounded-xl border border-slate-200 overflow-hidden">
                                  <div className="bg-slate-100/90 px-3.5 py-2 font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                                    Event Details
                                  </div>
                                  <div className="p-3.5 space-y-2 bg-white">
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                      <span className="text-slate-500 font-medium">Event:</span>
                                      <span className="font-bold text-slate-900 text-right">{samplePreviewData.eventName}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                      <span className="text-slate-500 font-medium">Date & Time:</span>
                                      <span className="font-bold text-slate-900 text-right">{samplePreviewData.date}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                      <span className="text-slate-500 font-medium">Venue:</span>
                                      <span className="font-bold text-slate-900 text-right max-w-[240px] truncate">{samplePreviewData.venue}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                      <span className="text-slate-500 font-medium">Amount Paid:</span>
                                      <span className="font-bold text-emerald-600">Rs. {samplePreviewData.amount}</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                      <span className="text-slate-500 font-medium">Transaction ID:</span>
                                      <span className="font-mono text-slate-700 font-bold">{samplePreviewData.txnid}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Participant Summary */}
                                <div className="rounded-xl border border-slate-200 overflow-hidden">
                                  <div className="bg-slate-100/90 px-3.5 py-2 font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                                    Participant Information
                                  </div>
                                  <div className="p-3.5 space-y-1.5 bg-white text-slate-700">
                                    <p><strong className="text-slate-900">Name:</strong> Rahul Sharma</p>
                                    <p><strong className="text-slate-900">Email:</strong> rahul.sharma@example.com</p>
                                    <p><strong className="text-slate-900">Phone:</strong> +91 98765 43210</p>
                                  </div>
                                </div>

                                {/* Footer Sign-off */}
                                <div className="pt-3 border-t border-slate-200 text-slate-600 whitespace-pre-line text-xs font-sans">
                                  {renderPreviewText(
                                    activeSettingObj.emailFooter,
                                    `Warm regards,\n${activeSettingObj.instituteName || activeSettingCode}\nMumbai Educational Trust (MET)\nBandra West, Mumbai - 400050`
                                  )}
                                </div>

                                <p className="text-[10px] text-slate-400 text-center italic pt-2">
                                  This is an automated confirmation email. Please keep this for your records.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save Settings Button */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                    <button
                      type="submit"
                      disabled={savingSetting}
                      className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {savingSetting ? 'Saving Settings...' : `Save ${activeSettingCode} Settings & Template`}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* VIEW: USERS & ACCESS MANAGEMENT */}
          {activeView === 'users' && (
            <div className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                      Team & Role Management
                    </span>
                    <h2 className="text-2xl font-bold mt-2 text-slate-900">Admin Logins & Institute Access Rights</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Create logins for team members and assign which institute's registrations and events they can see and manage.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenUserModal(null)}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" /> + Add Team Member
                  </button>
                </div>

                {userActionSuccess && (
                  <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-bold text-emerald-700 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" /> {userActionSuccess}
                  </div>
                )}

                {/* Users Table */}
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Assigned Institute Access</th>
                        <th className="py-3 px-4">Created Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usersList.map((user) => {
                        const isSelf = user.id === currentUser.id;
                        const inst = user.institute?.toUpperCase() || 'ALL';
                        const badgeColor =
                          inst === 'IMM' ? 'bg-amber-100 text-amber-800' :
                          inst === 'IOP' ? 'bg-emerald-100 text-emerald-800' :
                          inst === 'ICS' ? 'bg-blue-100 text-blue-800' :
                          inst === 'PGDM' ? 'bg-purple-100 text-purple-800' :
                          'bg-slate-100 text-slate-800 font-bold';

                        return (
                          <tr key={user.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                              {user.name}
                              {isSelf && (
                                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-normal">
                                  You
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-600">{user.email}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                user.role === 'SUPERADMIN' ? 'bg-red-100 text-red-700' :
                                user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${badgeColor}`}>
                                {inst === 'ALL' || inst === 'MUMBAI EDUCATIONAL TRUST' ? '🌐 All Institutes (Unrestricted)' : `🏛️ ${inst}`}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-2">
                              <button
                                onClick={() => handleOpenUserModal(user)}
                                className="p-1.5 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition"
                                title="Edit User"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              {!isSelf && (
                                <button
                                  onClick={() => handleDeleteUser(user.id, user.name)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Quick Summary Cards (overview & status-board) */}
          {['overview', 'status-board'].includes(activeView) && (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Events</p>
                <p className="mt-2 text-3xl font-bold">{summary.totalEvents}</p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Links</p>
                <p className="mt-2 text-3xl font-bold text-emerald-600">{summary.activeLinksCount}</p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">IMM RSVPs</p>
                <p className="mt-2 text-3xl font-bold text-amber-600">{summary.immRsvps}</p>
                <p className="text-[11px] text-slate-400 mt-1">{summary.immEvents} events (SFX & Mgmt)</p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">IOP RSVPs</p>
                <p className="mt-2 text-3xl font-bold text-emerald-600">{summary.iopRsvps}</p>
                <p className="text-[11px] text-slate-400 mt-1">{summary.iopEvents} events</p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">ICS RSVPs</p>
                <p className="mt-2 text-3xl font-bold text-blue-600">{summary.icsRsvps}</p>
                <p className="text-[11px] text-slate-400 mt-1">{summary.icsEvents} events</p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Paid RSVPs</p>
                <p className="mt-2 text-3xl font-bold text-emerald-600">{summary.successfulPayments}</p>
              </div>
            </section>
          )}

          {/* VIEW: LINK ACTIVATION BOARD */}
          {['overview', 'status-board'].includes(activeView) && (
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Live Status Control
                  </span>
                  <h3 className="text-xl font-bold mt-2 text-slate-900">Event Link Activation & Control Board</h3>
                  <p className="text-xs text-slate-500 mt-1">Single-click toggle to open or close any event registration link.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> {summary.activeLinksCount} Open
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" /> {summary.inactiveLinksCount} Closed
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredEvents.map((event) => {
                  const isActive = event.isActive !== false;
                  const inst = inferInstitute(event.title, event.slug, event.venue, event.institute);
                  const isCopied = copiedSlug === event.slug;

                  return (
                    <div
                      key={event.id}
                      className={`rounded-2xl border p-5 transition-all shadow-sm flex flex-col justify-between ${
                        isActive
                          ? 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50/20'
                          : 'border-slate-200 bg-slate-50/80 opacity-90'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            inst === 'IMM' ? 'bg-amber-100 text-amber-800' :
                            inst === 'IOP' ? 'bg-emerald-100 text-emerald-800' :
                            inst === 'ICS' ? 'bg-blue-100 text-blue-800' :
                            inst === 'PGDM' ? 'bg-purple-100 text-purple-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {inst} Gateway
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            {isActive ? 'Link Active' : 'Deactivated'}
                          </span>
                        </div>

                        <h4 className="font-bold text-base mt-3 text-slate-900 line-clamp-2">{event.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 font-mono">/{event.slug}</p>

                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                          <p><span className="font-semibold text-slate-800">Fee:</span> {event.fee ? `Rs. ${event.fee}` : 'Free'}</p>
                          <p><span className="font-semibold text-slate-800">Venue:</span> {event.venue || 'MET Campus'}</p>
                          <p><span className="font-semibold text-slate-800">Form Fields:</span> {Array.isArray(event.formFields) ? event.formFields.length : 0} configured</p>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleStatus(event.id, isActive)}
                          className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                            isActive
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          {isActive ? 'Deactivate' : 'Activate Link'}
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(event)}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center gap-1"
                          title="Edit Event & Dynamic Form"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>

                        <button
                          onClick={() => handleCopyLink(event.slug)}
                          className={`p-2 rounded-xl text-xs font-bold transition border ${
                            isCopied
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                          title="Copy Public Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* VIEW: RSVP TABLE & DETAIL DRAWER */}
          {['overview', 'rsvps'].includes(activeView) && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 items-start">
              {/* Table */}
              <section className="rounded-3xl bg-white p-5 shadow-sm xl:col-span-2">
                <div className="flex items-center justify-between pb-4 border-b">
                  <h3 className="text-lg font-bold text-slate-900">Registered Participants ({filteredRsvps.length})</h3>
                  <span className="text-xs text-slate-400 font-mono">Showing filtered set</span>
                </div>

                <div className="mt-4 max-h-[620px] overflow-y-auto overflow-x-auto rounded-2xl border border-slate-100 shadow-inner">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 shadow-2xs">
                      <tr>
                        <th className="py-3 px-3">Participant</th>
                        <th className="py-3 px-3">Event & Inst</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Amount</th>
                        <th className="py-3 px-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRsvps.map((r) => {
                        const isSelected = r.id === selectedRsvpId;
                        const inst = inferInstitute(r.event?.title, r.event?.slug || '', r.event?.venue, r.event?.institute);

                        return (
                          <tr
                            key={r.id}
                            onClick={() => setSelectedRsvpId(r.id)}
                            className={`cursor-pointer transition ${isSelected ? 'bg-red-50/70' : 'hover:bg-slate-50'}`}
                          >
                            <td className="py-3 px-3">
                              <p className="font-bold text-slate-900">{getRsvpName(r)}</p>
                              <p className="text-[11px] text-slate-500 font-mono">{getRsvpEmail(r)}</p>
                              <p className="text-[11px] text-slate-400">{getRsvpMobile(r)}</p>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                {inst}
                              </span>
                              <p className="text-slate-800 font-medium line-clamp-1 mt-0.5">{r.event?.title || 'Unknown'}</p>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusClasses(r.status)}`}>
                                {r.status || 'initiated'}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-800">
                              {formatMoney(getRsvpAmount(r))}
                            </td>
                            <td className="py-3 px-3 text-slate-400 text-[11px] font-mono">
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Detail Drawer */}
              <section className="rounded-3xl bg-white p-5 shadow-sm xl:sticky xl:top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto">
                <h3 className="text-lg font-bold text-slate-900 border-b pb-3">Participant Details</h3>
                {selectedRsvp ? (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                      <p className="text-xs font-bold text-red-600 uppercase tracking-wider">
                        {inferInstitute(selectedRsvp.event?.title, selectedRsvp.event?.slug || '', selectedRsvp.event?.venue, selectedRsvp.event?.institute)}
                      </p>
                      <h4 className="text-lg font-bold text-slate-900 mt-1">{getRsvpName(selectedRsvp)}</h4>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">{getRsvpEmail(selectedRsvp)}</p>
                      <p className="text-xs text-slate-600">{getRsvpMobile(selectedRsvp)}</p>

                      <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400">Payment Status:</span>
                          <p className="font-bold uppercase text-emerald-700">{selectedRsvp.status}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Fee:</span>
                          <p className="font-bold text-slate-900">{formatMoney(getRsvpAmount(selectedRsvp))}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Registration Form Responses</p>
                      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                        {selectedRsvpFields.map((field, idx) => (
                          <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                            <span className="text-slate-500 font-semibold block">{field.label}</span>
                            <span className="text-slate-900 font-medium break-words">{String(field.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-8 text-center text-xs text-slate-400">Select a participant to view complete details.</p>
                )}
              </section>
            </div>
          )}

          {/* VIEW: EVENTS LIBRARY */}
          {activeView === 'events' && (
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 border-b pb-4">All Configured Events ({events.length})</h3>
              <div className="mt-6 divide-y divide-slate-100">
                {filteredEvents.map((evt) => (
                  <div key={evt.id} className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {inferInstitute(evt.title, evt.slug, evt.venue, evt.institute)}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">{evt.title}</h4>
                      <p className="text-xs text-slate-400 font-mono">/{evt.slug} • Venue: {evt.venue}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSuperAdmin && (
                        <button
                          onClick={() => {
                            const inst = inferInstitute(evt.title, evt.slug, evt.venue, evt.institute);
                            setActiveSettingCode(inst);
                            setTemplatePreviewEventId(evt.id.toString());
                            setActiveView('settings');
                            setSettingSubTab('template');
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 transition"
                          title="Customize email template for this event"
                        >
                          <Mail className="w-3.5 h-3.5 text-amber-600" />
                          <span>Email Template</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEditModal(evt)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleCopyLink(evt.slug)}
                        className="p-1.5 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-600"
                        title="Copy Link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {isSuperAdmin && (
                        <button
                          onClick={() => handleDeleteEvent(evt)}
                          className="p-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </main>
      </div>

      {/* MODAL: EDIT EVENT & FORM */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Edit Event & Form</h3>
                <p className="text-xs text-slate-500 font-mono">/{editingEvent.slug}</p>
              </div>
              <button onClick={() => setEditingEvent(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEventEdit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Custom Event Link URL (Slug)</label>
                <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent">
                  <span className="text-xs text-slate-500 font-mono select-none">{window.location.origin}/</span>
                  <input
                    type="text"
                    value={editingEvent.slug || ''}
                    onChange={(e) => setEditingEvent(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                    placeholder="my-custom-event-link"
                    className="w-full bg-transparent text-xs font-mono font-bold text-slate-900 focus:outline-none"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">💡 तुम्ही इव्हेंटची थेट URL लिंक येथून बदलू शकता (उदा. <code>imm-sfx-seminar</code>).</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Institute Gateway</label>
                  <select
                    value={editingEvent.institute || 'IMM'}
                    onChange={(e) => setEditingEvent(p => ({ ...p, institute: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  >
                    {availableInstituteCodes.map(code => (
                      <option key={code} value={code}>🏛️ {code} Gateway</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Registration Fee (Rs.)</label>
                  <input
                    type="number"
                    value={editingEvent.fee}
                    onChange={(e) => setEditingEvent(p => ({ ...p, fee: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Link Status</label>
                  <select
                    value={editingEvent.isActive !== false ? 'active' : 'inactive'}
                    onChange={(e) => setEditingEvent(p => ({ ...p, isActive: e.target.value === 'active' }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  >
                    <option value="active">Active (Open)</option>
                    <option value="inactive">Deactivated (Closed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Venue</label>
                <input
                  type="text"
                  value={editingEvent.venue}
                  onChange={(e) => setEditingEvent(p => ({ ...p, venue: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  required
                />
              </div>

              {/* Dynamic form fields editor */}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Dynamic Registration Form Fields</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newField = { name: `field_${Date.now()}`, type: 'text', label: 'New Field Label', required: false };
                      setEditingEvent(p => ({ ...p, formFields: [...(p.formFields || []), newField] }));
                    }}
                    className="text-xs bg-red-50 text-red-600 hover:bg-red-100 font-bold px-3 py-1 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Field
                  </button>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {(editingEvent.formFields || []).map((field, fIdx) => (
                    <div key={fIdx} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-2">
                      <input
                        type="text"
                        value={field.label || ''}
                        onChange={(e) => {
                          const updated = [...editingEvent.formFields];
                          updated[fIdx].label = e.target.value;
                          setEditingEvent(p => ({ ...p, formFields: updated }));
                        }}
                        placeholder="Field Label"
                        className="flex-1 px-2.5 py-1 rounded-lg border text-xs"
                      />
                      <select
                        value={field.type || 'text'}
                        onChange={(e) => {
                          const updated = [...editingEvent.formFields];
                          updated[fIdx].type = e.target.value;
                          setEditingEvent(p => ({ ...p, formFields: updated }));
                        }}
                        className="px-2 py-1 rounded-lg border text-xs"
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="tel">Phone</option>
                        <option value="select">Select</option>
                        <option value="radio">Radio</option>
                      </select>
                      <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={!!field.required}
                          onChange={(e) => {
                            const updated = [...editingEvent.formFields];
                            updated[fIdx].required = e.target.checked;
                            setEditingEvent(p => ({ ...p, formFields: updated }));
                          }}
                        /> Required
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editingEvent.formFields.filter((_, idx) => idx !== fIdx);
                          setEditingEvent(p => ({ ...p, formFields: updated }));
                        }}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirmation Email & Template Association Banner */}
              <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-slate-800">Confirmation Email & Template</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-mono">
                    {editingEvent.institute || 'IMM'} Template
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  या इव्हेंटची नोंदणी झाल्यावर सहभागींना <strong>{editingEvent.institute || 'IMM'}</strong> अंतर्गत कॉन्फिगर केलेला ईमेल पाठवला जातो. यामध्ये इव्हेंटचे नाव (<code>{'{eventName}'}</code>), तारीख, स्थळ आणि फी आपोआप समाविष्ट होते.
                </p>
                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      const inst = editingEvent.institute || 'IMM';
                      const evtId = editingEvent.id;
                      setEditingEvent(null);
                      setActiveSettingCode(inst);
                      setTemplatePreviewEventId(evtId.toString());
                      setActiveView('settings');
                      setSettingSubTab('template');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs hover:bg-amber-50 transition"
                  >
                    <Palette className="w-3.5 h-3.5 text-amber-600" />
                    Customize {editingEvent.institute || 'IMM'} Email Template & Live Preview &rarr;
                  </button>
                )}
              </div>

              <div className="pt-4 border-t flex items-center justify-between gap-2">
                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(editingEvent)}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    Delete Event
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setEditingEvent(null)}
                    className="px-4 py-2 rounded-xl border text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT TEAM USER */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingUserId ? 'Edit Team Member' : 'Add New Team Member'}
              </h3>
              <button onClick={() => setUserModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {userActionError && (
              <p className="mt-3 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                {userActionError}
              </p>
            )}

            <form onSubmit={handleSaveUser} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="e.g. rahul_imm@met.edu"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {editingUserId ? 'New Password (Leave blank to keep existing)' : 'Password'}
                </label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm(p => ({ ...p, password: e.target.value }))}
                  placeholder={editingUserId ? '••••••••' : 'Enter login password'}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  required={!editingUserId}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">User Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm(p => ({ ...p, role: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="VIEWER">Viewer</option>
                    {currentUser.role === 'SUPERADMIN' && <option value="SUPERADMIN">Super Admin</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Institute</label>
                  <select
                    value={userForm.institute}
                    onChange={(e) => setUserForm(p => ({ ...p, institute: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  >
                    {availableInstituteCodes.map(code => (
                      <option key={code} value={code}>🏛️ {code}</option>
                    ))}
                    <option value="ALL">🌐 All Institutes</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                >
                  {editingUserId ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW INSTITUTE SETTINGS */}
      {newInstituteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New Institute Gateway & Email</h3>
                <p className="text-xs text-slate-500">Configure a brand new department or institute</p>
              </div>
              <button onClick={() => setNewInstituteModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewInstitute} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Institute Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IIT, MOM, SEBA"
                    value={newInstituteForm.instituteCode}
                    onChange={(e) => setNewInstituteForm(p => ({ ...p, instituteCode: e.target.value.toUpperCase() }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold uppercase font-mono"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Short unique code (e.g. IIT)</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Institute Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MET Institute of Information Technology"
                    value={newInstituteForm.instituteName}
                    onChange={(e) => setNewInstituteForm(p => ({ ...p, instituteName: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    required
                  />
                </div>
              </div>

              {/* PayU */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-600" /> PayU Gateway Setup
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Merchant Key</label>
                    <input
                      type="text"
                      placeholder="e.g. MSAioA"
                      value={newInstituteForm.payuKey}
                      onChange={(e) => setNewInstituteForm(p => ({ ...p, payuKey: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-xl border text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Merchant Salt</label>
                    <input
                      type="text"
                      placeholder="Merchant Salt"
                      value={newInstituteForm.payuSalt}
                      onChange={(e) => setNewInstituteForm(p => ({ ...p, payuSalt: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-xl border text-xs font-mono bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Email & CC */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" /> Email & CC Notification Setup
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sender Email</label>
                    <input
                      type="email"
                      placeholder="e.g. seminar_iit@met.edu"
                      value={newInstituteForm.emailUser}
                      onChange={(e) => setNewInstituteForm(p => ({ ...p, emailUser: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-xl border text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email App Password</label>
                    <input
                      type="password"
                      placeholder="16-char App Password"
                      value={newInstituteForm.emailPass}
                      onChange={(e) => setNewInstituteForm(p => ({ ...p, emailPass: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-xl border text-xs font-mono bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CC Recipients (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="coordinator@met.edu, dean@met.edu"
                    value={newInstituteForm.adminEmails}
                    onChange={(e) => setNewInstituteForm(p => ({ ...p, adminEmails: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-xl border text-xs bg-white"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Everyone in this list will receive a CC copy of confirmation emails.</p>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewInstituteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md"
                >
                  Create & Save Institute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
