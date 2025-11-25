import React, { useState } from 'react';

const ApprovalModal = ({ request, action, onClose, onConfirm, isProcessing }) => {
    const [comments, setComments] = useState('');
    const isApproval = action === 'approved';

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(comments);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2 className="text-xl font-bold">
                            {isApproval ? '✓ Aprovar Pedido' : '✕ Rejeitar Pedido'}
                        </h2>
                        <p className="text-sm text-muted mt-xs">
                            {isApproval
                                ? 'Adicione comentários ou observações sobre a aprovação (opcional)'
                                : 'Informe o motivo da rejeição para o solicitante'
                            }
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="modal-close"
                        disabled={isProcessing}
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="request-summary">
                            <div className="summary-row">
                                <span className="text-muted">Pedido:</span>
                                <span className="font-medium">{request.desc}</span>
                            </div>
                            <div className="summary-row">
                                <span className="text-muted">Solicitante:</span>
                                <span className="font-medium">{request.user}</span>
                            </div>
                            <div className="summary-row">
                                <span className="text-muted">Valor Total:</span>
                                <span className="font-bold text-primary">
                                    R$ {request.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        <div className="form-group mt-md">
                            <label className="label">
                                {isApproval ? 'Comentários' : 'Motivo da Rejeição'}
                                {!isApproval && <span className="text-red-600"> *</span>}
                            </label>
                            <textarea
                                className="input"
                                rows="4"
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder={isApproval
                                    ? 'Ex: Aprovado conforme orçamento disponível...'
                                    : 'Ex: Valor acima do orçamento aprovado para o departamento...'
                                }
                                required={!isApproval}
                            />
                            <p className="text-xs text-muted mt-xs">
                                {isApproval
                                    ? 'Estes comentários serão incluídos no e-mail de notificação'
                                    : 'O solicitante receberá este motivo por e-mail'
                                }
                            </p>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                            disabled={isProcessing}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`btn ${isApproval ? 'btn-success' : 'btn-danger'}`}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <span className="spinner"></span>
                                    Processando...
                                </>
                            ) : (
                                <>
                                    {isApproval ? '✓ Confirmar Aprovação' : '✕ Confirmar Rejeição'}
                                </>
                            )}
                        </button>
                    </div>
                </form>

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
                        max-width: 600px;
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

                    .request-summary {
                        background-color: var(--color-bg);
                        padding: var(--spacing-md);
                        border-radius: var(--radius-md);
                        border: 1px solid var(--color-border);
                    }

                    .summary-row {
                        display: flex;
                        justify-content: space-between;
                        padding: var(--spacing-xs) 0;
                    }

                    .summary-row:not(:last-child) {
                        border-bottom: 1px solid var(--color-border);
                    }

                    .btn-success {
                        background-color: #16a34a;
                        color: white;
                        display: flex;
                        align-items: center;
                        gap: var(--spacing-xs);
                    }

                    .btn-success:hover:not(:disabled) {
                        background-color: #15803d;
                    }

                    .btn-danger {
                        background-color: #dc2626;
                        color: white;
                        display: flex;
                        align-items: center;
                        gap: var(--spacing-xs);
                    }

                    .btn-danger:hover:not(:disabled) {
                        background-color: #b91c1c;
                    }

                    .btn-success:disabled,
                    .btn-danger:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                    }

                    .text-red-600 {
                        color: #dc2626;
                    }

                    .spinner {
                        display: inline-block;
                        width: 16px;
                        height: 16px;
                        border: 2px solid rgba(255, 255, 255, 0.3);
                        border-top-color: white;
                        border-radius: 50%;
                        animation: spin 0.6s linear infinite;
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

                    @keyframes spin {
                        to {
                            transform: rotate(360deg);
                        }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default ApprovalModal;
