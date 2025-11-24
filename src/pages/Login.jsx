import React, { useState } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { translations as t } from '../utils/translations';

const Login = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: email.toLowerCase(),
                password: password
            });

            if (signInError) {
                setError(handleSupabaseError(signInError));
            } else if (data.user) {
                // Authentication successful - the app will automatically redirect
                // via the auth state listener in PurchaseContext
                console.log('Login successful:', data.user.email);
            }
        } catch (err) {
            setError(t.login.error);
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card card">
                <div className="login-header">
                    <h1 className="text-3xl font-bold mb-xs">🎨 {t.login.title}</h1>
                    <p className="text-muted">{t.login.subtitle}</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label className="label">{t.login.email}</label>
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t.login.emailPlaceholder}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">{t.login.password}</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t.login.passwordPlaceholder}
                            required
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? t.login.loggingIn : t.login.loginButton}
                    </button>
                </form>

                <div className="login-footer">
                    <button
                        onClick={() => onNavigate('forgot-password')}
                        className="text-primary hover:underline text-sm"
                    >
                        Esqueci minha senha
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

                .error-message {
                    background-color: #fee;
                    color: #c33;
                    padding: var(--spacing-sm) var(--spacing-md);
                    border-radius: var(--radius-md);
                    margin-bottom: var(--spacing-md);
                    font-size: var(--font-size-sm);
                    border: 1px solid #fcc;
                }

                .login-footer {
                    border-top: 1px solid var(--color-border);
                    padding-top: var(--spacing-md);
                    text-align: center;
                }

                .demo-users {
                    margin-top: var(--spacing-sm);
                    background-color: var(--color-background);
                    padding: var(--spacing-md);
                    border-radius: var(--radius-md);
                    text-align: left;
                }

                .demo-user {
                    font-size: var(--font-size-sm);
                    margin-bottom: var(--spacing-xs);
                    color: var(--color-text-main);
                }

                .demo-password {
                    font-size: var(--font-size-sm);
                    margin-top: var(--spacing-sm);
                    padding-top: var(--spacing-sm);
                    border-top: 1px solid var(--color-border);
                    color: var(--color-text-main);
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

export default Login;
