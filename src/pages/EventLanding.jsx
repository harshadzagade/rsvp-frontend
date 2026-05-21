import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EventLanding = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/ics-conference-2026');
  }, [navigate]);

  return null;
};

export default EventLanding;
