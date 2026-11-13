import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Loader2, 
  Mail, 
  Phone, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  UserPlus, 
  Building2, 
  Award, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Users
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
    name: 'Fédération Internationale de Football Association',
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

const MIN_DELEGATES = 7;

const createEmptyDelegate = (index) => ({
  id: Date.now() + Math.random(),
  fullName: '',
  grade: '',
  email: '',
  committeeChoice1: '',
  committeeChoice2: ''
});

export default function MRVMUNDelegationRegistration() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAgendas, setShowAgendas] = useState(false);

  // School & Contact Info
  const [schoolData, setSchoolData] = useState({
    schoolName: '',
    city: '',
    facultyAdvisorName: '',
    facultyAdvisorEmail: '',
    facultyAdvisorMobile: '',
    headDelegateName: '',
    headDelegateEmail: '',
    headDelegateMobile: ''
  });

  // Participating Committees (Checkboxes)
  const [selectedCommittees, setSelectedCommittees] = useState([]);

  // Delegates List (Dynamic rows - pre-populated with 7 slots for convenience)
  const [delegates, setDelegates] = useState(() => 
    Array.from({ length: MIN_DELEGATES }, (_, i) => createEmptyDelegate(i))
  );

  const [errors, setErrors] = useState({});

  const feePerDelegate = event?.fee !== undefined && event?.fee !== null ? Number(event.fee) : 2500;
  const totalAmount = feePerDelegate * delegates.length;
  const isFree = totalAmount === 0;
  const formattedFeePerDelegate = feePerDelegate === 0 ? 'Free' : `₹${feePerDelegate.toLocaleString('en-IN')}`;
  const formattedTotalFee = isFree ? 'Free' : `₹${totalAmount.toLocaleString('en-IN')}`;

  useEffect(() => {
    // Fetch event details by slug
    fetch(`${API_BASE}/events/slug/mrv-mun-delegation`)
      .then(async (res) => {
        if (!res.ok) {
          const allRes = await fetch(`${API_BASE}/events`);
          const all = await allRes.json();
          const found = all.find((e) => e.slug === 'mrv-mun-delegation');
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

  const handleSchoolChange = (name, value) => {
    setSchoolData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const toggleCommittee = (code) => {
    setSelectedCommittees((prev) => {
      const next = prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code];
      if (errors.selectedCommittees && next.length > 0) {
        setErrors((e) => ({ ...e, selectedCommittees: '' }));
      }
      return next;
    });
  };

  // Delegate Row Handlers
  const handleDelegateChange = (index, field, value) => {
    setDelegates((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    const errKey = `delegate_${index}_${field}`;
    if (errors[errKey]) {
      setErrors((prev) => ({ ...prev, [errKey]: '' }));
    }
  };

  const addDelegate = () => {
    setDelegates((prev) => [...prev, createEmptyDelegate(prev.length)]);
  };

  const removeDelegate = (index) => {
    if (delegates.length <= 1) {
      Swal.fire({
        icon: 'info',
        title: 'Cannot Remove',
        text: 'At least one delegate row must remain.',
        confirmButtonColor: '#C8282B'
      });
      return;
    }
    setDelegates((prev) => prev.filter((_, i) => i !== index));
    // Clear any errors for that index
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (key.startsWith(`delegate_${index}_`)) {
          delete next[key];
        }
      });
      return next;
    });
  };

  const validate = () => {
    const errs = {};

    // 1. School Information
    if (!schoolData.schoolName.trim()) errs.schoolName = 'School Name is required';
    if (!schoolData.city.trim()) errs.city = 'City is required';

    // 2. Faculty Advisor Information
    if (!schoolData.facultyAdvisorName.trim()) errs.facultyAdvisorName = 'Faculty Advisor Name is required';
    if (!schoolData.facultyAdvisorEmail.trim()) {
      errs.facultyAdvisorEmail = 'Faculty Advisor Email is required';
    } else if (!/\S+@\S+\.\S+/.test(schoolData.facultyAdvisorEmail)) {
      errs.facultyAdvisorEmail = 'Please enter a valid email address';
    }
    if (!schoolData.facultyAdvisorMobile.trim()) {
      errs.facultyAdvisorMobile = 'Faculty Advisor Contact Number is required';
    } else if (schoolData.facultyAdvisorMobile.replace(/\D/g, '').length < 10) {
      errs.facultyAdvisorMobile = 'Please enter a valid 10-digit contact number';
    }

    // 3. Head Delegate Information
    if (!schoolData.headDelegateName.trim()) errs.headDelegateName = 'Head Delegate Name is required';
    if (!schoolData.headDelegateEmail.trim()) {
      errs.headDelegateEmail = 'Head Delegate Email is required';
    } else if (!/\S+@\S+\.\S+/.test(schoolData.headDelegateEmail)) {
      errs.headDelegateEmail = 'Please enter a valid email address';
    }
    if (!schoolData.headDelegateMobile.trim()) {
      errs.headDelegateMobile = 'Head Delegate Contact Number is required';
    } else if (schoolData.headDelegateMobile.replace(/\D/g, '').length < 10) {
      errs.headDelegateMobile = 'Please enter a valid 10-digit contact number';
    }

    // 4. Committees Selected
    if (selectedCommittees.length === 0) {
      errs.selectedCommittees = 'Please select at least one committee your delegation wishes to participate in';
    }

    // 5. Minimum 7 Delegates Check
    if (delegates.length < MIN_DELEGATES) {
      errs.delegatesCount = `A minimum of ${MIN_DELEGATES} delegates are required for school delegation. Currently you have ${delegates.length}.`;
    }

    // 6. Each Delegate Validation
    delegates.forEach((del, idx) => {
      if (!del.fullName.trim()) {
        errs[`delegate_${idx}_fullName`] = 'Name required';
      }
      if (!del.grade) {
        errs[`delegate_${idx}_grade`] = 'Select grade';
      }
      if (!del.email.trim()) {
        errs[`delegate_${idx}_email`] = 'Email required';
      } else if (!/\S+@\S+\.\S+/.test(del.email)) {
        errs[`delegate_${idx}_email`] = 'Invalid email';
      }
      if (!del.committeeChoice1) {
        errs[`delegate_${idx}_committeeChoice1`] = 'Select 1st preference';
      }
      if (!del.committeeChoice2) {
        errs[`delegate_${idx}_committeeChoice2`] = 'Select 2nd preference';
      } else if (del.committeeChoice1 && del.committeeChoice1 === del.committeeChoice2) {
        errs[`delegate_${idx}_committeeChoice2`] = 'Must differ from Choice 1';
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      const hasCountError = delegates.length < MIN_DELEGATES;
      Swal.fire({
        icon: 'warning',
        title: hasCountError ? 'Minimum 7 Delegates Required' : 'Incomplete Details',
        text: hasCountError 
          ? `For school delegations, a minimum of 7 delegates are required. Please add at least ${MIN_DELEGATES - delegates.length} more delegate(s).`
          : 'Please fill in all mandatory fields marked with * before proceeding.',
        confirmButtonColor: '#C8282B'
      });
      return;
    }

    setSubmitting(true);

    const formattedDelegateSummary = delegates.map((del, i) => 
      `${i + 1}. ${del.fullName.trim()} | ${del.grade} | ${del.email.trim()} | 1st: ${del.committeeChoice1} | 2nd: ${del.committeeChoice2}`
    ).join('\n');

    const cleanDelegates = delegates.map((del) => ({
      fullName: del.fullName.trim(),
      grade: del.grade,
      email: del.email.trim(),
      committeeChoice1: del.committeeChoice1,
      committeeChoice2: del.committeeChoice2
    }));

    const payload = {
      eventId: event?.id || 13,
      fullName: `${schoolData.headDelegateName.trim()} (${schoolData.schoolName.trim()})`,
      email: schoolData.headDelegateEmail.trim(),
      mobile: schoolData.headDelegateMobile.trim(),
      formData: {
        schoolName: schoolData.schoolName.trim(),
        city: schoolData.city.trim(),
        facultyAdvisorName: schoolData.facultyAdvisorName.trim(),
        facultyAdvisorEmail: schoolData.facultyAdvisorEmail.trim(),
        facultyAdvisorMobile: schoolData.facultyAdvisorMobile.trim(),
        headDelegateName: schoolData.headDelegateName.trim(),
        headDelegateEmail: schoolData.headDelegateEmail.trim(),
        headDelegateMobile: schoolData.headDelegateMobile.trim(),
        totalDelegates: delegates.length,
        participatingCommittees: selectedCommittees.join(', '),
        delegates: cleanDelegates,
        delegatesList: formattedDelegateSummary,
        amount: totalAmount,
        amountBreakdown: {
          total: totalAmount,
          perDelegate: feePerDelegate,
          count: delegates.length
        },

        // Human-readable keys for admin table & excel
        'School Name': schoolData.schoolName.trim(),
        'City': schoolData.city.trim(),
        'Faculty Advisor Name': schoolData.facultyAdvisorName.trim(),
        'Faculty Advisor Email': schoolData.facultyAdvisorEmail.trim(),
        'Faculty Advisor Contact Number': schoolData.facultyAdvisorMobile.trim(),
        'Head Delegate Name': schoolData.headDelegateName.trim(),
        'Head Delegate Email': schoolData.headDelegateEmail.trim(),
        'Head Delegate Contact Number': schoolData.headDelegateMobile.trim(),
        'Total Delegates': delegates.length,
        'Committees Delegation Wishes to Participate In': selectedCommittees.join(', '),
        'Delegates List': formattedDelegateSummary,
        'Amount Paid': `₹${totalAmount.toLocaleString('en-IN')}`
      }
    };

    try {
      const res = await fetch(`${API_BASE}/rsvp`, {
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
        window.location.href = `/thank-you?slug=mrv-mun-delegation`;
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
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    School Delegation
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  MRV MUN - School Delegation Registrations
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
                  <span className="text-[11px] block uppercase text-emerald-600 font-bold">Fee per delegate</span>
                  <span className="font-extrabold text-slate-900 text-base">{formattedFeePerDelegate}</span>
                </div>
              </div>
            </div>

            {/* Delegation Requirements & Announcement Message */}
            <div className="mt-6 rounded-2xl bg-amber-50/50 p-5 border border-amber-200/70 text-xs sm:text-sm text-slate-700 space-y-3 leading-relaxed">
              <p className="text-slate-800 font-medium">
                We are thrilled to announce <strong>MRV MUN's 4th edition</strong>, an inter-school Model United Nations conference at <strong>MET Rishikul Vidyalaya</strong>. Calling all bright minds from <strong>Grades 6 to 12</strong>, mark your calendars for the <strong>12th and 13th of December</strong>, as we gear up for an event that promises to be unforgettable! Earn yourself a certificate of participation and more!
              </p>

              {/* Requirement Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-start gap-2.5 p-3.5 bg-blue-50/90 border border-blue-200 rounded-xl text-blue-950 font-medium text-xs">
                  <Users className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-blue-900 uppercase tracking-wide text-[11px]">Minimum Delegation Size:</strong>
                    A minimum of <strong>7 students</strong> are required to register from a school.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-xl text-emerald-950 font-medium text-xs">
                  <Award className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-emerald-900 uppercase tracking-wide text-[11px]">Best Delegation Award:</strong>
                    There will be an award for <strong>'Best Delegation'</strong>, where every delegate receives a Certificate of Merit.
                  </div>
                </div>
              </div>

              {/* Switch to Individual Delegate Registration */}
              <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3 p-3.5 bg-white border border-amber-200 rounded-xl">
                <div>
                  <span className="block font-bold text-slate-900 text-xs">Looking for Individual Registration?</span>
                  <span className="text-[11px] text-slate-500">If registering fewer than 7 students or as a single participant, please use Individual Delegate Registration.</span>
                </div>
                <a
                  href="/mrv-mun"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition shrink-0"
                >
                  <span>Individual Delegate Form</span>
                  <span>→</span>
                </a>
              </div>

              {/* Notice */}
              <p className="text-xs text-slate-600 italic">
                * Please note that this form needs to be filled <strong>only once</strong> by the <strong>head delegate</strong>.
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

        {/* The Registration Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* SECTION 1: School & Faculty Advisor Information */}
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-5">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">School & Faculty Advisor Details</h2>
                  <p className="text-xs text-slate-400">Please provide your school and faculty advisor's official information</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* School Name */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    School name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name of school"
                    value={schoolData.schoolName}
                    onChange={(e) => handleSchoolChange('schoolName', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.schoolName ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                    }`}
                  />
                  {errors.schoolName && <p className="text-xs text-red-600 mt-1">{errors.schoolName}</p>}
                </div>

                {/* City */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    City <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, Pune, Delhi"
                    value={schoolData.city}
                    onChange={(e) => handleSchoolChange('city', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.city ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                    }`}
                  />
                  {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
                </div>

                {/* Faculty Advisor Name */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Faculty advisor name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter faculty advisor full name"
                    value={schoolData.facultyAdvisorName}
                    onChange={(e) => handleSchoolChange('facultyAdvisorName', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.facultyAdvisorName ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                    }`}
                  />
                  {errors.facultyAdvisorName && <p className="text-xs text-red-600 mt-1">{errors.facultyAdvisorName}</p>}
                </div>

                {/* Faculty Advisor Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Faculty advisor email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="advisor@school.org"
                    value={schoolData.facultyAdvisorEmail}
                    onChange={(e) => handleSchoolChange('facultyAdvisorEmail', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.facultyAdvisorEmail ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                    }`}
                  />
                  {errors.facultyAdvisorEmail && <p className="text-xs text-red-600 mt-1">{errors.facultyAdvisorEmail}</p>}
                </div>

                {/* Faculty Advisor Contact Number */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Faculty advisor contact number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={schoolData.facultyAdvisorMobile}
                    onChange={(e) => handleSchoolChange('facultyAdvisorMobile', e.target.value.replace(/\D/g, ''))}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.facultyAdvisorMobile ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                    }`}
                  />
                  {errors.facultyAdvisorMobile && <p className="text-xs text-red-600 mt-1">{errors.facultyAdvisorMobile}</p>}
                </div>
              </div>
            </div>

            {/* SECTION 2: Head Delegate Details */}
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-5">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Head Delegate Details</h2>
                  <p className="text-xs text-slate-400">Official student representative leading the school delegation</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Head Delegate Name */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Head Delegate name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter head delegate full name"
                    value={schoolData.headDelegateName}
                    onChange={(e) => handleSchoolChange('headDelegateName', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.headDelegateName ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                    }`}
                  />
                  {errors.headDelegateName && <p className="text-xs text-red-600 mt-1">{errors.headDelegateName}</p>}
                </div>

                {/* Head Delegate Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Head Delegate email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="headdelegate@example.com"
                    value={schoolData.headDelegateEmail}
                    onChange={(e) => handleSchoolChange('headDelegateEmail', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.headDelegateEmail ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                    }`}
                  />
                  {errors.headDelegateEmail && <p className="text-xs text-red-600 mt-1">{errors.headDelegateEmail}</p>}
                </div>

                {/* Head Delegate Contact Number */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Head Delegate contact number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={schoolData.headDelegateMobile}
                    onChange={(e) => handleSchoolChange('headDelegateMobile', e.target.value.replace(/\D/g, ''))}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.headDelegateMobile ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                    }`}
                  />
                  {errors.headDelegateMobile && <p className="text-xs text-red-600 mt-1">{errors.headDelegateMobile}</p>}
                </div>
              </div>
            </div>

            {/* SECTION 3: Committee Selection & Agendas */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Committees Your Delegation Wishes to Participate In</h2>
                    <p className="text-xs text-slate-400">Select all committees that apply to your school's delegates</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAgendas(!showAgendas)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                >
                  <span>{showAgendas ? 'Hide Agendas' : 'View Agendas'}</span>
                  {showAgendas ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Committee Agendas Collapsible Box */}
              <AnimatePresence>
                {showAgendas && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-5"
                  >
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Committees and Agendas Overview
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {AGENDAS.map((ag) => (
                          <div key={ag.code} className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-extrabold text-slate-900">{ag.code}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-50 text-red-700">
                                {ag.badge}
                              </span>
                            </div>
                            <p className="font-semibold text-slate-800 text-[11px] mb-1">{ag.name}</p>
                            <p className="text-slate-600 text-[11px] leading-relaxed">{ag.agenda}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Committee Checkboxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {COMMITTEES.map((code) => {
                  const isChecked = selectedCommittees.includes(code);
                  const isJunior = code === 'UNHRC' || code === 'BRICS';
                  return (
                    <label
                      key={code}
                      onClick={() => toggleCommittee(code)}
                      className={`cursor-pointer p-3.5 rounded-xl border flex flex-col justify-between transition select-none ${
                        isChecked 
                          ? 'bg-red-50/90 border-red-500 shadow-xs' 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-sm ${isChecked ? 'text-red-700' : 'text-slate-800'}`}>
                          {code}
                        </span>
                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                          isChecked ? 'bg-red-600 border-red-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      {isJunior && (
                        <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-2 block w-fit">
                          Grades 6-8
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
              {errors.selectedCommittees && (
                <p className="text-xs text-red-600 mt-2">{errors.selectedCommittees}</p>
              )}
            </div>

            {/* SECTION 4: Delegate List (One-by-One Dynamic Add) */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Delegate List</h2>
                    <p className="text-xs text-slate-400">Add each student delegate one by one (Minimum 7 required)</p>
                  </div>
                </div>

                {/* Live Count & Fee Pill */}
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    delegates.length >= MIN_DELEGATES 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {delegates.length} {delegates.length === 1 ? 'Delegate' : 'Delegates'}
                    {delegates.length < MIN_DELEGATES ? ` (Need ${MIN_DELEGATES - delegates.length} more)` : ' ✓ Minimum Met'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-900 text-white">
                    {formattedTotalFee}
                  </span>
                </div>
              </div>

              {errors.delegatesCount && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errors.delegatesCount}</span>
                </div>
              )}

              {/* Delegate Cards Container */}
              <div className="space-y-4">
                {delegates.map((del, index) => {
                  const num = index + 1;
                  return (
                    <motion.div
                      key={del.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 transition"
                    >
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center">
                            {num}
                          </span>
                          <span className="font-bold text-sm text-slate-900">
                            Delegate #{num} {del.fullName ? `— ${del.fullName}` : ''}
                          </span>
                        </div>

                        {delegates.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDelegate(index)}
                            className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1 rounded-lg transition font-medium"
                            title="Remove delegate"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* Delegate Full Name */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Full name (for Certificate) <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Delegate full name"
                            value={del.fullName}
                            onChange={(e) => handleDelegateChange(index, 'fullName', e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border text-xs bg-white transition focus:outline-none focus:ring-2 ${
                              errors[`delegate_${index}_fullName`] ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                            }`}
                          />
                          {errors[`delegate_${index}_fullName`] && (
                            <p className="text-[11px] text-red-600 mt-0.5">{errors[`delegate_${index}_fullName`]}</p>
                          )}
                        </div>

                        {/* Grade */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Grade <span className="text-red-600">*</span>
                          </label>
                          <select
                            value={del.grade}
                            onChange={(e) => handleDelegateChange(index, 'grade', e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border text-xs bg-white transition focus:outline-none focus:ring-2 ${
                              errors[`delegate_${index}_grade`] ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                            }`}
                          >
                            <option value="">Select Grade</option>
                            {GRADES.map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                          {errors[`delegate_${index}_grade`] && (
                            <p className="text-[11px] text-red-600 mt-0.5">{errors[`delegate_${index}_grade`]}</p>
                          )}
                        </div>

                        {/* Delegate Email */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Email <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="email"
                            placeholder="delegate@example.com"
                            value={del.email}
                            onChange={(e) => handleDelegateChange(index, 'email', e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border text-xs bg-white transition focus:outline-none focus:ring-2 ${
                              errors[`delegate_${index}_email`] ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                            }`}
                          />
                          {errors[`delegate_${index}_email`] && (
                            <p className="text-[11px] text-red-600 mt-0.5">{errors[`delegate_${index}_email`]}</p>
                          )}
                        </div>

                        {/* Committee Choice 1 */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            1st Committee Preference <span className="text-red-600">*</span>
                          </label>
                          <select
                            value={del.committeeChoice1}
                            onChange={(e) => handleDelegateChange(index, 'committeeChoice1', e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border text-xs bg-white transition focus:outline-none focus:ring-2 ${
                              errors[`delegate_${index}_committeeChoice1`] ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                            }`}
                          >
                            <option value="">Select 1st Preference</option>
                            {COMMITTEES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          {errors[`delegate_${index}_committeeChoice1`] && (
                            <p className="text-[11px] text-red-600 mt-0.5">{errors[`delegate_${index}_committeeChoice1`]}</p>
                          )}
                        </div>

                        {/* Committee Choice 2 */}
                        <div className="sm:col-span-2 lg:col-span-2">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            2nd Committee Preference <span className="text-red-600">*</span>
                          </label>
                          <select
                            value={del.committeeChoice2}
                            onChange={(e) => handleDelegateChange(index, 'committeeChoice2', e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border text-xs bg-white transition focus:outline-none focus:ring-2 ${
                              errors[`delegate_${index}_committeeChoice2`] ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                            }`}
                          >
                            <option value="">Select 2nd Preference</option>
                            {COMMITTEES.map((c) => (
                              <option 
                                key={c} 
                                value={c}
                                disabled={c === del.committeeChoice1}
                              >
                                {c} {c === del.committeeChoice1 ? '(Selected in Choice 1)' : ''}
                              </option>
                            ))}
                          </select>
                          {errors[`delegate_${index}_committeeChoice2`] && (
                            <p className="text-[11px] text-red-600 mt-0.5">{errors[`delegate_${index}_committeeChoice2`]}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Add Delegate Action Button */}
              <div className="mt-4 pt-2">
                <button
                  type="button"
                  onClick={addDelegate}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Delegate</span>
                </button>
              </div>
            </div>

            {/* Total Fee & Submission Section */}
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase text-slate-400 font-bold block">Delegation Summary</span>
                  <div className="text-sm font-semibold text-slate-800">
                    {delegates.length} Delegates × {formattedFeePerDelegate} per delegate
                  </div>
                  {delegates.length < MIN_DELEGATES && (
                    <span className="text-xs text-amber-700 font-medium mt-0.5 block">
                      ⚠️ Note: Minimum 7 delegates required to submit registration
                    </span>
                  )}
                </div>

                <div className="text-center sm:text-right">
                  <span className="text-xs uppercase text-slate-400 font-bold block">Total Amount to Pay</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-red-600 block">
                    {formattedTotalFee}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold text-base shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Delegation Registration...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Register Delegation & Pay {formattedTotalFee}</span>
                    <span>→</span>
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-400">
                🔒 Secure payment powered by PayU. By proceeding, you agree that registration fees are non-refundable.
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
