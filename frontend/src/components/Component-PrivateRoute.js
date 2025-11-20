import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/Context-Auth';

const PrivateRoute = ({ children }) => {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Carregando...
      </div>
    );
  }

  return signed ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
