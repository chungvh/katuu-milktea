import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/controllers/AuthContext';
import { AuditProvider } from '@/controllers/AuditContext';
import { OrderSessionProvider } from '@/controllers/OrderSessionContext';
import { router } from '@/routes';

/**
 * Main App component
 * Wraps the application with providers and router
 */
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuditProvider>
        <OrderSessionProvider>
          <RouterProvider router={router} />
        </OrderSessionProvider>
      </AuditProvider>
    </AuthProvider>
  );
};

export default App;
