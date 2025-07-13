import React from 'react';
import {  motion as Motion  } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

export function ThankYouPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-green-50 text-green-900 px-4"
    >
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4">🎉 Thank You for Registering!</h1>
        <p className="mb-4">Your payment was successful. We've sent a confirmation email with all the details.</p>
        <Link to="/" className="inline-block mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
          Go to Home
        </Link>
      </div>
    </motion.div>
  );
}

export function PaymentFailedPage() {
  const location = useLocation();
  const error = new URLSearchParams(location.search).get('error') || '';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-red-50 text-red-900 px-4"
    >
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4">❌ Payment Failed</h1>
        <p className="mb-4">We couldn't process your payment. {error && <span>Error: {error}</span>}</p>
        <Link to="/" className="inline-block mt-4 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">
          Try Again
        </Link>
      </div>
    </motion.div>
  );
}
