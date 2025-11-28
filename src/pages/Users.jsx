import React, { useState } from 'react';
import Layout from '../components/Layout';
import { usePurchase } from '../context/PurchaseContext';
import { translations as t } from '../utils/translations';

const Users = ({ onNavigate }) => {
    const { users, addUser, updateUser, deleteUser, currentUser } = usePurchase();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'requester',
        department: ''
    });

    // Only Approvers (Admins) can manage users
    if (currentUser.role !== 'approver') {
        // Auto-redirect to dashboard after 3 seconds
        React.useEffect(() => {
            const timer = setTimeout(() => {
                onNavigate('dashboard');
            }, 3000);
            return () => clearTimeout(timer);
        }, [onNavigate]);

        return (
            <Layout onNavigate={onNavigate} currentPath="users">
                <div className="card p-xl text-center">
                    <div className="access-denied-icon mb-md">🚫</div>
                    <h2 className="text-xl font-bold text-red-600 mb-sm">Acesso Negado</h2>
                    <p className="text-muted mb-md">Você não tem permissão para visualizar esta página.</p>
                    <p className="text-sm text-muted mb-lg">Apenas administradores podem gerenciar usuários.</p>
                    <button
                        onClick={() => onNavigate('dashboard')}
                        className="btn btn-primary"
                    >
                        Ir para o Dashboard
                    </button>
                    <p className="text-xs text-muted mt-md">Redirecionando automaticamente em 3 segundos...</p>
                </div>
                <style>{`
                    .access-denied-icon {
                        font-size: 4rem;
                        opacity: 0.5;
                    }
                `}</style>
            </Layout>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (editingId) {
                await updateUser(editingId, formData);
                setMessage({ type: 'success', text: 'Usuário atualizado com sucesso!' });
            } else {
                await addUser(formData);
                setMessage({ type: 'success', text: 'Usuário criado com sucesso!' });
            }

            // Wait a bit to show the message, then reset
            setTimeout(() => {
                resetForm();
            }, 2000);
        } catch (error) {
            console.error('Error saving user:', error);
            setMessage({
                type: 'error',
                text: error.message || 'Erro ao salvar usuário. Tente novamente.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (user) => {
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Don't populate password on edit
            role: user.role,
            department: user.department || ''
        });
        setEditingId(user.id);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            deleteUser(id);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', password: '', role: 'requester', department: '' });
        setEditingId(null);
        setShowForm(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <Layout onNavigate={onNavigate} currentPath="users">
            <div className="flex justify-between items-center mb-md">
                <h1 className="text-2xl font-bold">{t.users.title}</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary"
                >
                    {showForm ? t.users.cancel : t.users.addUser}
                </button>
            </div>

            {showForm && (
                <div className="card mb-lg animate-fade-in">
                    <h2 className="text-lg font-bold mb-md">{editingId ? t.users.edit : t.users.addNew}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid-2 gap-md mb-md">
                            <div className="form-group">
                                <label className="label">{t.users.name}</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="input"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">{t.users.email}</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="input"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">
                                    Senha{editingId && ' (opcional - deixe em branco para manter a atual)'}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    className="input"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required={!editingId}
                                    minLength={6}
                                    placeholder={editingId ? 'Nova senha (opcional)' : 'Mínimo 6 caracteres'}
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">{t.users.role}</label>
                                <select
                                    name="role"
                                    className="input select"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="requester">{t.users.requester}</option>
                                    <option value="approver">{t.users.approver}</option>
                                    <option value="buyer">{t.users.buyer}</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="label">{t.users.department}</label>
                                <input
                                    type="text"
                                    name="department"
                                    className="input"
                                    value={formData.department}
                                    onChange={handleChange}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>

                        {message.text && (
                            <div className={`message-box ${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="flex justify-end gap-sm">
                            <button type="button" onClick={resetForm} className="btn btn-secondary" disabled={isLoading}>{t.users.cancel}</button>
                            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                {isLoading ? 'Salvando...' : t.users.save}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card p-0">
                <table className="w-full">
                    <thead>
                        <tr className="text-left border-b bg-slate-50">
                            <th className="p-md text-sm text-muted font-medium">{t.users.name}</th>
                            <th className="p-md text-sm text-muted font-medium">{t.users.email}</th>
                            <th className="p-md text-sm text-muted font-medium">{t.users.role}</th>
                            <th className="p-md text-sm text-muted font-medium">{t.users.department}</th>
                            <th className="p-md text-sm text-muted font-medium text-right">{t.users.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b last:border-0">
                                <td className="p-md font-bold">{user.name}</td>
                                <td className="p-md text-muted">{user.email}</td>
                                <td className="p-md">
                                    <span className={`badge badge-role role-${user.role}`}>
                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                    </span>
                                </td>
                                <td className="p-md text-muted">{user.department || '-'}</td>
                                <td className="p-md text-right">
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="text-primary hover:underline mr-sm"
                                    >
                                        {t.users.edit}
                                    </button>
                                    {user.id !== currentUser.id && (
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-600 hover:underline"
                                        >
                                            {t.users.delete}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .badge-role {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        .role-requester { background-color: #e0f2fe; color: #0369a1; }
        .role-approver { background-color: #f3e8ff; color: #7e22ce; }
        .role-buyer { background-color: #ffedd5; color: #c2410c; }
        .text-red-600 { color: #dc2626; }
        .mr-sm { margin-right: var(--spacing-sm); }
        .message-box {
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--radius-md);
            margin-bottom: var(--spacing-md);
            font-size: var(--font-size-sm);
        }
        .message-box.success {
            background-color: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }
        .message-box.error {
            background-color: #fee;
            color: #c33;
            border: 1px solid #fcc;
        }
      `}</style>
        </Layout>
    );
};

export default Users;
