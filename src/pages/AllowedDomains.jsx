import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { usePurchase } from '../context/PurchaseContext';

const AllowedDomains = ({ onNavigate }) => {
    const { currentUser } = usePurchase();
    const [domains, setDomains] = useState([]);
    const [newDomain, setNewDomain] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        loadDomains();
    }, []);

    const loadDomains = async () => {
        try {
            const { data, error } = await supabase
                .from('allowed_domains')
                .select('*')
                .order('domain');

            if (error) throw error;
            setDomains(data || []);
        } catch (err) {
            console.error('Error loading domains:', err);
            setError('Erro ao carregar domínios permitidos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddDomain = async (e) => {
        e.preventDefault();
        setError('');
        setIsAdding(true);

        // Clean and validate domain
        const cleanDomain = newDomain.trim().toLowerCase().replace(/^@/, '');

        if (!cleanDomain) {
            setError('Digite um domínio válido');
            setIsAdding(false);
            return;
        }

        // Basic domain validation
        const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/;
        if (!domainRegex.test(cleanDomain)) {
            setError('Formato de domínio inválido. Exemplo: empresa.com');
            setIsAdding(false);
            return;
        }

        try {
            const { error: insertError } = await supabase
                .from('allowed_domains')
                .insert([{ domain: cleanDomain }]);

            if (insertError) {
                if (insertError.code === '23505') { // Unique constraint violation
                    setError('Este domínio já está na lista');
                } else {
                    throw insertError;
                }
            } else {
                setNewDomain('');
                await loadDomains();
            }
        } catch (err) {
            console.error('Error adding domain:', err);
            setError('Erro ao adicionar domínio. Tente novamente.');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteDomain = async (id, domain) => {
        if (!confirm(`Tem certeza que deseja remover o domínio "${domain}"?\n\nUsuários com este domínio não poderão mais ser criados.`)) {
            return;
        }

        try {
            const { error: deleteError } = await supabase
                .from('allowed_domains')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;
            await loadDomains();
        } catch (err) {
            console.error('Error deleting domain:', err);
            alert('Erro ao remover domínio. Tente novamente.');
        }
    };

    if (isLoading) {
        return (
            <Layout onNavigate={onNavigate} currentPath="allowed-domains">
                <div className="text-center p-xl">Carregando...</div>
            </Layout>
        );
    }

    // Only Admins can manage allowed domains
    if (currentUser?.role !== 'admin') {
        return (
            <Layout onNavigate={onNavigate} currentPath="allowed-domains">
                <div className="card p-xl text-center">
                    <div className="access-denied-icon mb-md">🚫</div>
                    <h2 className="text-xl font-bold text-red-600 mb-sm">Acesso Negado</h2>
                    <p className="text-muted mb-md">Você não tem permissão para visualizar esta página.</p>
                    <p className="text-sm text-muted mb-lg">Apenas administradores podem gerenciar domínios permitidos.</p>
                    <button
                        onClick={() => onNavigate('dashboard')}
                        className="btn btn-primary"
                    >
                        Ir para o Dashboard
                    </button>
                </div>
                <style>{`
                    .access-denied-icon {
                        font-size: 4rem;
                        opacity: 0.5;
                    }
                    .text-red-600 { color: #dc2626; }
                `}</style>
            </Layout>
        );
    }

    return (
        <Layout onNavigate={onNavigate} currentPath="allowed-domains">
            <div className="mb-md">
                <h1 className="text-2xl font-bold mb-xs">Domínios de Email Permitidos</h1>
                <p className="text-muted">
                    Apenas usuários com emails destes domínios podem ser criados no sistema.
                </p>
            </div>

            {/* Add Domain Form */}
            <div className="card mb-md">
                <h2 className="text-lg font-bold mb-md">Adicionar Novo Domínio</h2>
                <form onSubmit={handleAddDomain} className="flex gap-sm items-start">
                    <div className="flex-1">
                        <input
                            type="text"
                            className="input"
                            placeholder="exemplo: empresa.com.br"
                            value={newDomain}
                            onChange={(e) => setNewDomain(e.target.value)}
                            disabled={isAdding}
                        />
                        <p className="text-xs text-muted mt-xs">
                            Digite apenas o domínio, sem @ (exemplo: empresa.com)
                        </p>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isAdding}
                    >
                        {isAdding ? 'Adicionando...' : 'Adicionar'}
                    </button>
                </form>
                {error && (
                    <div className="error-message mt-sm">
                        {error}
                    </div>
                )}
            </div>

            {/* Domains List */}
            <div className="card p-0">
                <div className="p-md border-b">
                    <h2 className="text-lg font-bold">
                        Domínios Permitidos ({domains.length})
                    </h2>
                </div>
                {domains.length === 0 ? (
                    <div className="p-xl text-center text-muted">
                        Nenhum domínio cadastrado
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b bg-slate-50">
                                <th className="p-md text-sm text-muted font-medium">Domínio</th>
                                <th className="p-md text-sm text-muted font-medium">Data de Criação</th>
                                <th className="p-md text-sm text-muted font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {domains.map((domain) => (
                                <tr key={domain.id} className="border-b last:border-0 hover:bg-slate-50">
                                    <td className="p-md font-medium">@{domain.domain}</td>
                                    <td className="p-md text-sm text-muted">
                                        {new Date(domain.created_at).toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="p-md">
                                        <button
                                            onClick={() => handleDeleteDomain(domain.id, domain.domain)}
                                            className="btn-text text-danger"
                                        >
                                            Remover
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <style>{`
                .btn-text {
                    background: none;
                    border: none;
                    padding: 0;
                    font-weight: 500;
                    cursor: pointer;
                }
                .text-danger {
                    color: var(--color-danger);
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
        </Layout>
    );
};

export default AllowedDomains;
