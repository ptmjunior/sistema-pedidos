import React, { useState } from 'react';

const PurchaseConfirmationModal = ({ request, onClose, onConfirm, isProcessing }) => {
    const [dates, setDates] = useState({});

    const handleDateChange = (itemId, date) => {
        setDates(prev => ({
            ...prev,
            [itemId]: date
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate that all items have a date
        const allItemsHaveDate = request.items.every(item => dates[item.id]);
        if (!allItemsHaveDate) {
            alert('Por favor, informe a data de entrega para todos os itens.');
            return;
        }

        onConfirm(dates);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2 className="text-xl font-bold">Confirmar Compra</h2>
                        <p className="text-sm text-muted mt-xs">
                            Informe a previsão de entrega para cada item
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
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b bg-slate-50">
                                    <th className="p-md text-sm text-muted font-medium">Item</th>
                                    <th className="p-md text-sm text-muted font-medium text-center">Qtd</th>
                                    <th className="p-md text-sm text-muted font-medium">Previsão de Entrega</th>
                                </tr>
                            </thead>
                            <tbody>
                                {request.items.map(item => (
                                    <tr key={item.id} className="border-b last:border-0">
                                        <td className="p-md text-sm">{item.desc}</td>
                                        <td className="p-md text-sm text-center text-muted">{item.qty}</td>
                                        <td className="p-md">
                                            <input
                                                type="date"
                                                required
                                                className="input"
                                                value={dates[item.id] || ''}
                                                onChange={(e) => handleDateChange(item.id, e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                            className="btn btn-success"
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <span className="spinner"></span>
                                    Processando...
                                </>
                            ) : (
                                <>✓ Confirmar Compra</>
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
                        max-width: 700px;
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

                    .btn-success:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
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

                    .bg-slate-50 {
                        background-color: #f8fafc;
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

export default PurchaseConfirmationModal;
