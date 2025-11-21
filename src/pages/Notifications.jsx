import React, { useState } from 'react';
import Layout from '../components/Layout';
import { usePurchase } from '../context/PurchaseContext';
import { formatNotificationDate } from '../utils/notificationService';
import { translations as t } from '../utils/translations';

const Notifications = ({ onNavigate }) => {
    const { notifications, currentUser, markNotificationAsRead } = usePurchase();
    const [filter, setFilter] = useState('all');

    // Filter notifications for current user
    const userNotifications = notifications.filter(n => n.recipientId === currentUser.id);

    // Apply type filter
    const filteredNotifications = filter === 'all'
        ? userNotifications
        : userNotifications.filter(n => n.type === filter);

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markNotificationAsRead(notification.id);
        }
        // Navigate to the related request if available
        if (notification.requestId) {
            onNavigate('requests');
        }
    };

    const unreadCount = userNotifications.filter(n => !n.read).length;

    return (
        <Layout onNavigate={onNavigate} currentPath="notifications">
            <div className="max-w-4xl mx-auto">
                <div className="mb-lg">
                    <h1 className="text-2xl font-bold mb-xs">{t.notifications.title}</h1>
                    <p className="text-muted">
                        {unreadCount > 0 ? `Você tem ${unreadCount} notificação(ões) não lida(s)` : t.notifications.noNotifications}
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs mb-md">
                    <button
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        {t.requests.allStatus} ({userNotifications.length})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'submission' ? 'active' : ''}`}
                        onClick={() => setFilter('submission')}
                    >
                        {t.notifications.submission} ({userNotifications.filter(n => n.type === 'submission').length})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'approval' ? 'active' : ''}`}
                        onClick={() => setFilter('approval')}
                    >
                        {t.notifications.approval} ({userNotifications.filter(n => n.type === 'approval').length})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'rejection' ? 'active' : ''}`}
                        onClick={() => setFilter('rejection')}
                    >
                        {t.notifications.rejection} ({userNotifications.filter(n => n.type === 'rejection').length})
                    </button>
                </div>

                {/* Notifications List */}
                <div className="notifications-list">
                    {filteredNotifications.length === 0 ? (
                        <div className="card text-center p-xl">
                            <p className="text-muted">{t.notifications.noNotifications}</p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`notification-card card ${!notification.read ? 'unread' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex items-start gap-md">
                                    <div className={`notification-icon ${notification.type}`}>
                                        {notification.type === 'submission' && '📋'}
                                        {notification.type === 'approval' && '✅'}
                                        {notification.type === 'rejection' && '❌'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-xs">
                                            <h3 className="font-bold">{notification.subject}</h3>
                                            {!notification.read && (
                                                <span className="unread-badge">{t.notifications.new}</span>
                                            )}
                                        </div>
                                        <p className="text-sm mb-sm">{notification.message}</p>
                                        <div className="flex items-center gap-md text-xs text-muted">
                                            <span>📧 {notification.recipientEmail}</span>
                                            <span>•</span>
                                            <span>{formatNotificationDate(notification.timestamp)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <style>{`
                .filter-tabs {
                    display: flex;
                    gap: var(--spacing-xs);
                    border-bottom: 2px solid var(--color-border);
                    margin-bottom: var(--spacing-md);
                }

                .filter-tab {
                    padding: var(--spacing-sm) var(--spacing-md);
                    background: none;
                    border: none;
                    border-bottom: 2px solid transparent;
                    margin-bottom: -2px;
                    cursor: pointer;
                    font-size: var(--font-size-sm);
                    color: var(--color-text-muted);
                    transition: all var(--transition-fast);
                }

                .filter-tab:hover {
                    color: var(--color-text-main);
                }

                .filter-tab.active {
                    color: var(--color-primary);
                    border-bottom-color: var(--color-primary);
                    font-weight: 600;
                }

                .notifications-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-sm);
                }

                .notification-card {
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    border-left: 4px solid transparent;
                }

                .notification-card:hover {
                    transform: translateX(4px);
                    box-shadow: var(--shadow-md);
                }

                .notification-card.unread {
                    background-color: #f0f9ff;
                    border-left-color: var(--color-primary);
                }

                .notification-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    flex-shrink: 0;
                }

                .notification-icon.submission {
                    background-color: #dbeafe;
                }

                .notification-icon.approval {
                    background-color: #dcfce7;
                }

                .notification-icon.rejection {
                    background-color: #fee2e2;
                }

                .unread-badge {
                    background-color: var(--color-primary);
                    color: white;
                    padding: 0.125rem 0.5rem;
                    border-radius: var(--radius-sm);
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .max-w-4xl {
                    max-width: 56rem;
                }

                .mx-auto {
                    margin-left: auto;
                    margin-right: auto;
                }
            `}</style>
        </Layout>
    );
};

export default Notifications;
