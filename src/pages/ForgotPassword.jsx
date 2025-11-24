import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { translations as t } from '../utils/translations';

const ForgotPassword = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setMessage({
                type: 'success',
                text: t.forgotPassword.successMessage
            });
            setEmail('');
        } catch (error) {
            setMessage({
                type: 'error',
                text: t.forgotPassword.errorMessage
            });
            console.error('Error sending reset email:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card card">
                <div className="login-header">
                    <h1 className="text-3xl font-bold mb-xs">🔒 {t.forgotPassword.title}</h1>
                    <p className="text-muted">{t.forgotPassword.subtitle}</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label className="label">{t.forgotPassword.email}</label>
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t.forgotPassword.emailPlaceholder}
                            required
                            autoFocus
                        />
                    </div>

                    {message.text && (
                        <div className={`message-box ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? t.forgotPassword.sending : t.forgotPassword.sendButton}
                    </button>
                </form>

                <div className="login-footer">
                    <button
                        onClick={() => onNavigate('login')}
                        className="text-primary hover:underline"
                    >
                        {t.forgotPassword.backToLogin}
                    </button>
                </div>
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

                .login-footer {
                    text-align: center;
                    padding-top: var(--spacing-md);
                    border-top: 1px solid var(--color-border);
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

export default ForgotPassword;
