import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import CreateOrder from './pages/CreateOrder';
import Requests from './pages/Requests';
import Vendors from './pages/Vendors';
import Users from './pages/Users';
import Approvals from './pages/Approvals';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { PurchaseProvider, usePurchase } from './context/PurchaseContext';

function AppWrapper() {
  return (
    <PurchaseProvider>
      <App />
    </PurchaseProvider>
  );
}

function App() {
  const [view, setView] = useState('dashboard');
  const [editingRequestId, setEditingRequestId] = useState(null);
  const { requests, isAuthenticated } = usePurchase();

  const navigateTo = (page, params = {}) => {
    if (page === 'edit-order' && params.id) {
      setEditingRequestId(params.id);
    } else {
      setEditingRequestId(null);
    }
    setView(page);
  };

  const getEditingRequest = () => {
    return requests.find(r => r.id === editingRequestId);
  };

  // Show login, forgot password, or reset password pages if not authenticated
  if (!isAuthenticated) {
    // Check if this is a password recovery flow
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const isRecoveryMode = localStorage.getItem('password_recovery_active') === 'true';

    if (type === 'recovery' || isRecoveryMode) {
      return <ResetPassword onNavigate={navigateTo} />;
    }
    if (view === 'forgot-password') {
      return <ForgotPassword onNavigate={navigateTo} />;
    }
    if (view === 'reset-password') {
      return <ResetPassword onNavigate={navigateTo} />;
    }
    return <Login onNavigate={navigateTo} />;
  }

  return (
    <>
      {view === 'dashboard' && (
        <Dashboard
          onNewRequest={() => navigateTo('create-order')}
          onNavigate={navigateTo}
          currentPath="dashboard"
        />
      )}
      {view === 'requests' && (
        <Requests
          onNavigate={navigateTo}
        />
      )}
      {view === 'vendors' && (
        <Vendors
          onNavigate={navigateTo}
        />
      )}
      {view === 'users' && (
        <Users
          onNavigate={navigateTo}
        />
      )}
      {view === 'approvals' && (
        <Approvals
          onNavigate={navigateTo}
        />
      )}
      {view === 'profile' && (
        <Profile
          onNavigate={navigateTo}
        />
      )}
      {view === 'notifications' && (
        <Notifications
          onNavigate={navigateTo}
        />
      )}
      {view === 'create-order' && (
        <CreateOrder
          onCancel={() => navigateTo('dashboard')}
          onSubmit={(data) => {
            console.log('New Order:', data);
            navigateTo('dashboard');
          }}
          onNavigate={navigateTo}
        />
      )}
      {view === 'edit-order' && (
        <CreateOrder
          initialData={getEditingRequest()}
          onCancel={() => navigateTo('requests')}
          onSubmit={() => navigateTo('requests')}
          onNavigate={navigateTo}
        />
      )}
    </>
  );
}

export default AppWrapper;
