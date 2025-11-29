import React from 'react';
import { usePurchase } from '../context/PurchaseContext';
import { translations as t } from '../utils/translations';

// Icons
const Icons = {
    Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
    NewRequest: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>,
    MyRequests: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
    Notifications: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
    Approvals: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 15l2 2 4-4"></path></svg>,
    Users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    Vendors: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><path d="M5 21V7l8-4 8 4v14"></path><path d="M10 9a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0v-6z"></path></svg>,
    Reports: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
    Profile: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    Logout: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
};

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
                        <div className="flex items-center gap-sm">
                            <Icons.Dashboard />
                            <span>{t.nav.dashboard}</span>
                        </div>
                    </button>
                    <button
                        className={`nav-item ${currentPath === 'create-order' ? 'active' : ''}`}
                        onClick={() => onNavigate('create-order')}
                    >
                        <div className="flex items-center gap-sm">
                            <Icons.NewRequest />
                            <span>{t.dashboard.newRequest}</span>
                        </div>
                    </button>
                    <button
                        className={`nav-item ${currentPath === 'requests' ? 'active' : ''}`}
                        onClick={() => onNavigate('requests')}
                    >
                        <div className="flex items-center gap-sm">
                            <Icons.MyRequests />
                            <span>{t.requests.myRequests}</span>
                        </div>
                    </button>
                    <button
                        className={`nav-item ${currentPath === 'notifications' ? 'active' : ''}`}
                        onClick={() => onNavigate('notifications')}
                    >
                        <div className="flex items-center gap-sm">
                            <Icons.Notifications />
                            <span>{t.nav.notifications}</span>
                        </div>
                        {unreadNotifications > 0 && <span className="badge-count">{unreadNotifications}</span>}
                    </button>

                    {/* Role-based Navigation */}
                    {currentUser.role === 'approver' && (
                        <>
                            <button
                                className={`nav-item ${currentPath === 'approvals' ? 'active' : ''}`}
                                onClick={() => onNavigate('approvals')}
                            >
                                <div className="flex items-center gap-sm">
                                    <Icons.Approvals />
                                    <span>{t.nav.approvals}</span>
                                </div>
                                {stats.pending > 0 && <span className="badge-count">{stats.pending}</span>}
                            </button>
                            <button
                                className={`nav-item ${currentPath === 'users' ? 'active' : ''}`}
                                onClick={() => onNavigate('users')}
                            >
                                <div className="flex items-center gap-sm">
                                    <Icons.Users />
                                    <span>{t.nav.users}</span>
                                </div>
                            </button>
                        </>
                    )}

                    {(currentUser.role === 'approver' || currentUser.role === 'buyer') && (
                        <>
                            <button
                                className={`nav-item ${currentPath === 'vendors' ? 'active' : ''}`}
                                onClick={() => onNavigate('vendors')}
                            >
                                <div className="flex items-center gap-sm">
                                    <Icons.Vendors />
                                    <span>{t.nav.vendors}</span>
                                </div>
                            </button>
                            <button
                                className={`nav-item ${currentPath === 'reports' ? 'active' : ''}`}
                                onClick={() => onNavigate('reports')}
                            >
                                <div className="flex items-center gap-sm">
                                    <Icons.Reports />
                                    <span>Relatórios</span>
                                </div>
                            </button>
                        </>
                    )}


                </nav>

                <div className="user-profile mt-auto pt-md border-t">
                    <div
                        className="flex items-center gap-sm mb-sm cursor-pointer hover:bg-slate-50 p-xs rounded transition-colors"
                        onClick={() => onNavigate('profile')}
                        title="Ir para meu perfil"
                    >
                        <div className="avatar">{currentUser.name.charAt(0)}</div>
                        <div className="overflow-hidden">
                            <div className="text-sm font-bold truncate">{currentUser.name}</div>
                            <div className="text-xs text-muted capitalize truncate">{currentUser.role}</div>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="btn btn-secondary w-full text-xs flex items-center justify-center gap-xs"
                        style={{ padding: '0.5rem' }}
                    >
                        <Icons.Logout />
                        {t.nav.logout}
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="top-bar mb-xl flex justify-between items-center">
                    <div className="breadcrumbs text-sm text-muted">
                        App / <span className="text-dark capitalize">{currentPath.replace('-', ' ')}</span>
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
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
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
          min-width: 1.25rem;
          text-align: center;
        }
        
        .mt-auto { margin-top: auto; }
        .mt-md { margin-top: var(--spacing-md); }
        .pt-md { padding-top: var(--spacing-md); }
        .border-t { border-top: 1px solid var(--color-border); }
        .p-xs { padding: 0.25rem; }
        
        .avatar {
          width: 32px;
          height: 32px;
          min-width: 32px;
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
        .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      `}</style>
        </div>
    );
};

export default Layout;
