import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const PageShell = ({ tone, title, message, ctaLabel, ctaTo, subMessage }) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45 }}
    className={`min-h-screen px-4 py-12 ${tone}`}
  >
    <div className="mx-auto flex min-h-[80vh] max-w-4xl items-center justify-center">
      <div className="w-full overflow-hidden rounded-[32px] border border-white/50 bg-white shadow-2xl">
        <div className="grid md:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-slate-900 px-8 py-10 text-white md:px-10 md:py-14 flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">MET Events</p>
              <h1 className="mt-4 text-3xl sm:text-4xl font-bold leading-tight">{title}</h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">{message}</p>
            </div>
            <div className="mt-8">
              <div className="h-px w-24 bg-white/20 mb-6" />
              <p className="text-xs text-slate-400 leading-relaxed">
                Please check your inbox for the official registration acknowledgment and programme details.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-white via-slate-50 to-red-50 px-8 py-10 md:px-10 md:py-14 flex flex-col justify-center">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">What happens next</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Your registration details have been securely recorded.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>An official acknowledgment has been emailed to you.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>The certificate will use the submitted participant name.</span>
                </li>
              </ul>

              {subMessage && (
                <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                  <p className="text-xs font-medium text-slate-500">{subMessage}</p>
                </div>
              )}

              <Link
                to={ctaTo}
                className="mt-5 flex items-center justify-center gap-2 w-full rounded-2xl bg-red-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-500 hover:shadow-red-600/35"
              >
                <span>{ctaLabel}</span>
                <span aria-hidden="true">&rarr;</span>
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
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const isFree = queryParams.get('free') === 'true';
  const slug = queryParams.get('slug') || 'imm-sfx-seminar';
  const targetUrl = `/${slug}`;
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(targetUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, targetUrl]);

  return (
    <div className="space-y-6">
      <PageShell
        tone="bg-gradient-to-br from-emerald-100 via-white to-lime-50"
        title={isFree ? 'Registration Confirmed' : 'Registration & Payment Successful'}
        message={
          isFree
            ? "Your registration has been confirmed successfully. An official acknowledgment email has been sent to your registered email address."
            : "Your registration and payment have been confirmed successfully. An official acknowledgment email has been sent to your registered email address."
        }
        subMessage={`Redirecting back to event page in ${countdown}s...`}
        ctaLabel="Back to Event Page"
        ctaTo={targetUrl}
      />
    </div>
  );
}

export function PaymentFailedPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const error = queryParams.get('error') || '';
  const slug = queryParams.get('slug') || 'imm-sfx-seminar';

  return (
    <PageShell
      tone="bg-gradient-to-br from-rose-100 via-white to-orange-50"
      title="Payment Failed"
      message={`We could not complete the payment for this registration.${error ? ` Error: ${error}.` : ''} You can return to the registration page and try again.`}
      ctaLabel="Try Again"
      ctaTo={`/${slug}`}
    />
  );
}
