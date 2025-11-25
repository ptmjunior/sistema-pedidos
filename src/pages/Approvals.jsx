import React, { useState } from 'react';
import Layout from '../components/Layout';
import { usePurchase } from '../context/PurchaseContext';
import { generatePOId } from '../utils/formatters';
import { translations as t } from '../utils/translations';

const Approvals = ({ onNavigate }) => {
    const { requests, updateStatus } = usePurchase();
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const pendingRequests = requests.filter(req => req.status === 'pending');

    const handleAction = async (id, action) => {
        setIsProcessing(true);
        try {
            await updateStatus(id, action);
            setSelectedRequest(null);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Erro ao atualizar pedido. Tente novamente.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Layout onNavigate={onNavigate} currentPath="approvals">
            <div className="max-w-7xl mx-auto">
                {selectedRequest ? (
                    // Analysis Overlay Screen
                    <div className="analysis-overlay animate-fade-in max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-lg">
                            <div>
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="text-muted hover:text-primary mb-sm flex items-center gap-xs text-sm"
                                >
                                    {t.approvals.backToList}
                                </button>
                                <h1 className="text-2xl font-bold">{t.approvals.analyzeRequest}</h1>
                            </div>
                            <div className="flex gap-md">
                                {isProcessing ? (
                                    <div className="processing-message">
                                        <div className="spinner"></div>
                                        <span>Processando...</span>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleAction(selectedRequest.id, 'rejected')}
                                            className="btn btn-secondary text-red-600 border-red-200 hover:bg-red-50"
                                            disabled={isProcessing}
                                        >
                                            {t.approvals.rejectRequest}
                                        </button>
                                        <button
                                            onClick={() => handleAction(selectedRequest.id, 'approved')}
                                            className="btn btn-primary"
                                            disabled={isProcessing}
                                        >
                                            {t.approvals.approveRequest}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid-2 gap-lg mb-lg">
                            <div className="card">
                                <h2 className="text-lg font-bold mb-md border-b pb-sm">{t.approvals.requestDetails}</h2>
                                <div className="grid-2 gap-md">
                                    <div>
                                        <label className="label text-muted">{t.approvals.requestId}</label>
                                        <div className="font-medium">{generatePOId(selectedRequest.createdAt)}</div>
                                    </div>
                                    <div>
                                        <label className="label text-muted">{t.dashboard.date}</label>
                                        <div className="font-medium">{selectedRequest.date}</div>
                                    </div>
                                    <div>
                                        <label className="label text-muted">{t.approvals.requester}</label>
                                        <div className="font-medium">{selectedRequest.requester || selectedRequest.user}</div>
                                    </div>
                                    <div>
                                        <label className="label text-muted">{t.approvals.department}</label>
                                        <div className="font-medium">{selectedRequest.department}</div>
                                    </div>
                                    <div>
                                        <label className="label text-muted">{t.approvals.priority}</label>
                                        <div className="capitalize">
                                            <span className={`priority-dot priority-${selectedRequest.priority || 'medium'}`}></span>
                                            {t.requests[selectedRequest.priority || 'medium']}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label text-muted">{t.approvals.deliveryDate}</label>
                                        <div className="font-medium">{selectedRequest.deliveryDate || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="mt-md">
                                    <label className="label text-muted">{t.dashboard.description}</label>
                                    <p>{selectedRequest.desc}</p>
                                </div>
                                {selectedRequest.notes && (
                                    <div className="mt-md">
                                        <label className="label text-muted">{t.approvals.notes}</label>
                                        <p className="text-sm italic">{selectedRequest.notes}</p>
                                    </div>
                                )}
                            </div>

                            <div className="card bg-slate-50">
                                <h2 className="text-lg font-bold mb-md border-b pb-sm">{t.approvals.financialSummary}</h2>
                                <div className="flex justify-between items-center mb-sm">
                                    <span className="text-muted">{t.approvals.totalItems}</span>
                                    <span className="font-medium">{selectedRequest.items ? selectedRequest.items.length : 0}</span>
                                </div>
                                <div className="flex justify-between items-center mb-lg">
                                    <span className="text-muted">{t.approvals.totalAmount}</span>
                                    <span className="text-2xl font-bold text-primary">R$ {selectedRequest.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        <div className="card p-0">
                            <h2 className="text-lg font-bold p-md border-b m-0">{t.approvals.items}</h2>
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b bg-slate-50">
                                        <th className="p-md text-sm text-muted font-medium">{t.dashboard.description}</th>
                                        <th className="p-md text-sm text-muted font-medium">{t.approvals.category}</th>
                                        <th className="p-md text-sm text-muted font-medium">{t.approvals.vendor}</th>
                                        <th className="p-md text-sm text-muted font-medium">{t.approvals.link}</th>
                                        <th className="p-md text-sm text-muted font-medium text-right">{t.approvals.qty}</th>
                                        <th className="p-md text-sm text-muted font-medium text-right">{t.approvals.price}</th>
                                        <th className="p-md text-sm text-muted font-medium text-right">{t.approvals.total}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedRequest.items && selectedRequest.items.map((item) => (
                                        <tr key={item.id} className="border-b last:border-0">
                                            <td className="p-md font-medium">{item.desc}</td>
                                            <td className="p-md text-sm capitalize">{item.category}</td>
                                            <td className="p-md text-sm">{item.vendor || '-'}</td>
                                            <td className="p-md text-sm">
                                                {item.link ? (
                                                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                        {t.approvals.view}
                                                    </a>
                                                ) : '-'}
                                            </td>
                                            <td className="p-md text-right">{item.qty}</td>
                                            <td className="p-md text-right">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className="p-md text-right font-bold">R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    // Grid View
                    <>
                        <div className="mb-lg text-center">
                            <h1 className="text-2xl font-bold">{t.approvals.title}</h1>
                            <p className="text-muted">{t.approvals.subtitle}</p>
                        </div>

                        {pendingRequests.length === 0 ? (
                            <div className="card text-center p-xl max-w-2xl mx-auto">
                                <p className="text-muted">{t.approvals.noPending}</p>
                            </div>
                        ) : (
                            <div className="approvals-grid">
                                {pendingRequests.map((req) => (
                                    <div key={req.id} className="card approval-card flex flex-col h-full">
                                        <div className="mb-md">
                                            <div className="flex justify-between items-start mb-xs">
                                                <span className="font-bold text-lg">{generatePOId(req.createdAt)}</span>
                                                <span className="badge badge-dept">{req.department}</span>
                                            </div>
                                            <span className="text-xs text-muted">{req.date}</span>
                                        </div>

                                        <div className="flex-1 mb-md">
                                            <h3 className="font-medium mb-xs line-clamp-2" title={req.desc}>{req.desc}</h3>
                                            <div className="text-sm text-muted flex items-center gap-xs mb-xs">
                                                <span>👤</span> {req.requester || req.user}
                                            </div>
                                            {req.items && req.items.length > 0 && (
                                                <div className="text-sm text-muted flex items-center gap-xs">
                                                    <span>📦</span> {req.items.length} {t.dashboard.items}
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t pt-md mt-auto">
                                            <div className="flex justify-between items-end mb-md">
                                                <span className="text-sm text-muted">{t.approvals.totalAmount}</span>
                                                <span className="text-xl font-bold text-primary">R$ {req.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <button
                                                onClick={() => setSelectedRequest(req)}
                                                className="btn btn-primary w-full"
                                            >
                                                {t.approvals.analyze}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`
                .max-w-7xl { max-width: 80rem; }
                .max-w-4xl { max-width: 56rem; }
                .max-w-2xl { max-width: 42rem; }
                .mx-auto { margin-left: auto; margin-right: auto; }
                .flex-col { flex-direction: column; }
                .text-center { text-align: center; }
                .p-xl { padding: var(--spacing-xl); }
                .mb-xs { margin-bottom: var(--spacing-xs); }
                .pt-md { padding-top: var(--spacing-md); }
                .pb-sm { padding-bottom: var(--spacing-sm); }
                .gap-xs { gap: var(--spacing-xs); }
                .gap-md { gap: var(--spacing-md); }
                .gap-lg { gap: var(--spacing-lg); }
                .mb-sm { margin-bottom: var(--spacing-sm); }
                .mb-md { margin-bottom: var(--spacing-md); }
                .mb-lg { margin-bottom: var(--spacing-lg); }
                .mt-md { margin-top: var(--spacing-md); }
                .mt-auto { margin-top: auto; }
                .h-full { height: 100%; }
                .w-full { width: 100%; }
                .p-0 { padding: 0; }
                .p-md { padding: var(--spacing-md); }
                .m-0 { margin: 0; }
                .border-b { border-bottom: 1px solid var(--color-border); }
                .border-t { border-top: 1px solid var(--color-border); }
                .text-left { text-align: center; }
                .text-right { text-align: right; }
                .text-red-600 { color: #dc2626; }
                .border-red-200 { border-color: #fecaca; }
                .hover\\:bg-red-50:hover { background-color: #fef2f2; }
                .hover\\:text-primary:hover { color: var(--color-primary); }
                .hover\\:underline:hover { text-decoration: underline; }
                .bg-slate-50 { background-color: #f8fafc; }
                .last\\:border-0:last-child { border: none; }
                
                .grid-2 {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                }
                
                .approvals-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                  gap: var(--spacing-lg);
                }
                
                .approval-card {
                  transition: transform 0.2s, box-shadow 0.2s;
                }
                
                .approval-card:hover {
                  transform: translateY(-2px);
                  box-shadow: var(--shadow-md);
                }
                
                .badge-dept {
                  background-color: var(--color-primary);
                  color: white;
                  padding: 0.25rem 0.75rem;
                  border-radius: 999px;
                  font-size: 0.75rem;
                  font-weight: 600;
                }
                
                .line-clamp-2 {
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
                }
                
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
                
                .animate-fade-in {
                  animation: fadeIn 0.3s ease-out;
                }
                
                @keyframes fadeIn {
                  from {
                    opacity: 0;
                    transform: translateY(-10px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                
                .processing-message {
                  display: flex;
                  align-items: center;
                  gap: var(--spacing-sm);
                  padding: 0.75rem 1.5rem;
                  background-color: #eff6ff;
                  color: #1e40af;
                  border-radius: var(--radius-md);
                  font-weight: 500;
                }
                
                .spinner {
                  width: 20px;
                  height: 20px;
                  border: 3px solid #dbeafe;
                  border-top-color: #1e40af;
                  border-radius: 50%;
                  animation: spin 0.8s linear infinite;
                }
                
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
        </Layout>
    );
};

export default Approvals;
