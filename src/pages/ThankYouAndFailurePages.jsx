import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const PageShell = ({ tone, title, message, ctaLabel, ctaTo }) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45 }}
    className={`min-h-screen px-4 py-12 ${tone}`}
  >
    <div className="mx-auto flex min-h-[80vh] max-w-4xl items-center justify-center">
      <div className="w-full overflow-hidden rounded-[32px] border border-white/50 bg-white shadow-2xl">
        <div className="grid md:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-slate-900 px-8 py-10 text-white md:px-10 md:py-14">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">MET Events</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight">{title}</h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">{message}</p>
            <div className="mt-8 h-px w-24 bg-white/20" />
            <p className="mt-8 text-sm text-slate-400">
              Please check your inbox for the registration details and payment confirmation.
            </p>
          </div>
          <div className="bg-gradient-to-br from-white via-slate-50 to-red-50 px-8 py-10 md:px-10 md:py-14">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">What happens next</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>Your registration details have been recorded.</li>
                <li>The certificate will use the submitted certificate name.</li>
              </ul>
              <Link
                to={ctaTo}
                className="mt-6 inline-flex rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export function ThankYouPage() {
  const location = useLocation();
  const isFree = new URLSearchParams(location.search).get('free') === 'true';

  return (
    <PageShell
      tone="bg-gradient-to-br from-emerald-100 via-white to-lime-50"
      title={isFree ? 'Registration Confirmed' : 'Payment Successful'}
      message={
        isFree
          ? "Your registration has been confirmed successfully. We've emailed the programme details to the participant and admin team."
          : "Your payment has been received successfully. We've emailed the programme details to the participant and admin team."
      }
      ctaLabel="Back to Home"
      ctaTo="/pgdm-posh-mdp-2026"
    />
  );
}

export function PaymentFailedPage() {
  const location = useLocation();
  const error = new URLSearchParams(location.search).get('error') || '';

  return (
    <PageShell
      tone="bg-gradient-to-br from-rose-100 via-white to-orange-50"
      title="Payment Failed"
      message={`We could not complete the payment for this registration.${error ? ` Error: ${error}.` : ''} You can return to the registration page and try again.`}
      ctaLabel="Try Again"
      ctaTo="/pgdm-posh-mdp-2026"
    />
  );
}
