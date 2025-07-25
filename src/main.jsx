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



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EventLanding />} />
        <Route path="/register/:eventId" element={<RegisterForm />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/payment-failed" element={<PaymentFailedPage />} />
        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/create-event" element={<AdminCreateEvent />} />

        {/* Important: Catch-all slug route should go LAST */}
        <Route path="/:slug" element={<ConferenceLandingPage />} />
        <Route path="/conference-landing" element={<ConferenceLandingPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
