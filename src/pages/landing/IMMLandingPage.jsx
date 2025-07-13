import React, { useEffect, useState } from 'react';
import RegisterForm from '../RegisterForm';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LightbulbIcon, CalendarIcon, MapPinIcon, UserIcon } from 'lucide-react';

export default function IMMLandingPage() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { slug } = useParams();

  useEffect(() => {
    fetch(`/api/events/slug/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setEvent(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(`Failed to load event: ${slug}`, err);
        navigate('/not-found');
      });
  }, [navigate, slug]);

  if (loading) return <div className="p-6 text-center animate-pulse text-brand-700">Loading...</div>;
  if (!event) return <div className="p-6 text-center text-red-600">Event not found.</div>;

  return (
    <>
      {/* Sticky Navbar */}
      <header className="fixed w-full bg-white z-50 shadow">
        <nav className="flex justify-between items-center max-w-6xl mx-auto px-4 py-3">
          <a href="/" className="flex items-center gap-2">
            <img
              src="https://www.met.edu/frontendassets/images/MET_College_in_Mumbai_logo.png"
              alt="MET Logo"
              className="h-10 md:h-14"
            />
          </a>
          <button
            onClick={() => {
              document.getElementById('register-form')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-red-600 text-white px-5 py-2 rounded-md text-sm md:text-base font-medium hover:bg-red-700"
          >
            Register Now
          </button>
        </nav>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white min-h-screen pt-28 pb-10 px-4 md:px-10 text-brand-900"
      >
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-2">Management Development Programme</h1>
            <h2 className="text-xl md:text-2xl font-semibold mb-1">Design Thinking and Creative Problem Solving</h2>
            <p className="text-gray-600">for new-age corporate managers and modern entrepreneurs</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-gray-700 text-sm md:text-base">
            <div className="flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-red-500" /> 19th July 2025</div>
            <div className="flex items-center gap-2"><UserIcon className="w-5 h-5 text-red-500" /> 10:30 AM to 3:00 PM</div>
            <div className="flex items-center gap-2"><MapPinIcon className="w-5 h-5 text-red-500" /> MET Institute of Mass Media</div>
          </div>

          <section className="bg-brand-50 border border-brand-100 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2"><LightbulbIcon className="text-red-500 w-6 h-6" /> About the Programme</h2>
            <p className="leading-relaxed text-gray-700">
              Design Thinking is a human centred innovative approach to address complex problems faced by businesses.
              Being human centred, Design Thinking approach has revolutionized business strategy across sectors from IT to manufacturing,
              from healthcare to urban infrastructure. This MDP includes tools to ideate, design, and test value-adding business solutions.
            </p>
          </section>

          <section className="bg-white border border-brand-100 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Who Should Attend</h2>
            <p className="text-gray-700">New age corporate managers and modern entrepreneurs from all industry domains.</p>
          </section>

          <section className="bg-brand-50 border border-brand-100 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Programme Highlights</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Concepts of Design Thinking vs conventional problem-solving</li>
              <li>Human-centered innovation using real-life case studies</li>
              <li>Analytical and creative ways to solve complex business problems</li>
              <li>Includes Lunch, Study Material, and Certificate</li>
            </ul>
          </section>

          <section className="bg-white border border-brand-100 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Facilitator</h2>
            <p className="text-gray-700">Dr. Suvrashis Sarkar (Dean - MET Institute of Mass Media)</p>
          </section>

          <section className="bg-brand-50 border border-brand-100 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Programme Details</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Fee: ₹999/- (including GST)</li>
              <li>Mode: Offline Classroom Sessions</li>
              <li>Contact: <a href="mailto:mdp_imm@met.edu" className="text-blue-600 hover:underline">mdp_imm@met.edu</a>, Tel: 022-39554275, 9833028797</li>
              <li>Venue: 7th floor, MET Bhujbal Knowledge City, Bandra Reclamation, Bandra (W), Mumbai - 400050</li>
            </ul>
          </section>

          <div id="register-form" className="pt-6">
            <h2 className="text-center text-2xl font-semibold text-red-600 mb-4">Register Now</h2>
            <RegisterForm eventId={event.id.toString()} />
          </div>
        </div>
      </motion.div>
    </>
  );
}