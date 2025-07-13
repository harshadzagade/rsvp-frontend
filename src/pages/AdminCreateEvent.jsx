// src/pages/admin/AdminCreateEventForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminCreateEventForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', slug: '', date: '', venue: '', fee: '', formFields: []
  });
  const [error, setError] = useState('');
  const [fieldInput, setFieldInput] = useState({ name: '', label: '', type: 'text', required: false, options: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addFormField = () => {
    if (!fieldInput.name || !fieldInput.label) return;
    const newField = {
      ...fieldInput,
      options: (fieldInput.type === 'radio' || fieldInput.type === 'select')
        ? fieldInput.options.split(',').map(opt => opt.trim())
        : undefined
    };
    setForm(prev => ({
      ...prev,
      formFields: [...prev.formFields, newField]
    }));
    setFieldInput({ name: '', label: '', type: 'text', required: false, options: '' });
  };

  const deleteField = (index) => {
    setForm(prev => ({
      ...prev,
      formFields: prev.formFields.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('https://fdp.met.edu/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({ ...form, fee: parseInt(form.fee), date: new Date(form.date) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Event creation failed');
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Create New Event</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" placeholder="Title" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input name="slug" placeholder="Slug (e.g., imm_mdp)" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input name="date" type="datetime-local" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input name="venue" placeholder="Venue" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input name="fee" type="number" placeholder="Fee (₹)" className="w-full p-2 border rounded" onChange={handleChange} required />

        <div className="p-4 border rounded bg-gray-50">
          <h4 className="font-medium mb-2">Add Form Field</h4>
          <input placeholder="Field Name" value={fieldInput.name} onChange={e => setFieldInput({ ...fieldInput, name: e.target.value })} className="w-full p-2 border rounded mb-2" />
          <input placeholder="Field Label" value={fieldInput.label} onChange={e => setFieldInput({ ...fieldInput, label: e.target.value })} className="w-full p-2 border rounded mb-2" />

          <select value={fieldInput.type} onChange={e => setFieldInput({ ...fieldInput, type: e.target.value })} className="w-full p-2 border rounded mb-2">
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="tel">Phone</option>
            <option value="checkbox">Checkbox</option>
            <option value="radio">Radio</option>
            <option value="select">Dropdown</option>
          </select>

          {(fieldInput.type === 'radio' || fieldInput.type === 'select') && (
            <input
              placeholder="Comma separated options"
              value={fieldInput.options}
              onChange={e => setFieldInput({ ...fieldInput, options: e.target.value })}
              className="w-full p-2 border rounded mb-2"
            />
          )}

          <label className="inline-flex items-center mb-2">
            <input type="checkbox" checked={fieldInput.required} onChange={e => setFieldInput({ ...fieldInput, required: e.target.checked })} />
            <span className="ml-2">Required</span>
          </label>

          <button type="button" onClick={addFormField} className="ml-4 bg-blue-600 text-white px-4 py-1 rounded">Add Field</button>
        </div>

        {form.formFields.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Added Fields</h3>
            <ul className="list-disc pl-6 space-y-1">
              {form.formFields.map((f, i) => (
                <li key={i} className="flex justify-between items-center">
                  <span>{f.label} ({f.type}) {f.required && '*'}</span>
                  <button type="button" onClick={() => deleteField(i)} className="text-red-500 text-sm hover:underline">Remove</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded">Create Event</button>
      </form>
    </div>
  );
}
