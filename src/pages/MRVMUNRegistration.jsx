import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  Loader2,
  Mail,
  Info,
  Globe2,
  HelpCircle,
  FileCheck2,
  AlertTriangle,
  Phone
} from 'lucide-react';
import Swal from 'sweetalert2';
import mrvMunLogo from '../assets/MRV_MUN_logo.png';
import EventClosed from '../components/EventClosed';
import { API_BASE } from '../config';

const COMMITTEES = [
  'UNSC',
  'FIFA',
  'UNODC',
  'BRICS',
  'ECOSOC',
  'ICJ',
  'AIPPM',
  'UNHRC'
];

const AGENDAS = [
  {
    code: 'UNSC',
    name: 'United Nations Security Council',
    isJunior: false,
    agenda: 'Addressing Cross-Border Hostilities and External State Involvement to Prevent Further Regional Escalation across Israel, Lebanon and Syria',
    badge: 'Flagship'
  },
  {
    code: 'AIPPM',
    name: 'All India Political Parties Meet',
    isJunior: false,
    agenda: 'Deliberating Constitutional and Political Options concerning Article 370 and the Proposed Reorganisation of the State of Jammu and Kashmir (Time Freeze: 4 August 2019, 11:59 PM)',
    badge: 'National'
  },
  {
    code: 'FIFA',
    name: "Fédération Internationale de Football Association",
    isJunior: false,
    agenda: "Reforming FIFA's World Cup Bidding and Host-Selection Framework: Strengthening Transparency, Human Rights Standards, Evaluation Criteria and Post-Award Accountability",
    badge: 'Specialized'
  },
  {
    code: 'UNODC',
    name: 'United Nations Office on Drugs and Crime',
    isJunior: false,
    agenda: 'Strengthening International Cooperation to Counter Synthetic Drug Trafficking through Darknet Markets and Cryptocurrency-Facilitated Financial Networks',
    badge: 'Specialized'
  },
  {
    code: 'UNHRC',
    name: 'United Nations Human Rights Council',
    isJunior: true,
    juniorText: 'Junior Committee: For Grades 6, 7, 8',
    agenda: 'Preventing Political Exclusion, Discrimination and Identity-Based Violence against Minorities: Strengthening Representation, Accountability and Human Rights Protection Mechanisms',
    badge: 'Junior (Grades 6-8)'
  },
  {
    code: 'ICJ',
    name: 'International Court of Justice',
    isJunior: false,
    agenda: 'Application of the Convention on the Prevention and Punishment of the Crime of Genocide (The Gambia v. Myanmar)',
    badge: 'Legal'
  },
  {
    code: 'ECOSOC',
    name: 'Economic and Social Council',
    isJunior: false,
    agenda: 'Addressing the Global Debt Crisis: Reforming Sovereign Debt Restructuring and Development Financing',
    badge: 'Economic'
  },
  {
    code: 'BRICS',
    name: 'BRICS Forum',
    isJunior: true,
    juniorText: 'Junior Committee: For Grades 6, 7, 8',
    agenda: 'Addressing Food Price Volatility and Supply Disruptions: Strengthening BRICS Cooperation on Food Security and Agricultural Trade',
    badge: 'Junior (Grades 6-8)'
  }
];

const GRADES = [
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12'
];

export default function MRVMUNRegistration() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    mobile: '',
    institution: '',
    grade: '',
    committeeChoice1: '',
    committeeChoice2: '',
    committeeChoice3: '',
    countryPreferences: '',
    previousExperience: ''
  });

  const [errors, setErrors] = useState({});

  const currentFee = event?.fee !== undefined && event?.fee !== null ? Number(event.fee) : 2500;
  const isFree = currentFee === 0;
  const formattedFee = isFree ? 'Free' : `₹${currentFee.toLocaleString('en-IN')}`;

  useEffect(() => {
    // Fetch event details by slug
    fetch(`${API_BASE}/events/slug/mrv-mun`)
      .then(async (res) => {
        if (!res.ok) {
          const allRes = await fetch(`${API_BASE}/events`);
          const all = await allRes.json();
          const found = all.find((e) => e.slug === 'mrv-mun');
          if (found) return found;
          throw new Error('Event not found');
        }
        return res.json();
      })
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching event:', err);
        setLoading(false);
      });
  }, []);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    
    if (!formData.mobile.trim()) {
      errs.mobile = 'Phone number is required';
    } else if (formData.mobile.replace(/\D/g, '').length < 10) {
      errs.mobile = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.institution.trim()) errs.institution = 'School / Institution / College Name is required';
    if (!formData.grade) errs.grade = 'Please select your Grade';

    if (!formData.committeeChoice1) errs.committeeChoice1 = 'Please select Choice 1';
    if (!formData.committeeChoice2) errs.committeeChoice2 = 'Please select Choice 2';
    if (!formData.committeeChoice3) errs.committeeChoice3 = 'Please select Choice 3';

    // Ensure distinct committee choices
    if (formData.committeeChoice1 && formData.committeeChoice2 && formData.committeeChoice1 === formData.committeeChoice2) {
      errs.committeeChoice2 = 'Choice 2 must be different from Choice 1';
    }
    if (formData.committeeChoice3 && (formData.committeeChoice3 === formData.committeeChoice1 || formData.committeeChoice3 === formData.committeeChoice2)) {
      errs.committeeChoice3 = 'Choice 3 must be different from Choice 1 & 2';
    }

    if (!formData.countryPreferences.trim()) {
      errs.countryPreferences = 'Please specify 3 country preferences (max 1 P5 country)';
    }

    if (!formData.previousExperience.trim()) {
      errs.previousExperience = 'Please specify previous MUN experience, or write "none"';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill in all mandatory fields marked with * before proceeding.',
        confirmButtonColor: '#C8282B'
      });
      return;
    }

    setSubmitting(true);

    const payload = {
      eventId: event?.id || 10,
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      mobile: formData.mobile.trim(),
      formData: {
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        mobile: formData.mobile.trim(),
        institution: formData.institution.trim(),
        grade: formData.grade,
        committeeChoice1: formData.committeeChoice1,
        committeeChoice2: formData.committeeChoice2,
        committeeChoice3: formData.committeeChoice3,
        countryPreferences: formData.countryPreferences.trim(),
        previousExperience: formData.previousExperience.trim(),

        // Labels for human-readable admin/excel display
        'Email': formData.email.trim(),
        'Full name (This will reflect on your Certificate)': formData.fullName.trim(),
        'Phone Number': formData.mobile.trim(),
        'School/Institution/College Name': formData.institution.trim(),
        'Grade': formData.grade,
        'Committee Preference - Choice 1': formData.committeeChoice1,
        'Committee Preference - Choice 2': formData.committeeChoice2,
        'Committee Preference - Choice 3': formData.committeeChoice3,
        'Country Preferences (Total 3, max one P5)': formData.countryPreferences.trim(),
        'Previous MUN Experience': formData.previousExperience.trim(),
      }
    };

    try {
      const res = await fetch(`${API_BASE}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.text();

      if (res.ok && result.includes('<form')) {
        const win = window.open('', '_self');
        win.document.open();
        win.document.write(result);
        win.document.close();
      } else {
        window.location.href = `/thank-you?slug=mrv-mun`;
      }
    } catch (err) {
      console.error('Submission error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: 'Something went wrong while submitting your registration. Please try again.',
        confirmButtonColor: '#C8282B'
      });
      setSubmitting(false);
    }
  };

  if (!loading && event && event.isActive === false) {
    return <EventClosed event={event} />;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="max-w-4xl mx-auto">
        
        {/* Brand Header Banner Card */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6"
        >
          {/* Top Decorative Stripe */}
          <div className="h-3.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />
          
          <div className="p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
              <img 
                src={mrvMunLogo} 
                alt="MRV MUN Logo" 
                className="h-28 sm:h-32 w-auto object-contain drop-shadow-sm"
              />
              <div className="space-y-1.5 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700">
                    MRV MUN 2026 • 4th Edition
                  </span>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                    Grades 6 to 12
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  MRV MUN 2026 Delegate Registration
                </h1>
                <p className="text-sm font-medium text-slate-600">
                  Inter-School Model United Nations Conference at MET Rishikul Vidyalaya
                </p>
              </div>
            </div>

            {/* Event Key Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-6 text-sm">
              <div className="flex items-center gap-2.5 text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <Calendar className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <span className="text-[11px] block uppercase text-slate-400 font-bold">Dates</span>
                  <span className="font-semibold text-slate-900">12th & 13th Dec 2026</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <MapPin className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <span className="text-[11px] block uppercase text-slate-400 font-bold">Venue</span>
                  <span className="font-semibold text-slate-900">MET Rishikul Vidyalaya, Bandra (W)</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[11px] block uppercase text-emerald-600 font-bold">Delegate Fee</span>
                  <span className="font-extrabold text-slate-900 text-base">{formattedFee}</span>
                </div>
              </div>
            </div>

            {/* Announcement Message */}
            <div className="mt-6 rounded-2xl bg-amber-50/50 p-5 border border-amber-200/70 text-xs sm:text-sm text-slate-700 space-y-3 leading-relaxed">
              <p className="text-slate-800 font-medium">
                We are thrilled to announce <strong>MRV MUN's 4th edition</strong>, an inter-school Model United Nations conference at <strong>MET Rishikul Vidyalaya</strong>. Calling all bright minds from <strong>Grades 6 to 12</strong>, mark your calendars for the <strong>12th and 13th of December</strong>, as we gear up for an event that promises to be unforgettable! Earn yourself a certificate of participation and more!
              </p>

              {/* Disclaimer */}
              <div className="flex items-start gap-2.5 p-3.5 bg-amber-100/70 border border-amber-300/80 rounded-xl text-amber-950 font-medium">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-900 uppercase tracking-wide text-xs">DISCLAIMER:</strong>
                    The fees will be <strong>non-refundable</strong>. MRV students must register through MCB.
                </div>
              </div>

              {/* Support Inquiries & Contacts */}
              <div className="pt-3 border-t border-amber-200/60 text-xs text-slate-600 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>Email inquiries: <a href="mailto:mrvmun@met.edu" className="font-bold text-red-700 hover:underline">mrvmun@met.edu</a></span>
                  </div>
                  <span className="font-semibold text-slate-700 italic">See you there!! — The MRV MUN Team</span>
                </div>

                <div className="bg-amber-100/70 rounded-xl p-3 border border-amber-300/80">
                  <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-red-600" />
                    <span>Feel free to reach out to our team:</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <a 
                      href="tel:+919987474732" 
                      className="flex items-center justify-between sm:justify-start gap-1.5 bg-white/95 hover:bg-white text-slate-800 hover:text-red-700 px-3 py-2 rounded-lg border border-amber-200/90 transition shadow-2xs font-medium text-xs"
                    >
                      <span className="text-slate-600 font-semibold">Jash Nagrecha:</span>
                      <span className="font-bold text-red-700 sm:text-slate-900">9987474732</span>
                    </a>
                    <a 
                      href="tel:+917710036873" 
                      className="flex items-center justify-between sm:justify-start gap-1.5 bg-white/95 hover:bg-white text-slate-800 hover:text-red-700 px-3 py-2 rounded-lg border border-amber-200/90 transition shadow-2xs font-medium text-xs"
                    >
                      <span className="text-slate-600 font-semibold">Janmesh Sheth:</span>
                      <span className="font-bold text-red-700 sm:text-slate-900">7710036873</span>
                    </a>
                    <a 
                      href="tel:+919892086601" 
                      className="flex items-center justify-between sm:justify-start gap-1.5 bg-white/95 hover:bg-white text-slate-800 hover:text-red-700 px-3 py-2 rounded-lg border border-amber-200/90 transition shadow-2xs font-medium text-xs"
                    >
                      <span className="text-slate-600 font-semibold">Snehal Metkar:</span>
                      <span className="font-bold text-red-700 sm:text-slate-900">9892086601</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* The Clean Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Delegate Information */}
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-5">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Delegate Details</h2>
                  <p className="text-xs text-slate-400">Please provide your official contact and school information</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Email Address */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                    }`}
                  />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Full name <span className="text-xs font-normal text-slate-500">(This will reflect on your Certificate)</span> <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter delegate full name"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.fullName ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                    }`}
                  />
                  {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Phone Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.mobile ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                    }`}
                  />
                  {errors.mobile && <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>}
                </div>

                {/* School / Institution / College Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    School/Institution/College Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your school or institution name"
                    value={formData.institution}
                    onChange={(e) => handleChange('institution', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.institution ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                    }`}
                  />
                  {errors.institution && <p className="text-xs text-red-600 mt-1">{errors.institution}</p>}
                </div>

                {/* Grade Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Grade <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {GRADES.map((g) => (
                      <label 
                        key={g} 
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer text-center transition ${
                          formData.grade === g 
                            ? 'border-red-600 bg-red-50/80 text-red-700 font-bold ring-2 ring-red-100 shadow-sm' 
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="grade"
                          value={g}
                          checked={formData.grade === g}
                          onChange={() => handleChange('grade', g)}
                          className="sr-only"
                        />
                        <span className="text-xs font-semibold">{g}</span>
                      </label>
                    ))}
                  </div>
                  {errors.grade && <p className="text-xs text-red-600 mt-1.5">{errors.grade}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Committees and Agendas Reference Cards */}
            <div className="border-t border-slate-100 pt-8">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Event Preferences: Committees and Agendas</h2>
                  <p className="text-xs text-slate-400">Please review the official committee agendas before selecting your preferences</p>
                </div>
              </div>

              {/* Committee Agendas Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
                {AGENDAS.map((comm) => (
                  <div 
                    key={comm.code} 
                    className={`rounded-2xl p-4 border transition ${
                      comm.isJunior 
                        ? 'bg-amber-50/40 border-amber-200' 
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-extrabold text-sm text-slate-900 tracking-wide">
                        {comm.code}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        comm.isJunior 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {comm.badge}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-600 mb-1.5">
                      {comm.name}
                    </h4>

                    {comm.juniorText && (
                      <p className="text-[11px] font-bold text-amber-700 mb-1.5 flex items-center gap-1">
                        <Info className="w-3 h-3 shrink-0" />
                        {comm.juniorText}
                      </p>
                    )}

                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      <strong>Agenda:</strong> {comm.agenda}
                    </p>
                  </div>
                ))}
              </div>

              {/* Section 3: Committee Preferences Dropdowns / Choice Grid */}
              <div className="bg-slate-50/70 p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    What are your committee preferences? <span className="text-red-600">*</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    <strong>BRICS and UNHRC</strong> is exclusive for <strong>Grade 6, 7 and 8</strong>, although they can also apply for other committees that they would like.
                    Please refer to the agendas mentioned above before making a decision.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {/* Choice 1 */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Choice 1 <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.committeeChoice1}
                      onChange={(e) => handleChange('committeeChoice1', e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 bg-white ${
                        errors.committeeChoice1 ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                      }`}
                    >
                      <option value="">Select Choice 1</option>
                      {COMMITTEES.map((c) => (
                        <option key={c} value={c}>
                          {c} {['BRICS', 'UNHRC'].includes(c) ? '(Grades 6-8)' : ''}
                        </option>
                      ))}
                    </select>
                    {errors.committeeChoice1 && <p className="text-xs text-red-600 mt-1">{errors.committeeChoice1}</p>}
                  </div>

                  {/* Choice 2 */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Choice 2 <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.committeeChoice2}
                      onChange={(e) => handleChange('committeeChoice2', e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 bg-white ${
                        errors.committeeChoice2 ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                      }`}
                    >
                      <option value="">Select Choice 2</option>
                      {COMMITTEES.map((c) => (
                        <option key={c} value={c}>
                          {c} {['BRICS', 'UNHRC'].includes(c) ? '(Grades 6-8)' : ''}
                        </option>
                      ))}
                    </select>
                    {errors.committeeChoice2 && <p className="text-xs text-red-600 mt-1">{errors.committeeChoice2}</p>}
                  </div>

                  {/* Choice 3 */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Choice 3 <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.committeeChoice3}
                      onChange={(e) => handleChange('committeeChoice3', e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 bg-white ${
                        errors.committeeChoice3 ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                      }`}
                    >
                      <option value="">Select Choice 3</option>
                      {COMMITTEES.map((c) => (
                        <option key={c} value={c}>
                          {c} {['BRICS', 'UNHRC'].includes(c) ? '(Grades 6-8)' : ''}
                        </option>
                      ))}
                    </select>
                    {errors.committeeChoice3 && <p className="text-xs text-red-600 mt-1">{errors.committeeChoice3}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Country Preferences & Experience */}
            <div className="border-t border-slate-100 pt-8 space-y-6">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Portfolio & Experience</h2>
                  <p className="text-xs text-slate-400">Country allocation preferences and previous participation details</p>
                </div>
              </div>

              {/* Country Preferences */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Country Preferences <span className="text-red-600">*</span>
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Total 3 preferences. <strong>Note: No more than one P5 country can be mentioned</strong> (P5: USA, UK, France, Russia, China).
                </p>
                <input
                  type="text"
                  placeholder="e.g. 1. India, 2. Germany, 3. United Kingdom (P5)"
                  value={formData.countryPreferences}
                  onChange={(e) => handleChange('countryPreferences', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                    errors.countryPreferences ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                  }`}
                />
                {errors.countryPreferences && <p className="text-xs text-red-600 mt-1">{errors.countryPreferences}</p>}
              </div>

              {/* Previous MUN Experience */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Please list any previous MUN experience <span className="text-red-600">*</span>
                </label>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 mb-2 space-y-1">
                  <p className="font-semibold text-slate-700">Recommended format:</p>
                  <p className="font-mono text-slate-500">1. Event Name - Year - Award (if any)</p>
                  <p className="font-mono text-slate-500">2. Event Name - Year - Award (if any)</p>
                  <p className="text-slate-500 italic">If this is your first MUN, kindly write <strong>"none"</strong>.</p>
                </div>
                <textarea
                  rows={4}
                  placeholder="1. HMUN 2025 - Best Delegate&#10;2. DSMUN 2024 - High Commendation&#10;(or write 'none')"
                  value={formData.previousExperience}
                  onChange={(e) => handleChange('previousExperience', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                    errors.previousExperience ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                  }`}
                />
                {errors.previousExperience && <p className="text-xs text-red-600 mt-1">{errors.previousExperience}</p>}
              </div>
            </div>

            {/* Section 5: Summary & Payment */}
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border border-red-200 rounded-2xl p-5 gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider font-bold text-red-700">Delegate Registration Fee</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-0.5">{formattedFee}</p>
                  <p className="text-xs text-slate-500 mt-1">Includes conference access, committee materials, and participation certificate</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-800 bg-white/90 px-3.5 py-2 rounded-xl border border-emerald-200 font-semibold shadow-sm self-start sm:self-auto">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{isFree ? '100% Free Entry' : 'Secure PayU Payment'}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || loading}
                className="w-full bg-[#C8282B] hover:bg-red-700 text-white font-extrabold py-4 px-6 rounded-2xl shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center gap-2.5 text-base disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isFree ? 'Completing Registration...' : 'Proceeding to Payment Gateway...'}</span>
                  </>
                ) : (
                  <span>{isFree ? 'Complete Registration (Free)' : `Proceed to Payment • ${formattedFee}`}</span>
                )}
              </button>

              <div className="text-center space-y-2 text-xs text-slate-500 pt-1">
                <p className="text-slate-400">
                  By clicking proceed, you will be directed to the official gateway to complete your transaction safely.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-slate-600 font-medium">
                  <span>Questions? Write to <a href="mailto:mrvmun@met.edu" className="text-red-600 hover:underline font-semibold">mrvmun@met.edu</a></span>
                  <span className="hidden sm:inline text-slate-300">•</span>
                  <span>Call: <a href="tel:+919987474732" className="hover:text-red-600 font-semibold">Jash (9987474732)</a></span>
                  <span className="hidden sm:inline text-slate-300">•</span>
                  <span><a href="tel:+917710036873" className="hover:text-red-600 font-semibold">Janmesh (7710036873)</a></span>
                  <span className="hidden sm:inline text-slate-300">•</span>
                  <span><a href="tel:+919892086601" className="hover:text-red-600 font-semibold">Snehal (9892086601)</a></span>
                </div>
              </div>
            </div>

          </form>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400 pb-8 space-y-1">
          <p className="font-semibold text-slate-500">© {new Date().getFullYear()} MET Rishikul Vidyalaya</p>
          <p>Bhujbal Knowledge City, Bandra Reclamation, Bandra West, Mumbai 400050</p>
        </div>

      </div>
    </div>
  );
}
