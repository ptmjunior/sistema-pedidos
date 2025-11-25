import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { translations as t } from '../utils/translations';

const ResetPassword = ({ onNavigate }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        // Check if this is a password reset flow
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = hashParams.get('type');

        if (type !== 'recovery') {
            setMessage({
                type: 'error',
                text: 'Link inválido ou expirado. Solicite um novo link de recuperação.'
            });
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // Validate passwords match
        if (password !== confirmPassword) {
            setMessage({
                type: 'error',
                text: t.resetPassword.passwordMismatch
            });
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setMessage({
                type: 'error',
                text: 'A senha deve ter no mínimo 6 caracteres'
            });
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setMessage({
                type: 'success',
                text: t.resetPassword.successMessage
            });

            // Clear recovery mode flag
            localStorage.removeItem('password_recovery_active');

            // Sign out the user and redirect to login after 2 seconds
            setTimeout(async () => {
                await supabase.auth.signOut();
                onNavigate('login');
            }, 2000);

        } catch (error) {
            setMessage({
                type: 'error',
                text: t.resetPassword.errorMessage
            });
            console.error('Error updating password:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card card">
                <div className="login-header">
                    <h1 className="text-3xl font-bold mb-xs">🔐 {t.resetPassword.title}</h1>
                    <p className="text-muted">{t.resetPassword.subtitle}</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label className="label">{t.resetPassword.newPassword}</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t.resetPassword.passwordPlaceholder}
                            required
                            minLength={6}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">{t.resetPassword.confirmPassword}</label>
                        <input
                            type="password"
                            className="input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={t.resetPassword.passwordPlaceholder}
                            required
                            minLength={6}
                        />
                    </div>

                    {message.text && (
                        <div className={`message-box ${message.type}`}>
                            {message.text}
                            {message.type === 'success' && (
                                <div className="mt-sm text-xs">{t.resetPassword.redirecting}</div>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={isLoading || message.type === 'success'}
                    >
                        {isLoading ? t.resetPassword.updating : t.resetPassword.updateButton}
                    </button>
                </form>
            </div>

            <style>{`
                .login-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: var(--spacing-md);
                }

                .login-card {
                    width: 100%;
                    max-width: 420px;
                    padding: var(--spacing-xl);
                    animation: fadeIn 0.5s ease-out;
                }

                .login-header {
                    text-align: center;
                    margin-bottom: var(--spacing-xl);
                }

                .login-form {
                    margin-bottom: var(--spacing-lg);
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

                .mt-sm {
                    margin-top: var(--spacing-sm);
                }

                .text-xs {
                    font-size: var(--font-size-xs);
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default ResetPassword;
