import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Register = () => {
    const [token, setToken] = useState('');
    const [invitation, setInvitation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        confirmPassword: ''
    });
    const [isRegistering, setIsRegistering] = useState(false);

    useEffect(() => {
        // Extract token from URL manually since we don't have react-router
        const path = window.location.pathname;
        const extractedToken = path.split('/invite/')[1];

        if (extractedToken) {
            setToken(extractedToken);
            loadInvitation(extractedToken);
        } else {
            setError('Link de convite inválido.');
            setIsLoading(false);
        }
    }, []);

    const loadInvitation = async (inviteToken) => {
        try {
            // Run expiration check first
            await supabase.rpc('expire_old_invitations');

            // Fetch invitation
            const { data, error: inviteError } = await supabase
                .from('invitations')
                .select('*, users!invitations_created_by_fkey(name)')
                .eq('token', inviteToken)
                .single();

            if (inviteError || !data) {
                setError('Convite não encontrado ou inválido.');
                setIsLoading(false);
                return;
            }

            // Validate invitation
            if (data.status === 'accepted') {
                setError('Este convite já foi utilizado.');
            } else if (data.status === 'cancelled') {
                setError('Este convite foi cancelado.');
            } else if (data.status === 'expired') {
                setError('Este convite expirou.');
            } else if (data.status === 'pending') {
                setInvitation(data);
            }
        } catch (err) {
            console.error('Error loading invitation:', err);
            setError('Erro ao carregar convite.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsRegistering(true);

        try {
            // Validate passwords match
            if (formData.password !== formData.confirmPassword) {
                throw new Error('As senhas não coincidem.');
            }

            if (formData.password.length < 6) {
                throw new Error('A senha deve ter pelo menos 6 caracteres.');
            }

            let userId = null;

            // Try to create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: invitation.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.name,
                        role: invitation.role,
                        department: invitation.department
                    }
                }
            });

            // Check if user already exists in Auth (from previous deletion)
            if (authError && authError.message.includes('already registered')) {
                // User exists in Auth but not in users table
                // Try to sign in to get user ID
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: invitation.email,
                    password: formData.password
                });

                if (signInError) {
                    throw new Error('Este email já está registrado com senha diferente. Entre em contato com o administrador.');
                }

                if (signInData.user) {
                    userId = signInData.user.id;
                }
            } else if (authError) {
                throw authError;
            } else if (authData.user) {
                userId = authData.user.id;
            }

            if (userId) {
                // Create or update public profile
                const { error: profileError } = await supabase
                    .from('users')
                    .upsert([{
                        id: userId,
                        email: invitation.email,
                        name: formData.name,
                        role: invitation.role,
                        department: invitation.department || null,
                        active: true
                    }], {
                        onConflict: 'id'
                    });

                if (profileError) throw profileError;

                // Mark invitation as used
                const { error: updateError } = await supabase
                    .from('invitations')
                    .update({
                        status: 'accepted',
                        used_at: new Date().toISOString(),
                        used_by: authData.user.id
                    })
                    .eq('token', token);

                if (updateError) console.warn('Could not update invitation status:', updateError);

                // Auto-login the new user
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: invitation.email,
                    password: formData.password
                });

                if (signInError) {
                    // Registration succeeded but auto-login failed
                    alert('Conta criada com sucesso! Redirecionando para o login...');
                    window.location.href = '/';
                } else {
                    // Success! Redirect to dashboard
                    window.location.href = '/';
                }
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'Erro ao criar conta. Tente novamente.');
            setIsRegistering(false);
        }
    };

    if (isLoading) {
        return (
            <div className="register-container">
                <div className="register-card card">
                    <div className="text-center p-xl">Carregando...</div>
                </div>
            </div>
        );
    }

    if (error && !invitation) {
        return (
            <div className="register-container">
                <div className="register-card card">
                    <div className="error-icon">❌</div>
                    <h2 className="text-xl font-bold text-red-600 mb-sm">{error}</h2>
                    <p className="text-muted mb-lg">
                        Entre em contato com o administrador para solicitar um novo convite.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="btn btn-primary"
                    >
                        Ir para Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="register-container">
            <div className="register-card card">
                <div className="logo-container mb-lg">
                    <img src="/logo.png" alt="Logo" className="logo" />
                </div>

                <div className="invite-header mb-lg">
                    <div className="invite-icon">📧</div>
                    <h2 className="text-xl font-bold mb-xs">Você foi convidado!</h2>
                    <p className="text-muted">
                        <strong>{invitation?.users?.name || 'Um administrador'}</strong> convidou você para se juntar à plataforma.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label className="label">Email</label>
                        <input
                            type="email"
                            className="input"
                            value={invitation?.email || ''}
                            disabled
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Nome Completo *</label>
                        <input
                            type="text"
                            name="name"
                            className="input"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Seu nome completo"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Senha *</label>
                        <input
                            type="password"
                            name="password"
                            className="input"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Mínimo 6 caracteres"
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Confirmar Senha *</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="input"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Digite a senha novamente"
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
                        disabled={isRegistering}
                    >
                        {isRegistering ? 'Criando conta...' : 'Criar Conta'}
                    </button>

                    <div className="role-info">
                        <p className="text-xs text-muted">
                            Você será cadastrado como: <strong>{invitation?.role === 'requester' ? 'Solicitante' : invitation?.role === 'buyer' ? 'Comprador' : 'Aprovador'}</strong>
                        </p>
                    </div>
                </form>
            </div>

            <style>{`
                .register-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, var(--color-primary) 0%, #0a7070 100%);
                    padding: var(--spacing-md);
                }
                .register-card {
                    max-width: 450px;
                    width: 100%;
                    padding: var(--spacing-xl);
                }
                .logo-container {
                    text-align: center;
                }
                .logo {
                    max-width: 200px;
                    height: auto;
                }
                .invite-header {
                    text-align: center;
                }
                .invite-icon {
                    font-size: 3rem;
                    margin-bottom: var(--spacing-sm);
                }
                .error-icon {
                    font-size: 4rem;
                    text-align: center;
                    margin-bottom: var(--spacing-md);
                }
                .register-form {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-md);
                }
                .role-info {
                    text-align: center;
                    margin-top: var(--spacing-sm);
                }
                .error-message {
                    background-color: #fee;
                    color: #c33;
                    padding: var(--spacing-sm) var(--spacing-md);
                    border-radius: var(--radius-md);
                    font-size: var(--font-size-sm);
                    border: 1px solid #fcc;
                }
                .w-full {
                    width: 100%;
                }
            `}</style>
        </div>
    );
};

export default Register;
