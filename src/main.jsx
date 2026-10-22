import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import AdminDashboard from './pages/AdminDashboard';
import EventLanding from './pages/EventLanding';
import RegisterForm from './pages/RegisterForm';
import NotFoundPage from './pages/NotFoundPage';
import AdminLogin from './pages/AdminLogin';
import AdminCreateEvent from './pages/AdminCreateEvent';
import { ThankYouPage, PaymentFailedPage } from './pages/ThankYouAndFailurePages';

import IMMLandingPage from './pages/landing/IMMLandingPage';
import ConferenceLandingPage from './pages/landing/ConferenceLandingPage';
import SFXLandingPage from './pages/landing/SFXLandingPage';
import FeeReceipt from './pages/FeeReceipt';
import MRVMUNRegistration from './pages/MRVMUNRegistration';
import PGDMHRConclave from './pages/landing/PGDMHRConclave';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EventLanding />} />
        <Route path="/register/:eventId" element={<RegisterForm />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/receipt" element={<FeeReceipt />} />
        <Route path="/payment-failed" element={<PaymentFailedPage />} />
        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/create-event" element={<AdminCreateEvent />} />

        {/* SFX Seminar Explicit Route */}
        <Route path="/imm-sfx-seminar" element={<SFXLandingPage />} />

        {/* MRV MUN Registration Route */}
        <Route path="/mrv-mun" element={<MRVMUNRegistration />} />

        {/* National HR Conclave 2026 Route */}
        <Route path="/pgdm-hr-conclave" element={<PGDMHRConclave />} />

        {/* Important: Catch-all slug route should go LAST */}
        <Route path="/:slug" element={<ConferenceLandingPage />} />
        <Route path="/conference-landing" element={<ConferenceLandingPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
