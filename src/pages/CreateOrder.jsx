import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { usePurchase } from '../context/PurchaseContext';
import RequestHistory from '../components/RequestHistory';
import { translations as t } from '../utils/translations';

const CreateOrder = ({ onCancel, onSubmit, onNavigate, initialData }) => {
    const { addRequest, updateRequest, vendors } = usePurchase();

    // Main form state
    const [formData, setFormData] = useState({
        desc: '',
        priority: 'medium',
        notes: '',
        editComment: ''
    });

    // Items state
    const [items, setItems] = useState([]);

    // New item input state
    const [newItem, setNewItem] = useState({
        desc: '',
        category: 'office',
        qty: 1,
        price: '',
        vendor: '',
        link: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                desc: initialData.desc || '',
                priority: initialData.priority || 'medium',
                notes: initialData.notes || ''
            });

            if (initialData.items && initialData.items.length > 0) {
                setItems(initialData.items);
            } else if (initialData.amount) {
                // Legacy support
                setItems([{
                    id: Date.now(),
                    desc: initialData.desc,
                    category: initialData.category || 'office',
                    qty: 1,
                    price: initialData.amount,
                    total: initialData.amount,
                    vendor: initialData.vendor || '',
                    link: ''
                }]);
            }
        }
    }, [initialData]);

    const handleAddItem = () => {
        if (!newItem.desc || !newItem.price) return;

        const itemTotal = parseFloat(newItem.price) * parseInt(newItem.qty);
        const item = {
            id: Date.now(),
            desc: newItem.desc,
            category: newItem.category,
            qty: parseInt(newItem.qty),
            price: parseFloat(newItem.price),
            total: itemTotal,
            vendor: newItem.vendor,
            link: newItem.link
        };

        setItems([...items, item]);
        setNewItem({
            desc: '',
            category: 'office',
            qty: 1,
            price: '',
            vendor: '',
            link: ''
        });
    };

    const handleRemoveItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.total, 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (items.length === 0) {
            alert('Por favor, adicione pelo menos um item ao pedido.');
            return;
        }

        // Validate edit comment if editing
        if (initialData && !formData.editComment.trim()) {
            alert('Por favor, informe um comentário explicando a alteração.');
            return;
        }

        const requestData = {
            desc: formData.desc,
            priority: formData.priority,
            notes: formData.notes,
            items: items,
            amount: calculateTotal(),
            editComment: formData.editComment
        };

        if (initialData) {
            updateRequest(initialData.id, requestData);
        } else {
            addRequest(requestData);
        }

        if (onSubmit) onSubmit(requestData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNewItemChange = (e) => {
        const { name, value } = e.target;
        setNewItem(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Layout onNavigate={onNavigate} currentPath={initialData ? "edit-order" : "create-order"}>
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-lg">
                    <h1 className="text-2xl font-bold">{initialData ? t.createOrder.editTitle : t.createOrder.title}</h1>
                    <button onClick={onCancel} className="btn btn-secondary">
                        {t.createOrder.cancel}
                    </button>
                </div>

                {/* Request History - Only show in edit mode */}
                {initialData && initialData.comments && initialData.comments.length > 0 && (
                    <div className="mb-lg">
                        <RequestHistory comments={initialData.comments} />
                    </div>
                )}

                <div className="card mb-lg">
                    <h2 className="text-lg font-bold mb-md">{t.createOrder.basicInfo}</h2>
                    <div className="grid-2 gap-md mb-md">
                        <div className="form-group">
                            <label className="label">{t.createOrder.description}</label>
                            <input
                                type="text"
                                name="desc"
                                className="input"
                                placeholder={t.createOrder.descriptionPlaceholder}
                                value={formData.desc}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">{t.createOrder.priority}</label>
                            <select
                                name="priority"
                                className="input select"
                                value={formData.priority}
                                onChange={handleChange}
                            >
                                <option value="low">{t.createOrder.low}</option>
                                <option value="medium">{t.createOrder.medium}</option>
                                <option value="high">{t.createOrder.high}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="card mb-lg">
                    <div className="flex justify-between items-center mb-md">
                        <h2 className="text-lg font-bold">{t.createOrder.items}</h2>
                        <span className="text-lg font-bold text-primary">{t.createOrder.totalAmount}: R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    {/* Add Item Form */}
                    <div className="bg-slate-50 p-md rounded mb-md border">
                        <div className="grid-items gap-sm mb-sm">
                            <div className="form-group">
                                <label className="label text-xs">{t.createOrder.itemDescription}</label>
                                <input
                                    type="text"
                                    name="desc"
                                    className="input input-sm"
                                    placeholder={t.createOrder.itemDescription}
                                    value={newItem.desc}
                                    onChange={handleNewItemChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="label text-xs">{t.approvals.category}</label>
                                <select
                                    name="category"
                                    className="input input-sm select"
                                    value={newItem.category}
                                    onChange={handleNewItemChange}
                                >
                                    <option value="office">Office</option>
                                    <option value="hardware">Hardware</option>
                                    <option value="software">Software</option>
                                    <option value="services">Services</option>
                                    <option value="travel">Travel</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="label text-xs">{t.createOrder.vendor}</label>
                                <select
                                    name="vendor"
                                    className="input input-sm select"
                                    value={newItem.vendor}
                                    onChange={handleNewItemChange}
                                >
                                    <option value="">{t.createOrder.selectVendor}</option>
                                    {vendors && vendors.map(v => (
                                        <option key={v.id} value={v.name}>{v.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid-items-2 gap-sm items-end">
                            <div className="form-group flex-grow">
                                <label className="label text-xs">{t.createOrder.productLink}</label>
                                <input
                                    type="text"
                                    name="link"
                                    className="input input-sm"
                                    placeholder={t.createOrder.productLinkPlaceholder}
                                    value={newItem.link}
                                    onChange={handleNewItemChange}
                                />
                            </div>
                            <div className="form-group" style={{ width: '80px' }}>
                                <label className="label text-xs">{t.createOrder.quantity}</label>
                                <input
                                    type="number"
                                    name="qty"
                                    className="input input-sm"
                                    min="1"
                                    value={newItem.qty}
                                    onChange={handleNewItemChange}
                                />
                            </div>
                            <div className="form-group" style={{ width: '100px' }}>
                                <label className="label text-xs">{t.createOrder.unitPrice}</label>
                                <input
                                    type="number"
                                    name="price"
                                    className="input input-sm"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    value={newItem.price}
                                    onChange={handleNewItemChange}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="btn btn-primary btn-sm mb-1"
                                disabled={!newItem.desc || !newItem.price}
                            >
                                {t.createOrder.addItem}
                            </button>
                        </div>
                    </div>

                    {/* Items List */}
                    {items.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b">
                                    <th className="p-sm text-xs text-muted">{t.createOrder.itemDescription}</th>
                                    <th className="p-sm text-xs text-muted">{t.createOrder.vendor}</th>
                                    <th className="p-sm text-xs text-muted">{t.createOrder.productLink}</th>
                                    <th className="p-sm text-xs text-muted text-right">{t.createOrder.quantity}</th>
                                    <th className="p-sm text-xs text-muted text-right">{t.createOrder.unitPrice}</th>
                                    <th className="p-sm text-xs text-muted text-right">{t.approvals.total}</th>
                                    <th className="p-sm text-xs text-muted"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} className="border-b last:border-0">
                                        <td className="p-sm">
                                            <div className="font-medium">{item.desc}</div>
                                            <div className="text-xs text-muted capitalize">{item.category}</div>
                                        </td>
                                        <td className="p-sm text-sm">{item.vendor || '-'}</td>
                                        <td className="p-sm text-sm">
                                            {item.link ? (
                                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                    {t.approvals.view}
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td className="p-sm text-right">{item.qty}</td>
                                        <td className="p-sm text-right">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className="p-sm text-right font-medium">R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className="p-sm text-right">
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                {t.createOrder.remove}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center p-md text-muted border-dashed border-2 rounded">
                            {t.requests.noRequests}
                        </div>
                    )}
                </div>

                {/* Unified Comment Field */}
                <div className={`card mb-xl ${initialData ? 'border-orange-200 bg-orange-50' : ''}`}>
                    <div className="form-group">
                        <label className={`label ${initialData ? 'text-orange-800 font-bold' : ''}`}>
                            {initialData ? 'Comentário (Obrigatório)' : 'Comentário (Opcional)'}
                        </label>
                        {initialData && (
                            <p className="text-xs text-orange-700 mb-sm">
                                Adicione um comentário explicando suas alterações para o aprovador.
                            </p>
                        )}
                        <textarea
                            name={initialData ? "editComment" : "notes"}
                            className={`input textarea ${initialData ? 'border-orange-300' : ''}`}
                            rows="3"
                            placeholder={initialData ? "Ex: Ajustei a quantidade conforme solicitado..." : t.createOrder.notesPlaceholder}
                            value={initialData ? formData.editComment : formData.notes}
                            onChange={handleChange}
                            required={!!initialData}
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end gap-md">
                    <button type="button" onClick={onCancel} className="btn btn-secondary">
                        {t.createOrder.cancel}
                    </button>
                    <button type="button" onClick={handleSubmit} className="btn btn-primary">
                        {initialData ? t.createOrder.updateRequest : t.createOrder.submitRequest}
                    </button>
                </div>
            </div>

            <style>{`
        .max-w-4xl { max-width: 56rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .mb-lg { margin-bottom: var(--spacing-lg); }
        .mb-xl { margin-bottom: var(--spacing-xl); }
        .mb-sm { margin-bottom: var(--spacing-sm); }
        .p-sm { padding: var(--spacing-sm); }
        .text-xs { font-size: 0.75rem; }
        .text-right { text-align: right; }
        .bg-slate-50 { background-color: #f8fafc; }
        .border { border: 1px solid var(--color-border); }
        .border-dashed { border-style: dashed; }
        .rounded { border-radius: var(--radius-md); }
        .text-red-500 { color: #ef4444; }
        .text-primary { color: var(--color-primary); }
        .flex-grow { flex-grow: 1; }
        
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        
        .grid-items {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
        }

        .grid-items-2 {
            display: grid;
            grid-template-columns: auto 80px 100px auto;
        }

        .input-sm {
            padding: 0.4rem;
            font-size: 0.875rem;
        }
        
        .btn-sm {
            padding: 0.4rem 0.8rem;
            font-size: 0.875rem;
        }

        .label {
          display: block;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          margin-bottom: var(--spacing-xs);
          color: var(--color-text-main);
        }
        
        .input {
          width: 100%;
          padding: 0.625rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-family: inherit;
          font-size: var(--font-size-base);
          transition: border-color var(--transition-fast);
        }
        
        .input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        
        .textarea {
          resize: vertical;
        }
        
        .select {
          background-color: white;
        }
      `}</style>
        </Layout>
    );
};

export default CreateOrder;
