import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminCreateEventForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    slug: '',
    date: '',
    venue: '',
    fee: '',
    formFields: [],
  });

  const [fieldInput, setFieldInput] = useState({
    name: '',
    label: '',
    type: 'text',
    required: false,
    options: '',
  });

  const [rules, setRules] = useState([]);
  const [currentRule, setCurrentRule] = useState({
    logic: 'AND',
    conditions: [{ field: '', value: '' }],
    fee: '',
    currency: 'INR',
  });
  const [editingRuleIndex, setEditingRuleIndex] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addFormField = () => {
    if (!fieldInput.name || !fieldInput.label) return;
    const newField = {
      ...fieldInput,
      options:
        fieldInput.type === 'radio' || fieldInput.type === 'select'
          ? fieldInput.options.split(',').map((opt) => opt.trim())
          : undefined,
    };
    setForm((prev) => ({
      ...prev,
      formFields: [...prev.formFields, newField],
    }));
    setFieldInput({ name: '', label: '', type: 'text', required: false, options: '' });
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
    if (
      !currentRule.fee ||
      currentRule.conditions.some((cond) => !cond.field || !cond.value)
    ) return;
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
    setCurrentRule({ logic: 'AND', conditions: [{ field: '', value: '' }], fee: '', currency: 'INR' });
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

    const cleanedFeeOptions = rules.map(rule => ({
      ...rule,
      fee: parseFloat(rule.fee), // ✅ ensure number
      conditions: rule.conditions,
      logic: rule.logic,
      currency: rule.currency || 'INR'
    }));

    const body = {
      ...form,
      fee: parseFloat(form.fee), // ✅ ensure number
      date: new Date(form.date),
      formFields: form.formFields,
      feeOptions: cleanedFeeOptions.length ? { options: cleanedFeeOptions } : undefined
    };

    try {
      const res = await fetch('https://fdp.met.edu/api/events', {
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

  // Helper to get field options
  const getFieldOptions = (fieldName) => {
    const field = form.formFields.find((f) => f.name === fieldName);
    return field && (field.type === 'radio' || field.type === 'select') ? field.options || [] : [];
  };

  // Render value input based on field type
  const renderValueInput = (fieldName, value, onChange) => {
    const options = getFieldOptions(fieldName);
    if (options.length > 0) {
      return (
        <select
          value={value}
          onChange={onChange}
          className="border p-1 w-full"
        >
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
        className="border p-1 w-full"
      />
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Admin Create Event with Fee Rules</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" placeholder="Title" onChange={handleChange} className="border p-2 w-full" required />
        <input name="slug" placeholder="Slug" onChange={handleChange} className="border p-2 w-full" required />
        <input name="date" type="datetime-local" onChange={handleChange} className="border p-2 w-full" required />
        <input name="venue" placeholder="Venue" onChange={handleChange} className="border p-2 w-full" required />
        <input name="fee" type="number" placeholder="Default Fee" onChange={handleChange} className="border p-2 w-full" required />

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
            Add Field
          </button>
        </div>

        <h3 className="font-semibold mt-6">Define Fee Rule</h3>
        <div className="border p-4 mb-4 bg-gray-100 rounded">
          <h4 className="font-semibold mb-2">{editingRuleIndex !== null ? 'Edit Rule' : 'New Rule'}</h4>
          <div className="mb-2">
            <label className="block mb-1 font-medium">Logic for Conditions</label>
            <select
              value={currentRule.logic}
              onChange={(e) => setCurrentRule((prev) => ({ ...prev, logic: e.target.value }))}
              className="border p-2 w-full"
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
                className="border p-2 w-1/2"
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
            className="border p-2 w-full mb-2"
          />
          <select
            value={currentRule.currency}
            onChange={(e) => setCurrentRule((prev) => ({ ...prev, currency: e.target.value }))}
            className="border p-2 w-full mb-2"
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
                setCurrentRule({ logic: 'AND', conditions: [{ field: '', value: '' }], fee: '', currency: 'INR' });
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
                      .join(` ${rule.logic} `)} → {rule.fee} {rule.currency}
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