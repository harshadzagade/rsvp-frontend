import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

const PGDM_MDP_TEMPLATE = {
  title: 'MDP Programme - Prevention of Sexual Harassment at Workplace: Training for Corporates and Academic Institutions',
  slug: 'pgdm-posh-mdp-2026',
  date: '2026-05-09T09:00',
  venue: 'MET Institute of PGDM, Bandra Reclamation, Mumbai',
  fee: '1250',
  formFields: [
    { name: 'fullName', label: 'Name of the person', type: 'text', required: true },
    { name: 'email', label: 'Email id', type: 'email', required: true },
    { name: 'mobile', label: 'Contact number', type: 'tel', required: true },
    { name: 'category', label: 'Category', type: 'select', required: true, options: ['Corporate', 'Academician', 'Student/Research Scholar'] },
    { name: 'participationMode', label: 'Participation Mode', type: 'radio', required: true, options: ['Offline', 'Online'] },
    { name: 'organisation', label: 'Organisation', type: 'text', required: true },
    { name: 'designation', label: 'Designation', type: 'text', required: true },
    { name: 'certificateName', label: 'Name to be printed on certificate', type: 'text', required: true },
    { name: 'joiningReason', label: 'Why you want to join this MDP', type: 'textarea', required: true },
  ],
  rules: [
    { logic: 'AND', conditions: [{ field: 'category', value: 'Corporate' }, { field: 'participationMode', value: 'Offline' }], fee: '1250', currency: 'INR' },
    { logic: 'AND', conditions: [{ field: 'category', value: 'Corporate' }, { field: 'participationMode', value: 'Online' }], fee: '600', currency: 'INR' },
    { logic: 'AND', conditions: [{ field: 'category', value: 'Academician' }, { field: 'participationMode', value: 'Offline' }], fee: '1000', currency: 'INR' },
    { logic: 'AND', conditions: [{ field: 'category', value: 'Academician' }, { field: 'participationMode', value: 'Online' }], fee: '500', currency: 'INR' },
    { logic: 'AND', conditions: [{ field: 'category', value: 'Student/Research Scholar' }, { field: 'participationMode', value: 'Offline' }], fee: '800', currency: 'INR' },
    { logic: 'AND', conditions: [{ field: 'category', value: 'Student/Research Scholar' }, { field: 'participationMode', value: 'Online' }], fee: '500', currency: 'INR' },
  ],
};

const emptyFieldInput = {
  name: '',
  label: '',
  type: 'text',
  required: false,
  options: '',
};

const emptyRule = {
  logic: 'AND',
  conditions: [{ field: '', value: '' }],
  fee: '',
  currency: 'INR',
};

export default function AdminCreateEventForm() {
  const navigate = useNavigate();
  const [editingFieldIndex, setEditingFieldIndex] = useState(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    date: '',
    venue: '',
    fee: '',
    formFields: [],
  });
  const [fieldInput, setFieldInput] = useState(emptyFieldInput);
  const [rules, setRules] = useState([]);
  const [currentRule, setCurrentRule] = useState(emptyRule);
  const [editingRuleIndex, setEditingRuleIndex] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const loadPgdmTemplate = () => {
    setForm({
      title: PGDM_MDP_TEMPLATE.title,
      slug: PGDM_MDP_TEMPLATE.slug,
      date: PGDM_MDP_TEMPLATE.date,
      venue: PGDM_MDP_TEMPLATE.venue,
      fee: PGDM_MDP_TEMPLATE.fee,
      formFields: PGDM_MDP_TEMPLATE.formFields,
    });
    setRules(PGDM_MDP_TEMPLATE.rules);
    setFieldInput(emptyFieldInput);
    setCurrentRule(emptyRule);
    setEditingFieldIndex(null);
    setEditingRuleIndex(null);
  };

  const addFormField = () => {
    if (!fieldInput.name || !fieldInput.label) return;

    const newField = {
      ...fieldInput,
      options:
        fieldInput.type === 'radio' || fieldInput.type === 'select'
          ? fieldInput.options.split(',').map((opt) => opt.trim()).filter(Boolean)
          : undefined,
    };

    if (editingFieldIndex !== null) {
      setForm((prev) => {
        const updatedFields = [...prev.formFields];
        updatedFields[editingFieldIndex] = newField;
        return { ...prev, formFields: updatedFields };
      });
      setEditingFieldIndex(null);
    } else {
      setForm((prev) => ({
        ...prev,
        formFields: [...prev.formFields, newField],
      }));
    }

    setFieldInput((prev) => ({ ...prev, name: '', label: '', options: '', required: false }));
  };

  const addCondition = () => {
    setCurrentRule((prev) => ({
      ...prev,
      conditions: [...prev.conditions, { field: '', value: '' }],
    }));
  };

  const updateCondition = (condIdx, field, value) => {
    setCurrentRule((prev) => {
      const updatedConditions = [...prev.conditions];
      updatedConditions[condIdx][field] = value;
      return { ...prev, conditions: updatedConditions };
    });
  };

  const removeCondition = (condIdx) => {
    setCurrentRule((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== condIdx),
    }));
  };

  const saveRule = () => {
    if (!currentRule.fee || currentRule.conditions.some((cond) => !cond.field || !cond.value)) return;

    if (editingRuleIndex !== null) {
      setRules((prev) => {
        const updatedRules = [...prev];
        updatedRules[editingRuleIndex] = { ...currentRule };
        return updatedRules;
      });
      setEditingRuleIndex(null);
    } else {
      setRules((prev) => [...prev, { ...currentRule }]);
    }

    setCurrentRule(emptyRule);
  };

  const editRule = (index) => {
    setCurrentRule({ ...rules[index] });
    setEditingRuleIndex(index);
  };

  const deleteRule = (index) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedFeeOptions = rules.map((rule) => ({
      ...rule,
      fee: parseFloat(rule.fee),
      conditions: rule.conditions,
      logic: rule.logic,
      currency: rule.currency || 'INR',
    }));

    const body = {
      ...form,
      fee: parseFloat(form.fee),
      date: new Date(form.date),
      formFields: form.formFields,
      feeOptions: cleanedFeeOptions.length ? { options: cleanedFeeOptions } : undefined,
    };

    try {
      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Event creation failed');
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const getFieldOptions = (fieldName) => {
    const field = form.formFields.find((f) => f.name === fieldName);
    return field && (field.type === 'radio' || field.type === 'select') ? field.options || [] : [];
  };

  const renderValueInput = (fieldName, value, onChange) => {
    const options = getFieldOptions(fieldName);
    if (options.length > 0) {
      return (
        <select value={value} onChange={onChange} className="border p-1 w-full rounded-md">
          <option value="">Select Value</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        placeholder="Value"
        value={value}
        onChange={onChange}
        className="border p-1 w-full rounded-md"
      />
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-r from-red-50 via-white to-amber-50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Create Event</h2>
            <p className="mt-1 text-sm text-slate-600">
              Load the PGDM preset to prefill the MDP programme, payment slabs, and registration fields.
            </p>
          </div>
          <button
            type="button"
            onClick={loadPgdmTemplate}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Load PGDM MDP Preset
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} className="border p-2 w-full rounded-md" required />
        <input name="slug" placeholder="Slug" value={form.slug} onChange={handleChange} className="border p-2 w-full rounded-md" required />
        <input name="date" type="datetime-local" value={form.date} onChange={handleChange} className="border p-2 w-full rounded-md" required />
        <input name="venue" placeholder="Venue" value={form.venue} onChange={handleChange} className="border p-2 w-full rounded-md" required />
        <input name="fee" type="number" value={form.fee} placeholder="Default Fee" onChange={handleChange} className="border p-2 w-full rounded-md" required />

        <div className="border p-4 rounded bg-gray-50 mt-4">
          <h4 className="font-semibold mb-2">Add Form Field</h4>
          <input
            placeholder="Field Name"
            value={fieldInput.name}
            onChange={(e) => setFieldInput({ ...fieldInput, name: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            placeholder="Field Label"
            value={fieldInput.label}
            onChange={(e) => setFieldInput({ ...fieldInput, label: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <select
            value={fieldInput.type}
            onChange={(e) => setFieldInput({ ...fieldInput, type: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="tel">Phone</option>
            <option value="checkbox">Checkbox</option>
            <option value="radio">Radio</option>
            <option value="select">Dropdown</option>
            <option value="textarea">Textarea</option>
          </select>
          {(fieldInput.type === 'radio' || fieldInput.type === 'select') && (
            <input
              placeholder="Comma separated options"
              value={fieldInput.options}
              onChange={(e) => setFieldInput({ ...fieldInput, options: e.target.value })}
              className="w-full p-2 border rounded mb-2"
            />
          )}
          <label className="inline-flex items-center mb-2">
            <input
              type="checkbox"
              checked={fieldInput.required}
              onChange={(e) => setFieldInput({ ...fieldInput, required: e.target.checked })}
            />
            <span className="ml-2">Required</span>
          </label>
          <button type="button" onClick={addFormField} className="ml-4 bg-blue-600 text-white px-4 py-1 rounded">
            {editingFieldIndex !== null ? 'Update Field' : 'Add Field'}
          </button>
          {form.formFields.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Added Fields:</h4>
              <ul className="space-y-2">
                {form.formFields.map((field, index) => (
                  <li key={index} className="bg-gray-100 p-2 rounded flex justify-between items-center">
                    <span>{field.label} ({field.name}) - {field.type}{field.required ? ' *' : ''}</span>
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setFieldInput({
                            name: field.name,
                            label: field.label,
                            type: field.type,
                            required: field.required,
                            options: field.options ? field.options.join(', ') : '',
                          });
                          setEditingFieldIndex(index);
                        }}
                        className="text-blue-600 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            formFields: prev.formFields.filter((_, i) => i !== index),
                          }));
                          if (editingFieldIndex === index) {
                            setFieldInput(emptyFieldInput);
                            setEditingFieldIndex(null);
                          }
                        }}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <h3 className="font-semibold mt-6">Define Fee Rule</h3>
        <div className="border p-4 mb-4 bg-gray-100 rounded">
          <h4 className="font-semibold mb-2">{editingRuleIndex !== null ? 'Edit Rule' : 'New Rule'}</h4>
          <div className="mb-2">
            <label className="block mb-1 font-medium">Logic for Conditions</label>
            <select
              value={currentRule.logic}
              onChange={(e) => setCurrentRule((prev) => ({ ...prev, logic: e.target.value }))}
              className="border p-2 w-full rounded-md"
            >
              <option value="AND">AND</option>
              <option value="OR">OR</option>
            </select>
          </div>
          {currentRule.conditions.map((cond, condIdx) => (
            <div key={condIdx} className="flex space-x-2 mb-2 items-center">
              <select
                value={cond.field}
                onChange={(e) => updateCondition(condIdx, 'field', e.target.value)}
                className="border p-2 w-1/2 rounded-md"
              >
                <option value="">Select Field</option>
                {form.formFields.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.label}
                  </option>
                ))}
              </select>
              {renderValueInput(
                cond.field,
                cond.value,
                (e) => updateCondition(condIdx, 'value', e.target.value)
              )}
              {currentRule.conditions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCondition(condIdx)}
                  className="text-red-600 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addCondition}
            className="text-blue-600 text-sm mb-2"
          >
            + Add Condition
          </button>
          <input
            type="number"
            placeholder="Fee"
            value={currentRule.fee}
            onChange={(e) => setCurrentRule((prev) => ({ ...prev, fee: e.target.value }))}
            className="border p-2 w-full mb-2 rounded-md"
          />
          <select
            value={currentRule.currency}
            onChange={(e) => setCurrentRule((prev) => ({ ...prev, currency: e.target.value }))}
            className="border p-2 w-full mb-2 rounded-md"
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
          </select>
          <button type="button" onClick={saveRule} className="bg-yellow-600 text-white px-4 py-1 rounded mt-2">
            {editingRuleIndex !== null ? 'Update Rule' : 'Save Rule'}
          </button>
          {editingRuleIndex !== null && (
            <button
              type="button"
              onClick={() => {
                setCurrentRule(emptyRule);
                setEditingRuleIndex(null);
              }}
              className="ml-2 bg-gray-600 text-white px-4 py-1 rounded mt-2"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="mt-4">
          <h4 className="font-semibold">Defined Rules:</h4>
          {rules.length === 0 ? (
            <p className="text-gray-600">No rules defined.</p>
          ) : (
            <ul className="space-y-2">
              {rules.map((rule, index) => (
                <li key={index} className="bg-gray-100 p-2 rounded flex justify-between items-center">
                  <span>
                    {rule.conditions
                      .map((cond) => `${form.formFields.find((f) => f.name === cond.field)?.label || cond.field} = ${cond.value}`)
                      .join(` ${rule.logic} `)} -> {rule.fee} {rule.currency}
                  </span>
                  <div>
                    <button
                      type="button"
                      onClick={() => editRule(index)}
                      className="text-blue-600 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRule(index)}
                      className="text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded mt-4">
          Create Event
        </button>
      </form>
    </div>
  );
}
