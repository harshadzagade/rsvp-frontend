import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarDays, MapPin, Wallet, Users } from 'lucide-react';
import RegisterForm from '../RegisterForm';
import { API_BASE } from '../../config';

const formatDate = (value) => {
  if (!value) return 'Date to be announced';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const inferAudience = (fields = []) => {
  const categoryField = fields.find((field) => field.name === 'category');
  return categoryField?.options?.join(', ') || 'Students, researchers, corporates, and faculty members';
};

const buildFeeRows = (event) => {
  const options = event?.feeOptions?.options || [];
  if (!options.length) {
    return [{ label: 'Standard registration', amount: event?.fee || 0 }];
  }

  return options.map((rule) => ({
    label: rule.conditions.map((condition) => condition.value).join(' / '),
    amount: rule.fee,
  }));
};

const FeeTable = ({ rows }) => (
  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 px-6 py-4">
      <h3 className="text-xl font-semibold text-slate-900">Fee Structure</h3>
    </div>
    <div className="divide-y divide-slate-100">
      {rows.map((row, index) => (
        <div key={`${row.label}-${index}`} className="flex items-center justify-between px-6 py-4 text-sm">
          <span className="font-medium text-slate-700">{row.label}</span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">Rs. {Number(row.amount).toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  </div>
);

const ConferenceLandingPage = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const { slug } = useParams();

  useEffect(() => {
    fetch(`${API_BASE}/events/slug/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Event not found');
        return res.json();
      })
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(`Failed to load event: ${slug}`, err);
        setLoadError('We could not load this event right now. Please check the link or try again later.');
        setLoading(false);
      });
  }, [slug]);

  const feeRows = useMemo(() => buildFeeRows(event), [event]);

  if (loading) {
    return <div className="p-10 text-center text-red-600">Loading event details...</div>;
  }

  if (!event) {
    return <div className="p-10 text-center text-red-600">{loadError || 'Event not found.'}</div>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#fff7ed,_#ffffff_45%,_#f8fafc)] text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <div>
            <h1 className="mt-2 text-lg font-semibold uppercase tracking-[0.35em] text-red-600">MET Events</h1>
          </div>
          <button
            onClick={() => document.getElementById('register-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="rounded-2xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Register Now
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <section className="">
          <div className="rounded-[32px] bg-slate-900 px-8 py-10 text-white shadow-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">Featured Programme</p>
            <h2 className="mt-4 text-4xl font-bold leading-tight">{event.title}</h2>
            <p className="mt-4  text-sm leading-7 text-slate-300">
              Register for this programme using the form below. Participants will receive a confirmation email after successful registration and payment.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-slate-300"><CalendarDays className="h-4 w-4" /> Date</div>
                <p className="mt-2 text-lg font-semibold text-white">{formatDate(event.date)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-slate-300"><MapPin className="h-4 w-4" /> Venue</div>
                <p className="mt-2 text-lg font-semibold text-white">{event.venue}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-slate-300"><Users className="h-4 w-4" /> Audience</div>
                <p className="mt-2 text-lg font-semibold text-white">{inferAudience(event.formFields)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-slate-300"><Wallet className="h-4 w-4" /> Fee</div>
                <p className="mt-2 text-lg font-semibold text-white">Rs. {Number(event.fee || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

        </section>

        <section id="register-form" className="mt-10 rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <div className="mb-6 px-2">
            <p className="text-xs uppercase tracking-[0.3em] text-red-600">Registration Form</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">Complete your registration</h3>
          </div>
          <RegisterForm eventId={event.id.toString()} />
        </section>
      </main>
    </div>
  );
};

export default ConferenceLandingPage;
