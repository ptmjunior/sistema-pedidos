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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Confirmar Compra</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Informe a previsão de entrega para cada item do pedido #{request.id.slice(0, 8)}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-500 border-b">
                                    <th className="pb-2 font-medium">Item</th>
                                    <th className="pb-2 font-medium text-center">Qtd</th>
                                    <th className="pb-2 font-medium">Previsão de Entrega</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {request.items.map(item => (
                                    <tr key={item.id}>
                                        <td className="py-3 text-sm text-gray-800">{item.desc}</td>
                                        <td className="py-3 text-sm text-gray-600 text-center">{item.qty}</td>
                                        <td className="py-3">
                                            <input
                                                type="date"
                                                required
                                                className="input w-full text-sm"
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

                    <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
                            disabled={isProcessing}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 font-medium flex items-center gap-2"
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <span>✓</span> Confirmar Compra
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PurchaseConfirmationModal;
