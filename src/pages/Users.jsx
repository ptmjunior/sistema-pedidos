import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import InvitationModal from '../components/InvitationModal';
import { supabase } from '../lib/supabase';
import { usePurchase } from '../context/PurchaseContext';
import { translations as t } from '../utils/translations';

const Users = ({ onNavigate }) => {
    const { users, addUser, updateUser, deleteUser, toggleUserActive, currentUser } = usePurchase();
    const [showForm, setShowForm] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'invitations'
    const [invitations, setInvitations] = useState([]);
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

    // Load invitations when tab changes
    useEffect(() => {
        if (activeTab === 'invitations') {
            loadInvitations();
        }
    }, [activeTab]);

    const loadInvitations = async () => {
        setIsLoading(true);
        try {
            // Expire old invitations first
            await supabase.rpc('expire_old_invitations');

            const { data, error } = await supabase
                .from('invitations')
                .select('*, users!invitations_created_by_fkey(name)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setInvitations(data || []);
        } catch (err) {
            console.error('Error loading invitations:', err);
            setMessage({ type: 'error', text: 'Erro ao carregar convites.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelInvitation = async (id) => {
        if (!confirm('Tem certeza que deseja cancelar este convite?')) return;

        try {
            const { error } = await supabase
                .from('invitations')
                .update({ status: 'cancelled' })
                .eq('id', id);

            if (error) throw error;
            loadInvitations();
            setMessage({ type: 'success', text: 'Convite cancelado com sucesso.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            console.error('Error cancelling invitation:', err);
            setMessage({ type: 'error', text: 'Erro ao cancelar convite.' });
        }
    };

    const copyInviteLink = (token) => {
        const link = `${window.location.origin}/invite/${token}`;
        navigator.clipboard.writeText(link);
        setMessage({ type: 'success', text: 'Link copiado!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    // Only Admins can manage users
    if (currentUser.role !== 'admin') {
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

    const handleToggleActive = async (user) => {
        const action = user.active !== false ? 'desativar' : 'ativar';
        const message = user.active !== false
            ? `Desativar o usuário "${user.name}"?\n\nEle não poderá mais fazer login no sistema, mas todos os seus pedidos serão mantidos.`
            : `Ativar o usuário "${user.name}"?\n\nEle poderá fazer login no sistema novamente.`;

        if (window.confirm(message)) {
            try {
                const newStatus = await toggleUserActive(user.id, user.active);
                setMessage({
                    type: 'success',
                    text: `Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso!`
                });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } catch (error) {
                console.error('Error toggling user status:', error);
                setMessage({
                    type: 'error',
                    text: 'Erro ao alterar status do usuário. Tente novamente.'
                });
            }
        }
    };

    const handleDelete = (id, userName) => {
        const confirmMessage = `⚠️ ATENÇÃO: Exclusão Permanente ⚠️\n\nDeseja EXCLUIR PERMANENTEMENTE o usuário "${userName}"?\n\nEsta ação:\n• Remove completamente o usuário do sistema\n• NÃO pode ser desfeita\n• Os pedidos do usuário serão MANTIDOS\n\nRecomendação: Use "Desativar" ao invés de excluir.\n\nTem certeza que deseja continuar?`;

        if (window.confirm(confirmMessage)) {
            // Second confirmation
            if (window.confirm('Esta é sua última chance. Confirma a EXCLUSÃO PERMANENTE?')) {
                deleteUser(id);
            }
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
                <div className="flex gap-sm">
                    <div className="flex bg-slate-100 rounded-lg p-1 mr-md">
                        <button
                            className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-white shadow-sm text-primary' : 'text-muted hover:text-gray-700'}`}
                            onClick={() => setActiveTab('users')}
                        >
                            Usuários
                        </button>
                        <button
                            className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${activeTab === 'invitations' ? 'bg-white shadow-sm text-primary' : 'text-muted hover:text-gray-700'}`}
                            onClick={() => setActiveTab('invitations')}
                        >
                            Convites
                        </button>
                    </div>

                    {activeTab === 'users' ? (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="btn btn-primary"
                        >
                            {showForm ? t.users.cancel : t.users.addUser}
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="btn btn-primary"
                        >
                            + Gerar Convite
                        </button>
                    )}
                </div>
            </div>

            {message.text && (
                <div className={`message-box ${message.type} mb-md`}>
                    {message.text}
                </div>
            )}

            {showInviteModal && (
                <InvitationModal
                    onClose={() => setShowInviteModal(false)}
                    onSuccess={() => {
                        loadInvitations();
                        // Don't close modal immediately so user can copy link
                        // Modal handles its own success state
                    }}
                />
            )}

            {activeTab === 'users' ? (
                <>
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
                                            <option value="admin">Administrador</option>
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
                </>
            ) : null}

            {/* Domains List */}
            {activeTab === 'users' ? (
                <div className="card p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b bg-slate-50">
                                <th className="p-md text-sm text-muted font-medium">{t.users.name}</th>
                                <th className="p-md text-sm text-muted font-medium">{t.users.email}</th>
                                <th className="p-md text-sm text-muted font-medium">{t.users.role}</th>
                                <th className="p-md text-sm text-muted font-medium">{t.users.department}</th>
                                <th className="p-md text-sm text-muted font-medium">Status</th>
                                <th className="p-md text-sm text-muted font-medium text-right">{t.users.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className={`border-b last:border-0 ${user.active === false ? 'opacity-60' : ''}`}>
                                    <td className="p-md font-bold">{user.name}</td>
                                    <td className="p-md text-muted">{user.email}</td>
                                    <td className="p-md">
                                        <span className={`badge badge-role role-${user.role}`}>
                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                        </span>
                                    </td>
                                    <td className="p-md text-muted">{user.department || '-'}</td>
                                    <td className="p-md">
                                        <span className={`badge badge-status status-${user.active !== false ? 'active' : 'inactive'}`}>
                                            {user.active !== false ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="p-md text-right">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="text-primary hover:underline mr-sm"
                                        >
                                            {t.users.edit}
                                        </button>
                                        {user.id !== currentUser.id && (
                                            <>
                                                <button
                                                    onClick={() => handleToggleActive(user)}
                                                    className={`${user.active !== false ? 'text-warning' : 'text-success'} hover:underline mr-sm`}
                                                >
                                                    {user.active !== false ? 'Desativar' : 'Ativar'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id, user.name)}
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Excluir
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="card p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b bg-slate-50">
                                <th className="p-md text-sm text-muted font-medium">Email</th>
                                <th className="p-md text-sm text-muted font-medium">Link</th>
                                <th className="p-md text-sm text-muted font-medium">Função</th>
                                <th className="p-md text-sm text-muted font-medium">Criado por</th>
                                <th className="p-md text-sm text-muted font-medium">Status</th>
                                <th className="p-md text-sm text-muted font-medium">Expira em</th>
                                <th className="p-md text-sm text-muted font-medium text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invitations.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-xl text-center text-muted">
                                        Nenhum convite encontrado
                                    </td>
                                </tr>
                            ) : (
                                invitations.map((invite) => (
                                    <tr key={invite.id} className="border-b last:border-0">
                                        <td className="p-md font-medium">{invite.email}</td>
                                        <td className="p-md text-muted text-sm">
                                            <span className="truncate" title={`${window.location.origin}/invite/${invite.token}`}>
                                                {`${window.location.origin}/invite/${invite.token}`}
                                            </span>
                                        </td>
                                        <td className="p-md">
                                            <span className={`badge badge-role role-${invite.role}`}>
                                                {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                                            </span>
                                        </td>
                                        <td className="p-md text-muted text-sm">
                                            {invite.users?.name || 'Admin'}
                                            <div className="text-xs">
                                                {new Date(invite.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-md">
                                            <span className={`badge badge-status status-${invite.status}`}>
                                                {invite.status === 'pending' ? 'Pendente' :
                                                    invite.status === 'accepted' ? 'Aceito' :
                                                        invite.status === 'expired' ? 'Expirado' : 'Cancelado'}
                                            </span>
                                        </td>
                                        <td className="p-md text-muted text-sm">
                                            {invite.expires_at ? new Date(invite.expires_at).toLocaleDateString() : 'Nunca'}
                                        </td>
                                        <td className="p-md text-right">
                                            {invite.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => copyInviteLink(invite.token)}
                                                        className="text-primary hover:underline mr-sm"
                                                        title="Copiar Link"
                                                    >
                                                        Copiar
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelInvitation(invite.id)}
                                                        className="text-red-600 hover:underline"
                                                        title="Cancelar Convite"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

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
        .role-admin { background-color: #fee2e2; color: #991b1b; font-weight: 700; }
        
        .badge-status {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        .status-active { background-color: #dcfce7; color: #15803d; }
        .status-inactive { background-color: #fee2e2; color: #b91c1c; }
        
        .status-pending { background-color: #fef3c7; color: #d97706; }
        .status-accepted { background-color: #dcfce7; color: #15803d; }
        .status-expired { background-color: #f1f5f9; color: #64748b; }
        .status-cancelled { background-color: #fee2e2; color: #b91c1c; }
        
        .text-red-600 { color: #dc2626; }
        .text-warning { color: #f59e0b; }
        .text-success { color: #15803d; }
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
        .truncate {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 250px;
            display: block;
        }
        .opacity-60 {
            opacity: 0.6;
        }
      `}</style>
        </Layout>
    );
};

export default Users;
