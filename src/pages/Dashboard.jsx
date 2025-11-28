import React from 'react';
import Layout from '../components/Layout';
import { usePurchase } from '../context/PurchaseContext';
import { generatePOId } from '../utils/formatters';
import { translations as t } from '../utils/translations';

const Dashboard = ({ onNewRequest, onNavigate, currentPath }) => {
    const { stats, requests, currentUser } = usePurchase();

    // Calculate personalized stats for the current user view
    let visibleRequests = requests;
    if (currentUser.role === 'requester') {
        visibleRequests = requests.filter(r => r.userId === currentUser.id);
    } else if (currentUser.role === 'buyer') {
        visibleRequests = requests.filter(r => r.status === 'approved' || r.status === 'purchased');
    }

    // Recalculate stats based on visibility
    const dashboardStats = {
        pending: visibleRequests.filter(r => r.status === 'open').length,
        approved: visibleRequests.filter(r => r.status === 'approved').length,
        totalSpend: visibleRequests
            .filter(r => r.status === 'approved')
            .reduce((sum, r) => sum + r.amount, 0)
    };

    const recentRequests = visibleRequests.slice(0, 5);

    return (
        <Layout onNavigate={onNavigate} currentPath={currentPath}>
            <div className="dashboard-header flex justify-between items-center mb-md">
                <div>
                    <h1 className="text-2xl font-bold">{t.dashboard.title}</h1>
                    <p className="text-muted">{t.dashboard.welcomeBack}, {currentUser.name}.</p>
                </div>
                {currentUser.role !== 'buyer' && (
                    <button onClick={onNewRequest} className="btn btn-primary">
                        {t.dashboard.newRequest}
                    </button>
                )}
            </div>

            <div className="stats-grid">
                <div className="card stat-card">
                    <div className="stat-label text-muted text-sm">{t.dashboard.pendingApproval}</div>
                    <div className="stat-value text-3xl font-bold mt-sm">{dashboardStats.pending}</div>
                    <div className="stat-trend text-sm text-success mt-xs">{t.dashboard.activeRequests}</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-label text-muted text-sm">{t.dashboard.approved}</div>
                    <div className="stat-value text-3xl font-bold mt-sm">{dashboardStats.approved}</div>
                    <div className="stat-trend text-sm text-success mt-xs">{t.dashboard.allTime}</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-label text-muted text-sm">{t.dashboard.totalSpend}</div>
                    <div className="stat-value text-3xl font-bold mt-sm">
                        R$ {dashboardStats.totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="stat-trend text-sm text-muted mt-xs">{t.dashboard.approvedAmount}</div>
                </div>
            </div>

            <div className="recent-activity mt-xl">
                <h2 className="text-xl font-bold mb-md">{t.dashboard.recentRequests}</h2>
                <div className="card p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b">
                                <th className="p-md text-sm text-muted font-medium">ID</th>
                                <th className="p-md text-sm text-muted font-medium">{t.dashboard.description}</th>
                                <th className="p-md text-sm text-muted font-medium">{t.dashboard.amount}</th>
                                <th className="p-md text-sm text-muted font-medium">{t.dashboard.status}</th>
                                <th className="p-md text-sm text-muted font-medium">{t.dashboard.date}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentRequests.map((item) => (
                                <tr key={item.id} className="border-b last:border-0 hover:bg-slate-50">
                                    <td className="p-md font-medium">{generatePOId(item.createdAt)}</td>
                                    <td className="p-md">
                                        {item.desc}
                                        {item.items && item.items.length > 0 && (
                                            <span className="text-xs text-muted block">{item.items.length} {t.dashboard.items}</span>
                                        )}
                                    </td>
                                    <td className="p-md">
                                        R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="p-md">
                                        <span className={`status-badge status-${item.status}`}>
                                            {t.status[item.status] || item.status}
                                        </span>
                                    </td>
                                    <td className="p-md text-muted">{item.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .stats-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                  gap: var(--spacing-md);
                }
                
                .w-full { width: 100%; }
                .p-0 { padding: 0; }
                .p-md { padding: var(--spacing-md); }
                .border-b { border-bottom: 1px solid var(--color-border); }
                .text-left { text-align: left; }
                
                .status-badge {
                  padding: 0.25rem 0.75rem;
                  border-radius: 999px;
                  font-size: 0.75rem;
                  font-weight: 600;
                  text-transform: capitalize;
                }
                
                .status-open { background-color: #dbeafe; color: #1e40af; }
                .status-pending { background-color: #fff7ed; color: #c2410c; }
                .status-approved { background-color: #dcfce7; color: #15803d; }
                .status-purchased { background-color: #e0e7ff; color: #4338ca; }
                .status-rejected { background-color: #fee2e2; color: #b91c1c; }
              `}</style>
        </Layout>
    );
};

export default Dashboard;
