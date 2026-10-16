import React from 'react';
import { CalendarX, ArrowLeft, Mail, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EventClosed({ event, title, venue }) {
  const displayTitle = event?.title || title || 'Event Registration';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-center"
      >
        <div className="h-3 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />
        
        <div className="p-8">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-5 shadow-inner border border-red-100">
            <CalendarX className="w-8 h-8" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 mb-3">
            Registrations Closed
          </span>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {displayTitle}
          </h2>

          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Registrations for this event have officially concluded or been closed by the event organizing team.
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 text-left space-y-2.5">
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>Thank you for your overwhelming interest and support!</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>For assistance, please contact the organizing team or email <a href="mailto:events@met.edu" className="text-red-600 underline font-medium">events@met.edu</a>.</span>
            </div>
          </div>

          <div className="mt-6">
            <a
              href="https://www.met.edu"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Visit MET Official Website</span>
            </a>
          </div>
        </div>

        <div className="bg-slate-50 py-3 px-6 border-t border-slate-100 text-[11px] text-slate-400">
          Mumbai Educational Trust • Bhujbal Knowledge City
        </div>
      </motion.div>
    </div>
  );
}
