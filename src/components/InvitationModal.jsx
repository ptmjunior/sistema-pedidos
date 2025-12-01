import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const InvitationModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        role: 'requester',
        department: '',
        expiryDays: '7'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const generateToken = () => {
        // Generate cryptographically secure random token
        const array = new Uint8Array(24);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(36)).join('').substring(0, 32);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Validate email domain
            const emailDomain = formData.email.toLowerCase().split('@')[1];
            const { data: allowedDomains, error: domainError } = await supabase
                .from('allowed_domains')
                .select('domain')
                .eq('domain', emailDomain)
                .single();

            if (domainError || !allowedDomains) {
                throw new Error(`O domínio "${emailDomain}" não é permitido.`);
            }

            // Check if user already exists
            const { data: existingUser } = await supabase
                .from('users')
                .select('email')
                .eq('email', formData.email.toLowerCase())
                .single();

            if (existingUser) {
                throw new Error('Já existe um usuário com este email.');
            }

            // Check if there's a pending invitation for this email
            const { data: existingInvite } = await supabase
                .from('invitations')
                .select('*')
                .eq('email', formData.email.toLowerCase())
                .eq('status', 'pending')
                .single();

            if (existingInvite) {
                throw new Error('Já existe um convite pendente para este email.');
            }

            // Generate token and calculate expiry
            const token = generateToken();
            const expiresAt = formData.expiryDays !== 'never'
                ? new Date(Date.now() + parseInt(formData.expiryDays) * 24 * 60 * 60 * 1000).toISOString()
                : null;

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            // Create invitation
            const { data: invitation, error: inviteError } = await supabase
                .from('invitations')
                .insert([{
                    token,
                    email: formData.email.toLowerCase(),
                    role: formData.role,
                    department: formData.department || null,
                    created_by: user.id,
                    expires_at: expiresAt,
                    status: 'pending'
                }])
                .select()
                .single();

            if (inviteError) throw inviteError;

            // Generate invitation link
            const link = `${window.location.origin}/invite/${token}`;
            setGeneratedLink(link);
            onSuccess();
        } catch (err) {
            console.error('Error creating invitation:', err);
            setError(err.message || 'Erro ao gerar convite. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        alert('Link copiado para a área de transferência!');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="text-xl font-bold">Gerar Convite</h2>
                    <button onClick={onClose} className="close-button">✕</button>
                </div>

                {!generatedLink ? (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="label">Email *</label>
                            <input
                                type="email"
                                name="email"
                                className="input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="usuario@casadastintas-al.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Função *</label>
                            <select
                                name="role"
                                className="input select"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="requester">Solicitante</option>
                                <option value="buyer">Comprador</option>
                                <option value="approver">Aprovador</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="label">Departamento</label>
                            <input
                                type="text"
                                name="department"
                                className="input"
                                value={formData.department}
                                onChange={handleChange}
                                placeholder="Opcional"
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Válido por</label>
                            <select
                                name="expiryDays"
                                className="input select"
                                value={formData.expiryDays}
                                onChange={handleChange}
                            >
                                <option value="7">7 dias</option>
                                <option value="30">30 dias</option>
                                <option value="never">Nunca expira</option>
                            </select>
                        </div>

                        {error && (
                            <div className="error-message mb-md">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-sm">
                            <button
                                type="button"
                                onClick={onClose}
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
                                {isLoading ? 'Gerando...' : 'Gerar Link'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="success-content">
                        <div className="success-icon">✅</div>
                        <h3 className="text-lg font-bold mb-sm">Convite Gerado com Sucesso!</h3>
                        <p className="text-muted mb-md">Compartilhe este link com o usuário:</p>

                        <div className="link-box">
                            <input
                                type="text"
                                value={generatedLink}
                                readOnly
                                className="input"
                            />
                            <button
                                onClick={copyToClipboard}
                                className="btn btn-primary mt-sm"
                            >
                                📋 Copiar Link
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="btn btn-secondary mt-md w-full"
                        >
                            Fechar
                        </button>
                    </div>
                )}

                <style>{`
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: rgba(0, 0, 0, 0.5);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                    }
                    .modal-content {
                        background: white;
                        border-radius: var(--radius-md);
                        padding: var(--spacing-xl);
                        max-width: 500px;
                        width: 90%;
                        max-height: 90vh;
                        overflow-y: auto;
                    }
                    .modal-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: var(--spacing-lg);
                    }
                    .close-button {
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        cursor: pointer;
                        color: var(--color-text-muted);
                    }
                    .close-button:hover {
                        color: var(--color-text-main);
                    }
                    .success-content {
                        text-align: center;
                    }
                    .success-icon {
                        font-size: 3rem;
                        margin-bottom: var(--spacing-md);
                    }
                    .link-box {
                        background-color: var(--color-background);
                        padding: var(--spacing-md);
                        border-radius: var(--radius-md);
                        border: 2px dashed var(--color-border);
                    }
                    .error-message {
                        background-color: #fee;
                        color: #c33;
                        padding: var(--spacing-sm) var(--spacing-md);
                        border-radius: var(--radius-md);
                        font-size: var(--font-size-sm);
                        border: 1px solid #fcc;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default InvitationModal;
