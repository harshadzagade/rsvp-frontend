import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EventLanding = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/imm_mdp');
  }, [navigate]);

  return null;
};

export default EventLanding;
