import React, { useState } from 'react';
import Layout from '../components/Layout';
import { usePurchase } from '../context/PurchaseContext';
import { translations as t } from '../utils/translations';
import { generatePOId } from '../utils/formatters';

import PurchaseConfirmationModal from '../components/PurchaseConfirmationModal';
import ViewRequestModal from '../components/ViewRequestModal';

const Requests = ({ onNavigate, initialViewingRequestId }) => {
    const { requests, currentUser, updateStatus } = usePurchase();
    const [filter, setFilter] = useState('all');

    const [purchasingRequest, setPurchasingRequest] = useState(null);
    const [viewingRequest, setViewingRequest] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Effect to handle deep linking from notifications
    React.useEffect(() => {
        if (initialViewingRequestId && requests.length > 0) {
            const req = requests.find(r => r.id === initialViewingRequestId);
            if (req) {
                setViewingRequest(req);
            }
        }
    }, [initialViewingRequestId, requests]);

    // Role-based filtering logic
    let visibleRequests = requests;

    if (currentUser.role === 'requester') {
        // Requester sees ONLY their own requests
        visibleRequests = requests.filter(r => r.userId === currentUser.id);
    } else if (currentUser.role === 'buyer') {
        // Buyer sees approved and purchased requests + their own requests (any status)
        // BUT NOT pending requests from others (pending = awaiting changes from requester)
        visibleRequests = requests.filter(r =>
            r.status === 'approved' ||
            r.status === 'purchased' ||
            r.status === 'open' ||
            r.userId === currentUser.id
        );
    } else if (currentUser.role === 'approver') {
        // Approver sees ALL requests including pending ones
        visibleRequests = requests;
    }
    // If no specific role, show all (fallback)

    // Apply status filter (dropdown)
    const filteredRequests = filter === 'all'
        ? visibleRequests
        : visibleRequests.filter(r => r.status === filter);

    const handlePurchaseConfirm = async (dates, comment) => {
        setIsProcessing(true);
        try {
            await updateStatus(purchasingRequest.id, 'purchased', dates, comment);
            setPurchasingRequest(null);
        } catch (error) {
            console.error('Error marking as purchased:', error);
            alert('Erro ao marcar como comprado. Tente novamente.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Layout onNavigate={onNavigate} currentPath="requests">
            <div className="flex justify-between items-center mb-md">
                <h1 className="text-2xl font-bold">
                    {currentUser.role === 'requester' ? t.requests.myRequests : t.requests.allRequests}
                </h1>
                <div className="flex gap-sm">
                    <select
                        className="input select"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">{t.requests.allStatus}</option>
                        <option value="open">{t.status.open}</option>
                        <option value="pending">{t.status.pending}</option>
                        <option value="approved">{t.status.approved}</option>
                        <option value="purchased">{t.status.purchased || 'Comprado'}</option>
                        <option value="rejected">{t.status.rejected}</option>
                    </select>
                </div>
            </div>

            <div className="card p-0">
                {filteredRequests.length === 0 ? (
                    <div className="p-xl text-center text-muted">
                        {t.requests.noRequests}
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b bg-slate-50">
                                <th className="p-md text-sm text-muted font-medium">ID</th>
                                <th className="p-md text-sm text-muted font-medium">{t.dashboard.description}</th>
                                <th className="p-md text-sm text-muted font-medium">{t.requests.requester}</th>
                                <th className="p-md text-sm text-muted font-medium">{t.dashboard.amount}</th>
                                <th className="p-md text-sm text-muted font-medium">{t.requests.priority}</th>
                                <th className="p-md text-sm text-muted font-medium">{t.dashboard.status}</th>
                                <th className="p-md text-sm text-muted font-medium">{t.requests.delivery}</th>
                                <th className="p-md text-sm text-muted font-medium">{t.requests.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map((req) => (
                                <tr key={req.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                                    <td className="p-md font-medium">{generatePOId(req.createdAt)}</td>
                                    <td className="p-md">
                                        {req.desc}
                                        {req.items && req.items.length > 0 && (
                                            <span className="text-xs text-muted block">{req.items.length} {t.dashboard.items}</span>
                                        )}
                                    </td>
                                    <td className="p-md text-sm">{req.user}</td>
                                    <td className="p-md font-medium">R$ {req.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="p-md">
                                        <span className={`priority-dot priority-${req.priority || 'medium'}`}></span>
                                        <span className="text-sm capitalize">{t.requests[req.priority || 'medium']}</span>
                                    </td>
                                    <td className="p-md">
                                        <span className={`status-badge status-${req.status}`}>
                                            {t.status[req.status] || req.status}
                                        </span>
                                    </td>
                                    <td className="p-md text-muted text-sm">{req.deliveryDate || 'N/A'}</td>
                                    <td className="p-md flex gap-sm">
                                        {/* Buyer can mark approved as purchased */}
                                        {currentUser.role === 'buyer' && req.status === 'approved' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setPurchasingRequest(req); }}
                                                className="btn-text text-success mr-sm"
                                            >
                                                ✓ Marcar como Comprado
                                            </button>
                                        )}

                                        {/* Edit only allowed for requester if status is pending, or for approver */}
                                        {(currentUser.id === req.userId && req.status === 'pending') || currentUser.role === 'approver' ? (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onNavigate('edit-order', { id: req.id }); }}
                                                className="btn-text text-primary"
                                            >
                                                {t.requests.edit}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setViewingRequest(req)}
                                                className="btn-text text-primary"
                                            >
                                                Ver Detalhes
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {purchasingRequest && (
                <PurchaseConfirmationModal
                    request={purchasingRequest}
                    onClose={() => setPurchasingRequest(null)}
                    onConfirm={handlePurchaseConfirm}
                    isProcessing={isProcessing}
                />
            )}

            {viewingRequest && (
                <ViewRequestModal
                    request={viewingRequest}
                    onClose={() => setViewingRequest(null)}
                />
            )}

            <style>{`
                .status-badge {
                  padding: 0.25rem 0.75rem;
                  border-radius: 999px;
                  font-size: 0.75rem;
                  font-weight: 600;
                }
                .status-open { background-color: #dbeafe; color: #1e40af; }
                .status-pending { background-color: #fff7ed; color: #c2410c; }
                .status-approved { background-color: #dcfce7; color: #15803d; }
                .status-purchased { background-color: #e0e7ff; color: #4338ca; }
                .status-rejected { background-color: #fee2e2; color: #b91c1c; }
                .btn-text { background: none; border: none; padding: 0; font-weight: 500; cursor: pointer; }
                .text-primary { color: var(--color-primary); }
                .text-success { color: #15803d; }
                .bg-slate-50 { background-color: #f8fafc; }
                .transition-colors { transition: background-color 0.2s; }
                
                .priority-dot {
                  display: inline-block;
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  margin-right: 6px;
                }
                .priority-low { background-color: #22c55e; }
                .priority-medium { background-color: #eab308; }
                .priority-high { background-color: #ef4444; }
              `}</style>
        </Layout>
    );
};

export default Requests;
