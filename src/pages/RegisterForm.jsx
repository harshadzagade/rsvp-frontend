import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function RegisterForm(props) {
  const { eventId: paramEventId } = useParams();
  const [calculatedFee, setCalculatedFee] = useState(null);
  const navigate = useNavigate();

  const eventId = props?.eventId || paramEventId;

  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!eventId) return;

    fetch(`/api/events/${eventId}`)
      .then(async res => {
        if (!res.ok) throw new Error('Invalid response');
        return res.json();
      })
      .then(data => {
        setEvent(data);
        const initialFormState = {};
        data.formFields.forEach(f => {
          initialFormState[f.name] = '';
        });
        setFormData(initialFormState);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading event:', err.message);
        setError('The event you are looking for could not be loaded. Please check the link or try again later.');
        setLoading(false);
        setEvent(null);
      });
  }, [eventId]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  useEffect(() => {
    if (!event) return;

    const baseFee = event.fee;
    const rules = event.feeOptions?.options || [];

    let matchedFee = baseFee;
    let matchedCurrency = 'INR';

    for (const rule of rules) {
      const logic = rule.logic || 'AND';
      const conditions = rule.conditions || [];

      const matches = conditions.map(cond => {
        const userValue = (formData[cond.field] || '').toString().toLowerCase();
        const ruleValue = (cond.value || '').toLowerCase();
        return userValue === ruleValue;
      });

      const isMatch = logic === 'AND' ? matches.every(Boolean) : matches.some(Boolean);

      if (isMatch) {
        matchedFee = rule.fee;
        matchedCurrency = rule.currency || 'INR';
        break;
      }
    }

    setCalculatedFee(`${matchedCurrency === 'INR' ? '₹' : matchedCurrency + ' '}${matchedFee}`);
  }, [formData, event]);

  const validate = () => {
    const newErrors = {};

    event.formFields.forEach(field => {
      const value = formData[field.name];

      if (field.required && !value) {
        newErrors[field.name] = `${field.label} is required`;
      }

      // Additional validations
      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field.name] = 'Please enter a valid email address';
        }
      }

      if (field.type === 'tel' && value) {
        const phoneRegex = /^[6-9]\d{9}$/; // Accepts Indian mobile numbers starting with 6-9
        if (!phoneRegex.test(value)) {
          newErrors[field.name] = 'Please enter a valid 10-digit mobile number';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      eventId: parseInt(eventId),
      fullName: formData.fullName || '',
      email: formData.email || '',
      mobile: formData.mobile || '',
      formData
    };

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.text();
      if (res.ok && result.includes('<form')) {
        const win = window.open('', '_self');
        win.document.open();
        win.document.write(result);
        win.document.close();
      } else {
        navigate('/thank-you');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Something went wrong while submitting your registration. Please try again.');
    }
  };

  if (loading) return <div className="p-6 text-center text-brand-700 animate-pulse">Loading event details...</div>;
  if (!event) return <div className="p-6 text-center text-red-600 animate-fade">{error || 'Event not found.'}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-brand-50 text-brand-900 p-4 md:p-8 max-w-2xl mx-auto"
    >
      <h1 className="text-2xl font-bold mb-4">Register for {event.title}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {event.formFields.map(field => (
          <div key={field.name}>
            <label className="block text-sm font-medium mb-1">
              {field.label}{field.required && ' *'}
            </label>
            {['text', 'email', 'tel'].includes(field.type) && (
              <>
                <input
                  type={field.type}
                  name={field.name}
                  required={field.required}
                  className={`w-full px-3 py-2 border rounded-md ${errors[field.name] ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData[field.name]}
                  onChange={e => handleChange(field.name, e.target.value)}
                />
                {errors[field.name] && (
                  <p className="text-sm text-red-500 mt-1">{errors[field.name]}</p>
                )}
              </>
            )}
            {field.type === 'radio' && (
              <div className="space-y-1">
                {field.options.map(option => (
                  <label key={option} className="inline-flex items-center mr-4">
                    <input
                      type="radio"
                      name={field.name}
                      value={option}
                      checked={formData[field.name] === option}
                      onChange={() => handleChange(field.name, option)}
                      required={field.required}
                      className="mr-1"
                    />
                    {option}
                  </label>
                ))}
                {errors[field.name] && (
                  <p className="text-sm text-red-500 mt-1">{errors[field.name]}</p>
                )}
              </div>
            )}
          </div>
        ))}
        {calculatedFee && (
          <div className="text-lg font-semibold text-green-700 border border-green-300 bg-green-50 px-4 py-2 rounded">
            Total Fee: {calculatedFee}
          </div>
        )}
        <button type="submit" className="w-full bg-red-600 hover:bg-brand-700 text-white py-2 rounded-lg">
          Proceed to Payment
        </button>
      </form>
    </motion.div>
  );
}
