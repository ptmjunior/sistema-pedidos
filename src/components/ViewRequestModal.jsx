import React from 'react';
import { translations as t } from '../utils/translations';
import { generatePOId } from '../utils/formatters';
import RequestHistory from './RequestHistory';

const ViewRequestModal = ({ request, onClose }) => {
    if (!request) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2 className="text-xl font-bold">{t.requests.requestDetails}</h2>
                        <p className="text-sm text-muted mt-xs">
                            {generatePOId(request.createdAt)} - {request.status}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="modal-close"
                    >
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    <div className="grid-2 gap-lg mb-lg">
                        <div className="card bg-slate-50">
                            <h3 className="section-title">{t.approvals.requestDetails}</h3>
                            <div className="grid-2 gap-md">
                                <div className="detail-item">
                                    <span className="detail-label">{t.approvals.requester}:</span>
                                    <span className="detail-value">{request.user}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">{t.approvals.department}:</span>
                                    <span className="detail-value">{request.department}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">{t.dashboard.date}:</span>
                                    <span className="detail-value">{request.date}</span>
                                </div>

                            </div>
                            <div className="mt-md">
                                <span className="detail-label block mb-xs">{t.dashboard.description}:</span>
                                <p className="text-sm">{request.desc}</p>
                            </div>
                            {request.notes && (
                                <div className="mt-md">
                                    <span className="detail-label block mb-xs">{t.approvals.notes}:</span>
                                    <p className="text-sm italic">{request.notes}</p>
                                </div>
                            )}
                        </div>

                        <div className="card bg-slate-50">
                            <h3 className="section-title">{t.approvals.financialSummary}</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">{t.approvals.totalItems}:</span>
                                    <span className="detail-value">{request.items?.length || 0}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">{t.approvals.totalAmount}:</span>
                                    <span className="detail-value text-primary font-bold">
                                        R$ {request.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card p-0 mb-lg">
                        <h3 className="text-lg font-bold p-md border-b m-0">{t.approvals.items}</h3>
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b bg-slate-50">
                                    <th className="p-md text-sm text-muted font-medium">{t.dashboard.description}</th>
                                    <th className="p-md text-sm text-muted font-medium">{t.approvals.category}</th>
                                    <th className="p-md text-sm text-muted font-medium">{t.approvals.vendor}</th>
                                    {request.status === 'purchased' && (
                                        <th className="p-md text-sm text-muted font-medium">Previsão de Entrega</th>
                                    )}
                                    <th className="p-md text-sm text-muted font-medium text-right">{t.approvals.qty}</th>
                                    <th className="p-md text-sm text-muted font-medium text-right">{t.approvals.price}</th>
                                    <th className="p-md text-sm text-muted font-medium text-right">{t.approvals.total}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {request.items && request.items.map((item) => (
                                    <tr key={item.id} className="border-b last:border-0">
                                        <td className="p-md font-medium">{item.desc}</td>
                                        <td className="p-md text-sm capitalize">{item.category}</td>
                                        <td className="p-md text-sm">{item.vendor || '-'}</td>
                                        {request.status === 'purchased' && (
                                            <td className="p-md text-sm">
                                                {item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString('pt-BR') : '-'}
                                            </td>
                                        )}
                                        <td className="p-md text-right">{item.qty}</td>
                                        <td className="p-md text-right">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className="p-md text-right font-bold">R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Request History */}
                    {request.comments && request.comments.length > 0 && (
                        <RequestHistory comments={request.comments} />
                    )}
                </div>

                <div className="modal-footer">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-secondary"
                    >
                        {t.approvals.close}
                    </button>
                </div>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: var(--spacing-md);
                }

                .modal-content {
                    width: 100%;
                    max-width: 900px;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    animation: modalFadeIn 0.2s ease-out;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: var(--spacing-lg);
                    border-bottom: 1px solid var(--color-border);
                }

                .modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: var(--color-text-muted);
                    cursor: pointer;
                    padding: 0;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: var(--radius-md);
                    transition: all var(--transition-fast);
                }

                .modal-close:hover {
                    background-color: var(--color-bg);
                    color: var(--color-text-main);
                }

                .modal-body {
                    padding: var(--spacing-lg);
                    overflow-y: auto;
                    flex: 1;
                }

                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: var(--spacing-sm);
                    padding: var(--spacing-lg);
                    border-top: 1px solid var(--color-border);
                    background-color: var(--color-bg);
                }

                .section-title {
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: var(--spacing-md);
                    padding-bottom: var(--spacing-sm);
                    border-bottom: 1px solid var(--color-border);
                }

                .detail-label {
                    font-size: 0.75rem;
                    color: var(--color-text-muted);
                    font-weight: 500;
                    margin-right: var(--spacing-xs);
                }

                .detail-value {
                    font-weight: 500;
                }

                .bg-slate-50 {
                    background-color: #f8fafc;
                }

                .grid-2 {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                }

                @keyframes modalFadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </div >
    );
};

export default ViewRequestModal;
