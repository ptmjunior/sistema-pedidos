import React from 'react';
import { translations as t } from '../utils/translations';

const RequestHistory = ({ comments = [] }) => {
    if (!comments || comments.length === 0) {
        return (
            <div className="history-empty">
                <p className="text-muted text-sm">Nenhuma interação registrada ainda.</p>
            </div>
        );
    }

    const getIcon = (type) => {
        switch (type) {
            case 'status_change':
                return '🔄';
            case 'comment':
                return '💬';
            case 'edit':
                return '✏️';
            default:
                return '📝';
        }
    };

    const getStatusLabel = (status) => {
        return t.status[status] || status;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEventDescription = (comment) => {
        if (comment.type === 'status_change') {
            return (
                <>
                    mudou o status de <strong>{getStatusLabel(comment.oldStatus)}</strong> para{' '}
                    <strong>{getStatusLabel(comment.newStatus)}</strong>
                </>
            );
        } else if (comment.type === 'edit') {
            return 'editou o pedido';
        } else if (comment.type === 'comment') {
            return 'adicionou um comentário';
        }
        return 'realizou uma ação';
    };

    return (
        <div className="request-history">
            <h3 className="history-title">Histórico de Interações</h3>
            <div className="timeline">
                {comments.map((comment) => (
                    <div key={comment.id} className="timeline-item">
                        <div className="timeline-icon">{getIcon(comment.type)}</div>
                        <div className="timeline-content">
                            <div className="timeline-header">
                                <span className="timeline-user">{comment.userName}</span>
                                <span className="timeline-action">{getEventDescription(comment)}</span>
                            </div>
                            {comment.comment && (
                                <div className="timeline-comment">
                                    <em>"{comment.comment}"</em>
                                </div>
                            )}
                            <div className="timeline-date">{formatDate(comment.createdAt)}</div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .request-history {
                    margin-top: var(--spacing-lg);
                    padding: var(--spacing-lg);
                    background-color: var(--color-bg);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--color-border);
                }

                .history-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    margin-bottom: var(--spacing-md);
                    color: var(--color-text);
                }

                .history-empty {
                    padding: var(--spacing-md);
                    text-align: center;
                }

                .timeline {
                    position: relative;
                    padding-left: var(--spacing-lg);
                }

                .timeline::before {
                    content: '';
                    position: absolute;
                    left: 12px;
                    top: 8px;
                    bottom: 8px;
                    width: 2px;
                    background-color: var(--color-border);
                }

                .timeline-item {
                    position: relative;
                    display: flex;
                    gap: var(--spacing-md);
                    margin-bottom: var(--spacing-lg);
                }

                .timeline-item:last-child {
                    margin-bottom: 0;
                }

                .timeline-icon {
                    position: absolute;
                    left: -28px;
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: white;
                    border: 2px solid var(--color-border);
                    border-radius: 50%;
                    font-size: 14px;
                    z-index: 1;
                }

                .timeline-content {
                    flex: 1;
                    padding: var(--spacing-sm) var(--spacing-md);
                    background-color: white;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-sm);
                }

                .timeline-header {
                    margin-bottom: var(--spacing-xs);
                    line-height: 1.5;
                }

                .timeline-user {
                    font-weight: 600;
                    color: var(--color-primary);
                    margin-right: var(--spacing-xs);
                }

                .timeline-action {
                    color: var(--color-text);
                }

                .timeline-comment {
                    margin: var(--spacing-sm) 0;
                    padding: var(--spacing-sm);
                    background-color: var(--color-bg);
                    border-left: 3px solid var(--color-primary);
                    border-radius: var(--radius-sm);
                    color: var(--color-text-secondary);
                }

                .timeline-date {
                    font-size: 0.75rem;
                    color: var(--color-muted);
                    margin-top: var(--spacing-xs);
                }
            `}</style>
        </div>
    );
};

export default RequestHistory;
