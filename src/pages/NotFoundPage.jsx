import React from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <Motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-800 px-4 text-center"
    >
      <div className="max-w-lg">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="mb-6 text-gray-700">
          The page you're looking for doesn't exist or the event link has expired.
        </p>
        <Link
          to="/"
          className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded transition"
        >
          Go Home
        </Link>
      </div>
    </Motion.div>
  );
}
