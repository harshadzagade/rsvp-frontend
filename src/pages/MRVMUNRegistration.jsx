import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Award, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ShieldCheck,
  Loader2,
  Paperclip
} from 'lucide-react';
import Swal from 'sweetalert2';
import mrvMunLogo from '../assets/MRV_MUN_logo.png';
import EventClosed from '../components/EventClosed';
import { API_BASE } from '../config';

const COMMITTEES = [
  'UNSC',
  'UNHRC (Junior)',
  'ICJ',
  'ECOSOC',
  'FIFA',
  'BRICS (Junior)',
  'AIPPM',
  'UNODC'
];

export default function MRVMUNRegistration() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    grade: '',
    institution: '',
    resumeUrl: '',
    resumeName: '',
    rolePreference: '',
    committeeChoice1: '',
    committeeChoice2: '',
    committeeChoice3: '',
    additionalNotes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch event details by slug
    fetch(`${API_BASE}/events/slug/mrv-mun`)
      .then(async (res) => {
        if (!res.ok) {
          // Fallback to fetch all and find
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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File too large',
        text: 'Resume file size should not exceed 50 MB.',
      });
      return;
    }

    setUploadingResume(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload file');
      }

      setResumeFile(file);
      setFormData((prev) => ({
        ...prev,
        resumeUrl: data.fileUrl,
        resumeName: data.fileName || file.name,
      }));
      setErrors((prev) => ({ ...prev, resume: '' }));
      Swal.fire({
        icon: 'success',
        title: 'Resume Uploaded!',
        text: `${file.name} uploaded successfully.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error('File upload error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: err.message || 'Could not upload file. You can also paste a Google Drive link in notes.',
      });
    } finally {
      setUploadingResume(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.mobile.trim()) {
      errs.mobile = 'Phone number is required';
    } else if (formData.mobile.replace(/\D/g, '').length < 10) {
      errs.mobile = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.grade.trim()) errs.grade = 'Grade is required';
    if (!formData.institution.trim()) errs.institution = 'School / Institution / College Name is required';
    if (!formData.resumeUrl && !formData.resumeName) {
      errs.resume = 'Please upload your MUN resume';
    }
    if (!formData.rolePreference) {
      errs.rolePreference = 'Please select a role (Chair / Vice-chair)';
    }
    if (!formData.committeeChoice1) errs.committeeChoice1 = 'Choice 1 is required';
    if (!formData.committeeChoice2) errs.committeeChoice2 = 'Choice 2 is required';
    if (!formData.committeeChoice3) errs.committeeChoice3 = 'Choice 3 is required';

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
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        grade: formData.grade.trim(),
        institution: formData.institution.trim(),
        resume: formData.resumeUrl || formData.resumeName,
        rolePreference: formData.rolePreference,
        committeeChoice1: formData.committeeChoice1,
        committeeChoice2: formData.committeeChoice2,
        committeeChoice3: formData.committeeChoice3,
        additionalNotes: formData.additionalNotes.trim(),
        'Full Name (This will reflect on your certificate)': formData.fullName.trim(),
        'Email': formData.email.trim(),
        'Phone number': formData.mobile.trim(),
        'Grade': formData.grade.trim(),
        'School/Institution/College Name': formData.institution.trim(),
        'Please upload your MUN Resume': formData.resumeUrl || formData.resumeName,
        'What would you like to join us as?': formData.rolePreference,
        'Committee Preference - Choice 1': formData.committeeChoice1,
        'Committee Preference - Choice 2': formData.committeeChoice2,
        'Committee Preference - Choice 3': formData.committeeChoice3,
        'Anything else you want us to know?': formData.additionalNotes.trim()
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
      });
      setSubmitting(false);
    }
  };

  if (!loading && event && event.isActive === false) {
    return <EventClosed event={event} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="max-w-3xl mx-auto">
        {/* Brand Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6"
        >
          {/* Top Decorative Banner */}
          <div className="h-3 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />
          
          <div className="p-6 sm:p-8 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
              <img 
                src={mrvMunLogo} 
                alt="MRV MUN Logo" 
                className="h-24 sm:h-28 w-auto object-contain drop-shadow-sm"
              />
              <div className="space-y-1 text-center sm:text-left">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-red-100 text-red-700">
                  MRV MUN IV • Registrations
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  MRV MUN - External Registrations
                </h1>
                <p className="text-sm font-medium text-slate-500">
                  MET Rishikul Vidyalaya Model United Nations
                </p>
              </div>
            </div>

            {/* Event Quick Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 text-sm">
              <div className="flex items-center gap-2.5 text-slate-700">
                <Calendar className="w-4 h-4 text-red-600 shrink-0" />
                <span><strong>Dates:</strong> 12th & 13th December 2026</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                <span><strong>Venue:</strong> MET Rishikul Vidyalaya, Bandra West</span>
              </div>
            </div>

            {/* Note / Intro Callout */}
            <div className="mt-6 rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs sm:text-sm text-slate-600 space-y-2">
              <p className="font-semibold text-slate-800">
                Greetings, MUN Enthusiasts!
              </p>
              <p>
                As a member of the MRV MUN Executive Board / External Delegate, you will have the unique opportunity to lead, guide, and participate in ensuring the overall success of our conference.
              </p>
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Letter of Recommendation (LOR)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Certificate of Recognition</span>
                </div>
              </div>
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 border-t border-slate-200 mt-2">
                <span>Fee: <strong className="text-slate-900 text-sm">₹2,500</strong></span>
                <span>•</span>
                <a 
                  href="https://mrv.edu.in/mun/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-red-600 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  Visit mrv.edu.in/mun <ExternalLink className="w-3 h-3" />
                </a>
                <span>•</span>
                <span>Instagram: <strong>@mrvmun</strong></span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* The Clean Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Delegate Details */}
            <div className="border-b border-slate-100 pb-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                Candidate Details
              </h2>
              
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-xs font-normal text-slate-500">(This will reflect on your certificate)</span> <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.fullName ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                    }`}
                  />
                  {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                    }`}
                  />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Phone / WhatsApp Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.mobile ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                    }`}
                  />
                  {errors.mobile && <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>}
                </div>

                {/* Grade */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Grade / Year <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Grade 10 / Grade 11 / FYJC / College"
                    value={formData.grade}
                    onChange={(e) => handleChange('grade', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.grade ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                    }`}
                  />
                  {errors.grade && <p className="text-xs text-red-600 mt-1">{errors.grade}</p>}
                </div>

                {/* Institution Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    School / Institution / College Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your school or college name"
                    value={formData.institution}
                    onChange={(e) => handleChange('institution', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.institution ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                    }`}
                  />
                  {errors.institution && <p className="text-xs text-red-600 mt-1">{errors.institution}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Resume & Role */}
            <div className="border-b border-slate-100 pb-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                MUN Resume & Position
              </h2>

              <div className="space-y-5">
                {/* Resume Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Please upload your MUN Resume <span className="text-red-600">*</span>
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Upload your MUN Resume in PDF, Word, or image format (Max 50MB).
                  </p>
                  
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-red-500 transition bg-slate-50/50">
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingResume}
                    />
                    
                    {uploadingResume ? (
                      <div className="py-4 flex flex-col items-center justify-center gap-2 text-slate-600">
                        <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                        <span className="text-xs font-medium">Uploading your resume...</span>
                      </div>
                    ) : formData.resumeName ? (
                      <div className="py-2 flex items-center justify-between px-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold truncate">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate">{formData.resumeName}</span>
                        </div>
                        <label 
                          htmlFor="resume-upload" 
                          className="text-xs text-red-600 hover:underline cursor-pointer font-medium ml-2 shrink-0"
                        >
                          Change File
                        </label>
                      </div>
                    ) : (
                      <label htmlFor="resume-upload" className="cursor-pointer py-4 block">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <span className="text-sm font-semibold text-red-600 hover:text-red-700">
                          Click to upload file
                        </span>
                        <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX up to 50MB</p>
                      </label>
                    )}
                  </div>
                  {errors.resume && <p className="text-xs text-red-600 mt-1">{errors.resume}</p>}
                </div>

                {/* Role Preference */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    What would you like to join us as? <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['Chair', 'Vice-chair'].map((role) => (
                      <label 
                        key={role} 
                        className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                          formData.rolePreference === role 
                            ? 'border-red-600 bg-red-50/60 ring-2 ring-red-100' 
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="rolePreference"
                          value={role}
                          checked={formData.rolePreference === role}
                          onChange={() => handleChange('rolePreference', role)}
                          className="w-4 h-4 text-red-600 focus:ring-red-500 border-slate-300"
                        />
                        <span className="text-sm font-semibold text-slate-800">{role}</span>
                      </label>
                    ))}
                  </div>
                  {errors.rolePreference && <p className="text-xs text-red-600 mt-1">{errors.rolePreference}</p>}
                </div>
              </div>
            </div>

            {/* Section 3: Committee Preferences */}
            <div className="border-b border-slate-100 pb-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  Committee Preferences
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Please refer to the agendas mentioned on our website{' '}
                  <a 
                    href="https://mrv.edu.in/mun/" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-red-600 hover:underline font-medium inline-flex items-center gap-0.5"
                  >
                    mrv.edu.in/mun <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  before making a decision.
                </p>
              </div>

              <div className="space-y-4">
                {/* Choice 1 */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Choice 1 <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.committeeChoice1}
                    onChange={(e) => handleChange('committeeChoice1', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.committeeChoice1 ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                    }`}
                  >
                    <option value="">Select your 1st preference</option>
                    {COMMITTEES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.committeeChoice1 && <p className="text-xs text-red-600 mt-1">{errors.committeeChoice1}</p>}
                </div>

                {/* Choice 2 */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Choice 2 <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.committeeChoice2}
                    onChange={(e) => handleChange('committeeChoice2', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.committeeChoice2 ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                    }`}
                  >
                    <option value="">Select your 2nd preference</option>
                    {COMMITTEES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.committeeChoice2 && <p className="text-xs text-red-600 mt-1">{errors.committeeChoice2}</p>}
                </div>

                {/* Choice 3 */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Choice 3 <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.committeeChoice3}
                    onChange={(e) => handleChange('committeeChoice3', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.committeeChoice3 ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-red-600 focus:ring-red-100'
                    }`}
                  >
                    <option value="">Select your 3rd preference</option>
                    {COMMITTEES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.committeeChoice3 && <p className="text-xs text-red-600 mt-1">{errors.committeeChoice3}</p>}
                </div>
              </div>
            </div>

            {/* Section 4: Additional Notes */}
            <div className="border-b border-slate-100 pb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Anything else you want us to know? <span className="text-xs font-normal text-slate-400">(Optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Share any past awards, experiences, or specific details..."
                value={formData.additionalNotes}
                onChange={(e) => handleChange('additionalNotes', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition"
              />
            </div>

            {/* Summary & Submit */}
            <div className="pt-2 space-y-4">
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Registration Fee</p>
                  <p className="text-2xl font-extrabold text-slate-900">₹2,500</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Secure PayU Checkout</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || uploadingResume}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Initiating Payment...</span>
                  </>
                ) : (
                  <span>Proceed to Payment • ₹2,500</span>
                )}
              </button>

              <p className="text-center text-xs text-slate-400">
                By clicking proceed, you will be redirected to the secure payment gateway to complete your registration.
              </p>
            </div>
          </form>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400 pb-8">
          <p>© {new Date().getFullYear()} MET Rishikul Vidyalaya • Model United Nations</p>
          <p className="mt-1">Bhujbal Knowledge City, Bandra Reclamation, Bandra West, Mumbai 400050</p>
        </div>
      </div>
    </div>
  );
}
