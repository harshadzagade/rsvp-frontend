import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Calendar, Clock, MapPin, Sparkles, Phone, Mail, ArrowRight, CheckCircle2, ShieldCheck, Paintbrush } from 'lucide-react';
import { API_BASE, handleApiResponse } from '../../config';

import KryolanLogo from '../../assets/Kryolan-Logo.jpg';
import METLogo from '../../assets/MET_College_in_Mumbai_logo.png';
import SFXBanner from '../../assets/IMM-SFX-post-1200x1200.png';

export default function SFXLandingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);

  // Auto dismiss makeup brush stroke intro after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Parallax Scroll Animation Setup
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const yParallaxBg = useTransform(scrollY, [0, 600], [0, 160]);
  const yParallaxText = useTransform(scrollY, [0, 600], [0, 60]);
  const scaleParallax = useTransform(scrollY, [0, 600], [1, 1.05]);
  const opacityHero = useTransform(scrollY, [0, 450], [1, 0.4]);

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    state: '',
    city: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const activeSlug = slug || 'imm-sfx-seminar';
    fetch(`${API_BASE}/events/slug/${activeSlug}`)
      .then(handleApiResponse)
      .then(data => {
        setEvent(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading SFX event:', err);
        setEvent({
          id: 8,
          title: "Special Effects Make-up (SFX) Seminar",
          slug: "imm-sfx-seminar",
          fee: 299
        });
        setLoading(false);
      });
  }, [slug]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Student Full Name is required';
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile Number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile.trim())) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email Id is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.state.trim()) newErrors.state = 'State selection is required';
    if (!formData.city.trim()) newErrors.city = 'City selection is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    const eventId = event?.id || 8;
    const payload = {
      eventId,
      fullName: formData.fullName,
      email: formData.email,
      mobile: formData.mobile,
      formData: {
        ...formData,
        amountBreakdown: {
          total: 299.00
        }
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
        navigate(`/thank-you?slug=imm-sfx-seminar`);
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Something went wrong while proceeding to payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  const scrollToRegister = () => {
    document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#C8282B] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#C8282B] text-base font-semibold tracking-wide">Loading SFX Seminar...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FAF9F5] text-slate-800 font-sans selection:bg-[#C8282B] selection:text-white">
      
      {/* Dynamic Animated Makeup Brush Stroke & Splatter Opening Intro Overlay */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: 1.05,
              transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] }
            }}
            onClick={() => setShowIntro(false)}
            className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center text-white px-4 text-center cursor-pointer select-none overflow-hidden"
          >
            {/* Dynamic Animated SVG Makeup Brush Stroke Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full min-w-[800px] min-h-[600px] opacity-70" viewBox="0 0 1000 600" preserveAspectRatio="none">
                {/* Main Cream Base Brush Stroke */}
                <motion.path
                  d="M -100 300 Q 250 150, 500 320 T 1100 280"
                  fill="none"
                  stroke="#EAE8CC"
                  strokeWidth="140"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0.2 }}
                  animate={{ pathLength: 1, opacity: 0.8 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />
                {/* Accent Red SFX Makeup Brush Stroke */}
                <motion.path
                  d="M -50 250 Q 300 400, 600 200 T 1150 350"
                  fill="none"
                  stroke="#C8282B"
                  strokeWidth="90"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.95 }}
                  transition={{ duration: 1.4, delay: 0.3, ease: "easeInOut" }}
                />
                {/* Secondary Texture Sweep */}
                <motion.path
                  d="M -80 350 Q 400 100, 750 380 T 1200 220"
                  fill="none"
                  stroke="#EAE8CC"
                  strokeWidth="45"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.1, delay: 0.5, ease: "easeInOut" }}
                />
              </svg>

              {/* Floating Pigment Splatter Dots */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.4, 1.8] }}
                transition={{ duration: 1.8, delay: 0.4 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="w-96 h-96 rounded-full bg-gradient-to-r from-[#C8282B]/40 via-[#EAE8CC]/50 to-[#C8282B]/30 blur-3xl"></div>
              </motion.div>
            </div>

            {/* Intro Text & Logos */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative z-10 max-w-2xl space-y-6"
            >
              <div className="flex items-center justify-center gap-6 mb-4">
                <img src={KryolanLogo} alt="Kryolan Logo" className="h-10 sm:h-12 object-contain filter brightness-200" />
                <div className="h-8 w-px bg-white/30"></div>
                <img src={METLogo} alt="MET Logo" className="h-10 sm:h-12 object-contain filter brightness-200" />
              </div>

              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-[#C8282B] text-white px-5 py-2 rounded-full text-xs sm:text-sm font-black uppercase tracking-widest shadow-xl"
              >
                <Paintbrush className="w-4 h-4 text-white" /> Special Effects Makeup Seminar
              </motion.div>

              <motion.h1
                initial={{ y: 25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight"
              >
                Special Effects Make-up <span className="text-[#C8282B] block sm:inline">(SFX)</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="text-lg sm:text-2xl text-[#EAE8CC] font-bold"
              >
                Mastering the Art of Illusion • 21 October 2026
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="pt-4"
              >
                <span className="text-xs text-slate-400 font-semibold tracking-widest uppercase animate-pulse">
                  Click anywhere to skip intro...
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Header with Soft Cream Backdrop Blur */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#EAE8CC] shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <img src={KryolanLogo} alt="Kryolan Logo" className="h-9 sm:h-11 object-contain transition hover:opacity-90" />
            <div className="h-7 w-px bg-[#EAE8CC]"></div>
            <img src={METLogo} alt="MET Logo" className="h-9 sm:h-11 object-contain transition hover:opacity-90" />
          </div>
          <button
            onClick={scrollToRegister}
            className="bg-[#C8282B] hover:bg-[#a61f22] text-white px-5 sm:px-7 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2"
          >
            <span>Reserve Your Seat</span>
          </button>
        </div>
      </header>

      {/* Hero Section with Interactive Parallax Layers */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-16 lg:py-24">
        {/* Parallax Background Layer */}
        <motion.div
          style={{ y: yParallaxBg, scale: scaleParallax }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <img
            src={SFXBanner}
            alt="SFX Workshop Parallax Banner"
            className="w-full h-full object-cover object-center opacity-35 mix-blend-luminosity filter brightness-90 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        </motion.div>

        {/* Hero Content Layer */}
        <motion.div
          style={{ opacity: opacityHero, y: yParallaxText }}
          className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
        >
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-6">

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight"
            >
              Special Effects Make-up <span className="text-[#C8282B] block sm:inline font-extrabold">(SFX) Seminar</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-2xl text-[#EAE8CC] font-medium leading-relaxed"
            >
              Know more on creating special effects make-up!
            </motion.p>

            {/* Event Info Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 pt-2 text-sm sm:text-base font-medium"
            >
              <div className="flex items-center gap-2.5 bg-white/10 text-white px-4 py-2.5 rounded-2xl border border-white/15 backdrop-blur-md hover:bg-white/15 transition">
                <Calendar className="w-4 h-4 text-[#C8282B]" />
                <span>21 October 2026</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 text-white px-4 py-2.5 rounded-2xl border border-white/15 backdrop-blur-md hover:bg-white/15 transition">
                <Clock className="w-4 h-4 text-[#C8282B]" />
                <span>10 am – 1 pm</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 text-white px-4 py-2.5 rounded-2xl border border-white/15 backdrop-blur-md hover:bg-white/15 transition">
                <MapPin className="w-4 h-4 text-[#C8282B]" />
                <span>MET, Mumbai</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-4 flex flex-wrap items-center gap-4"
            >
              <button
                onClick={scrollToRegister}
                className="bg-[#C8282B] hover:bg-[#a61f22] text-white text-base font-semibold px-8 py-3.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2"
              >
                <span>Reserve Your Seat</span> <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>

          {/* Right Column Hero Poster Visual Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative w-full max-w-[460px] aspect-square rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-slate-900 group">
              <img
                src={SFXBanner}
                alt="Special Effects Live Demo Preview"
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Interactive 2nd Frame: Workshop Highlights + Registration Form */}
      <section id="register-section" className="py-14 lg:py-20 px-4 sm:px-8 bg-[#FAF9F5]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column: Workshop Details & Soft Cards */}
            <div className="lg:col-span-6 space-y-8">
              <div>
                <span className="text-[#C8282B] font-semibold text-xs uppercase tracking-widest bg-[#C8282B]/10 px-3.5 py-1 rounded-full">
                  Workshop Overview
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mt-3 leading-snug">
                  What's in the seminar
                </h2>
                <p className="text-base sm:text-lg text-slate-600 mt-2 font-normal leading-relaxed">
                  Three hours of live demonstration, designed for anyone curious about pursuing makeup artistry as a serious, professional career.
                </p>
              </div>

              {/* 3 Steps Cards with Soft Pleasant Styling */}
              <div className="space-y-4">
                {/* 01 Card */}
                <motion.div
                  whileHover={{ y: -3 }}
                  className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAE8CC] shadow-sm flex items-start gap-4 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#C8282B] text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
                    01
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">Technical application techniques</h3>
                    <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                      Watch the trending techniques applied live on a model, step by step.
                    </p>
                  </div>
                </motion.div>

                {/* 02 Card */}
                <motion.div
                  whileHover={{ y: -3 }}
                  className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAE8CC] shadow-sm flex items-start gap-4 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#C8282B] text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
                    02
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">Realistic effects in SFX make-up</h3>
                    <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                      Experience a visual appeal in make-up to create wounds, textures and transformations are created, with a live demo.
                    </p>
                  </div>
                </motion.div>

                {/* 03 Card */}
                <motion.div
                  whileHover={{ y: -3 }}
                  className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAE8CC] shadow-sm flex items-start gap-4 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#C8282B] text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
                    03
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">Career-focused session</h3>
                    <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                      How trending, demanding and rewarding this career is in India.
                    </p>
                  </div>
                </motion.div>
              </div>

              </div>

            {/* Right Column: Registration Form Card */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-[#EAE8CC] shadow-xl overflow-hidden">
              <div className="bg-[#C8282B] text-white px-6 py-6 text-center space-y-1">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Reserve Your Seat</h3>
                <p className="text-xs text-[#EAE8CC] font-normal">Fill in your details to complete your registration</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
                {/* Student Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Enter Student Full Name<span className="text-[#C8282B]">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter Student Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C8282B] text-sm font-normal bg-slate-50 focus:bg-white transition"
                  />
                  {errors.fullName && <p className="text-xs text-[#C8282B] mt-1 font-semibold">{errors.fullName}</p>}
                </div>

                {/* Mobile Number with +91 flag */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Enter Mobile No.<span className="text-[#C8282B]">*</span>
                  </label>
                  <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#C8282B] transition">
                    <div className="flex items-center gap-1.5 px-3.5 py-3 bg-[#EAE8CC]/50 border-r border-slate-200 text-xs font-bold text-slate-700 select-none">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      name="mobile"
                      placeholder="Enter Mobile No."
                      value={formData.mobile}
                      onChange={handleChange}
                      maxLength="10"
                      className="w-full px-4 py-3 text-sm font-normal bg-slate-50 focus:bg-white focus:outline-none"
                    />
                  </div>
                  {errors.mobile && <p className="text-xs text-[#C8282B] mt-1 font-semibold">{errors.mobile}</p>}
                </div>

                {/* Email Id */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Enter Email Id<span className="text-[#C8282B]">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter Email Id"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C8282B] text-sm font-normal bg-slate-50 focus:bg-white transition"
                  />
                  {errors.email && <p className="text-xs text-[#C8282B] mt-1 font-semibold">{errors.email}</p>}
                </div>

                {/* State & City Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Select State<span className="text-[#C8282B]">*</span>
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C8282B] text-sm font-normal bg-slate-50 focus:bg-white transition"
                    >
                      <option value="">Select State</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Goa">Goa</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.state && <p className="text-xs text-[#C8282B] mt-1 font-semibold">{errors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Select City<span className="text-[#C8282B]">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Enter City"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C8282B] text-sm font-normal bg-slate-50 focus:bg-white transition"
                    />
                    {errors.city && <p className="text-xs text-[#C8282B] mt-1 font-semibold">{errors.city}</p>}
                  </div>
                </div>

                {/* Fee Particulars */}
                <div className="bg-[#EAE8CC]/30 rounded-2xl p-4 border border-[#EAE8CC] flex justify-between items-center mt-4">
                  <div>
                    <span className="text-xs text-slate-500 block">Registration Fee</span>
                    <span className="text-xs text-slate-400">Special Effects (SFX) Seminar & Live Demo</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 line-through mr-2">₹999</span>
                    <span className="text-[#C8282B] font-extrabold text-lg">₹299</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#C8282B] hover:bg-[#a61f22] text-white font-semibold text-base py-3.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? 'Processing...' : 'Proceed to Pay ₹299'}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* Standalone Full-Width Upgrade & Career Future Section (Matching media_1791632120642.png) */}
      <section className="py-16 lg:py-20 px-4 sm:px-8 bg-[#F4F3ED] border-b border-[#EAE8CC]">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
            Time to upgrade to SFX Make-up for Films, OTT, TV, Web Series, Cosplay, Theatre & much more.
          </h2>

          <p className="text-base sm:text-xl text-slate-700 font-medium">
            Make-up skills opens the doors across the entertainment industry and beyond.
          </p>

          <div className="pt-4 space-y-3">
            <h3 className="text-lg sm:text-2xl font-bold text-[#C8282B]">
              What is the future and how one can grow in this career.
            </h3>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-3xl mx-auto">
              A career-focused seminar with a live demonstration, so you leave knowing both the craft and the road ahead.
            </p>
          </div>
        </div>
      </section>

      {/* "Visit Our Campus" Section Matching media_1791630912602.png */}
      <section className="py-14 lg:py-20 px-4 sm:px-8 bg-white border-t border-[#EAE8CC]">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#FAF9F5] border border-[#EAE8CC] rounded-3xl p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Campus Contact Details Left Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#C8282B] text-white flex items-center justify-center shadow-sm shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Visit <span className="text-[#C8282B]">Our Campus</span>
                  </h2>
                  <p className="text-sm font-semibold text-slate-600">MET Institute of Mass Media</p>
                </div>
              </div>

              <div className="space-y-4 text-sm font-normal text-slate-700">
                {/* Address */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-[#C8282B] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 font-semibold block">Address:</strong>
                    Bhujbal Knowledge City, Reclamation, Bandra West, Mumbai, Maharashtra 400050
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-[#C8282B] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 font-semibold block">Phone No.:</strong>
                    7208006691, 8655820696
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-[#C8282B] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 font-semibold block">Email:</strong>
                    communications@met.edu
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Google Map Right Column */}
            <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-[380px] sm:h-[420px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.269464908361!2d72.8291753!3d19.0518865!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c9e3eb8288db%3A0x6eaea262c8538dd5!2sMET%20Institute%20of%20Mass%20Media!5e0!3m2!1sen!2sin!4v1736489245325!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="MET Institute of Mass Media Campus Location"
              ></iframe>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 text-center py-6 border-t border-slate-800 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-200">MET Institute of Mass Media (IMM) & Kryolan</p>
          <p>© 2026 Mumbai Educational Trust (MET). All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
