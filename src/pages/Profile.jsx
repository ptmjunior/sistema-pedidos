import React, { useState } from 'react';
import Layout from '../components/Layout';
import { usePurchase } from '../context/PurchaseContext';
import { supabase } from '../lib/supabase';

const Profile = ({ onNavigate }) => {
    const { currentUser } = usePurchase();
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
        setMessage({ type: '', text: '' });
    };

    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // Validate passwords match
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({
                type: 'error',
                text: 'As senhas não coincidem'
            });
            return;
        }

        // Validate password length
        if (passwordData.newPassword.length < 6) {
            setMessage({
                type: 'error',
                text: 'A nova senha deve ter no mínimo 6 caracteres'
            });
            return;
        }

        setIsLoading(true);

        try {
            // First, verify current password by attempting to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: currentUser.email,
                password: passwordData.currentPassword
            });

            if (signInError) {
                throw new Error('Senha atual incorreta');
            }

            // Update password
            const { error: updateError } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (updateError) throw updateError;

            setMessage({
                type: 'success',
                text: 'Senha alterada com sucesso!'
            });

            // Reset form
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            // Close form after showing message for 3 seconds
            setTimeout(() => {
                setIsChangingPassword(false);
                setMessage({ type: '', text: '' });
            }, 3000);

        } catch (error) {
            console.error('Error changing password:', error);
            setMessage({
                type: 'error',
                text: error.message || 'Erro ao alterar senha. Tente novamente.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleName = (role) => {
        const roles = {
            requester: 'Solicitante',
            approver: 'Aprovador',
            buyer: 'Comprador'
        };
        return roles[role] || role;
    };

    return (
        <Layout onNavigate={onNavigate} currentPath="profile">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-lg">👤 Meu Perfil</h1>

                {/* User Information Card */}
                <div className="card mb-lg">
                    <h2 className="text-lg font-bold mb-md">Informações da Conta</h2>
                    <div className="profile-info">
                        <div className="info-row">
                            <span className="info-label">Nome:</span>
                            <span className="info-value">{currentUser.name}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Email:</span>
                            <span className="info-value">{currentUser.email}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Função:</span>
                            <span className="info-value">
                                <span className={`badge badge-role role-${currentUser.role}`}>
                                    {getRoleName(currentUser.role)}
                                </span>
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Departamento:</span>
                            <span className="info-value">{currentUser.department || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Password Change Card */}
                <div className="card">
                    <div className="flex justify-between items-center mb-md">
                        <h2 className="text-lg font-bold">🔐 Alterar Senha</h2>
                        {!isChangingPassword && (
                            <button
                                onClick={() => setIsChangingPassword(true)}
                                className="btn btn-secondary btn-sm"
                            >
                                Alterar Senha
                            </button>
                        )}
                    </div>

                    {isChangingPassword && (
                        <form onSubmit={handleSubmitPassword} className="animate-fade-in">
                            <div className="form-group">
                                <label className="label">Senha Atual</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    className="input"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Nova Senha</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    className="input"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    minLength={6}
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Confirmar Nova Senha</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="input"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    minLength={6}
                                />
                            </div>

                            {message.text && (
                                <div className={`message-box ${message.type}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="flex justify-end gap-sm">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsChangingPassword(false);
                                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                        setMessage({ type: '', text: '' });
                                    }}
                                    className="btn btn-secondary"
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Alterando...' : 'Atualizar Senha'}
                                </button>
                            </div>
                        </form>
                    )}

                    {!isChangingPassword && (
                        <p className="text-muted text-sm">
                            Clique em "Alterar Senha" para modificar sua senha de acesso.
                        </p>
                    )}
                </div>
            </div>

            <style>{`
                .max-w-2xl {
                    max-width: 42rem;
                }
                .mx-auto {
                    margin-left: auto;
                    margin-right: auto;
                }
                .profile-info {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-md);
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--spacing-sm) 0;
                    border-bottom: 1px solid var(--color-border);
                }
                .info-row:last-child {
                    border-bottom: none;
                }
                .info-label {
                    font-weight: 600;
                    color: var(--color-text-muted);
                    font-size: var(--font-size-sm);
                }
                .info-value {
                    font-weight: 500;
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
                .btn-sm {
                    padding: 0.5rem 1rem;
                    font-size: 0.875rem;
                }
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
                .gap-sm {
                    gap: var(--spacing-sm);
                }
            `}</style>
        </Layout>
    );
};

export default Profile;
