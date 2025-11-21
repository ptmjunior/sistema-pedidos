import React from 'react';
import { usePurchase } from '../context/PurchaseContext';
import { translations as t } from '../utils/translations';

const Layout = ({ children, onNavigate, currentPath }) => {
    const { currentUser, logout, stats, getUnreadCount } = usePurchase();

    const unreadNotifications = getUnreadCount(currentUser.id);

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div className="logo mb-xl flex flex-col items-center">
                    {/* Logo placeholder - user will provide the file */}
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="h-16 mb-sm object-contain"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                    <span className="text-xl font-bold text-primary text-center leading-tight">
                        {t.nav.appName}
                    </span>
                </div>

                <nav className="nav-menu">
                    <button
                        className={`nav-item ${currentPath === 'dashboard' ? 'active' : ''}`}
                        onClick={() => onNavigate('dashboard')}
                    >
                        {t.nav.dashboard}
                    </button>
                    <button
                        className={`nav-item ${currentPath === 'create-order' ? 'active' : ''}`}
                        onClick={() => onNavigate('create-order')}
                    >
                        {t.dashboard.newRequest}
                    </button>
                    <button
                        className={`nav-item ${currentPath === 'requests' ? 'active' : ''}`}
                        onClick={() => onNavigate('requests')}
                    >
                        {t.requests.myRequests}
                    </button>
                    <button
                        className={`nav-item ${currentPath === 'notifications' ? 'active' : ''}`}
                        onClick={() => onNavigate('notifications')}
                    >
                        {t.nav.notifications}
                        {unreadNotifications > 0 && <span className="badge-count">{unreadNotifications}</span>}
                    </button>

                    {/* Role-based Navigation */}
                    {currentUser.role === 'approver' && (
                        <>
                            <button
                                className={`nav-item ${currentPath === 'approvals' ? 'active' : ''}`}
                                onClick={() => onNavigate('approvals')}
                            >
                                {t.nav.approvals}
                                {stats.pending > 0 && <span className="badge-count">{stats.pending}</span>}
                            </button>
                            <button
                                className={`nav-item ${currentPath === 'users' ? 'active' : ''}`}
                                onClick={() => onNavigate('users')}
                            >
                                {t.nav.users}
                            </button>
                        </>
                    )}

                    {(currentUser.role === 'approver' || currentUser.role === 'buyer') && (
                        <button
                            className={`nav-item ${currentPath === 'vendors' ? 'active' : ''}`}
                            onClick={() => onNavigate('vendors')}
                        >
                            {t.nav.vendors}
                        </button>
                    )}
                </nav>

                <div className="user-profile mt-auto pt-md border-t">
                    <div className="text-sm font-bold">{currentUser.name}</div>
                    <div className="text-xs text-muted capitalize mb-sm">{currentUser.role}</div>
                    <button
                        onClick={logout}
                        className="btn btn-secondary w-full text-xs"
                        style={{ padding: '0.375rem 0.5rem' }}
                    >
                        {t.nav.logout}
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="top-bar mb-xl flex justify-between items-center">
                    <div className="breadcrumbs text-sm text-muted">
                        App / <span className="text-dark capitalize">{currentPath.replace('-', ' ')}</span>
                    </div>
                    <div className="user-menu flex items-center gap-md">
                        <span className="text-sm font-medium">{currentUser.department} Dept</span>
                        <div className="avatar">{currentUser.name.charAt(0)}</div>
                    </div>
                </header>

                {children}
            </main>

            <style>{`
        .app-container {
          display: flex;
          min-height: 100vh;
          background-color: var(--color-bg);
        }
        
        .sidebar {
          width: 260px;
          background-color: white;
          border-right: 1px solid var(--color-border);
          padding: var(--spacing-xl);
          display: flex;
          flex-direction: column;
        }
        
        .main-content {
          flex: 1;
          padding: var(--spacing-xl);
          overflow-y: auto;
        }
        
        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        
        .nav-item {
          text-align: left;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          color: var(--color-text-muted);
          font-weight: 500;
          transition: all var(--transition-fast);
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .nav-item:hover {
          background-color: var(--color-bg);
          color: var(--color-text-main);
        }
        
        .nav-item.active {
          background-color: #eff6ff;
          color: var(--color-primary);
        }
        
        .badge-count {
          background-color: var(--color-primary);
          color: white;
          font-size: 0.75rem;
          padding: 0.125rem 0.375rem;
          border-radius: 999px;
        }
        
        .mt-auto { margin-top: auto; }
        .pt-md { padding-top: var(--spacing-md); }
        .border-t { border-top: 1px solid var(--color-border); }
        .p-xs { padding: 0.25rem; }
        
        .avatar {
          width: 32px;
          height: 32px;
          background-color: var(--color-primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .h-16 { height: 4rem; }
        .object-contain { object-fit: contain; }
        .leading-tight { line-height: 1.25; }
        .flex-col { flex-direction: column; }
      `}</style>
        </div>
    );
};

export default Layout;
