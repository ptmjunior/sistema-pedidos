/**
 * Notification Service
 * Generates notification objects for the purchase order workflow
 */

let notificationIdCounter = 1;

/**
 * Creates notifications for approvers when a request is submitted
 * @param {Object} request - The purchase request object
 * @param {Array} approvers - Array of approver user objects
 * @returns {Array} Array of notification objects
 */
export const createSubmissionNotifications = (request, approvers) => {
    return approvers.map(approver => ({
        type: 'submission',
        recipient_id: approver.id,
        subject: 'Novo Pedido Aguardando Aprovação',
        message: `<p>Um novo pedido (PO-2024-00${request.id}) foi submetido por <strong>${request.user}</strong> no valor de R$ ${request.amount.toFixed(2)}.</p><p>Descrição: ${request.desc}</p>`,
        request_id: request.id,
        read: false
    }));
};

/**
 * Creates notifications when a request is approved
 * @param {Object} request - The purchase request object
 * @param {Object} requester - The user who created the request
 * @param {Array} buyers - Array of buyer user objects
 * @param {String} approverName - Name of the approver
 * @returns {Array} Array of notification objects
 */
export const createApprovalNotifications = (request, requester, buyers, approverName) => {
    const notifications = [];

    // Notification for requester
    if (requester) {
        notifications.push({
            type: 'approval',
            recipient_id: requester.id,
            subject: 'Pedido Aprovado',
            message: `<p>Seu pedido (PO-2024-00${request.id}) no valor de R$ ${request.amount.toFixed(2)} foi aprovado por <strong>${approverName}</strong>.</p><p>A equipe de compras processará seu pedido.</p>`,
            request_id: request.id,
            read: false
        });
    }

    // Notifications for buyers
    buyers.forEach(buyer => {
        notifications.push({
            type: 'approval',
            recipient_id: buyer.id,
            subject: 'Novo Pedido Aprovado para Compra',
            message: `<p>O pedido (PO-2024-00${request.id}) no valor de R$ ${request.amount.toFixed(2)} foi aprovado por <strong>${approverName}</strong>.</p><p>Solicitante: ${request.user}</p><p>Descrição: ${request.desc}</p>`,
            request_id: request.id,
            read: false
        });
    });

    return notifications;
};

/**
 * Creates notification when a request is rejected
 * @param {Object} request - The purchase request object
 * @param {Object} requester - The user who created the request
 * @param {String} approverName - Name of the approver
 * @returns {Array} Array of notification objects
 */
export const createRejectionNotifications = (request, requester, approverName) => {
    if (!requester) return [];

    return [{
        type: 'rejection',
        recipient_id: requester.id,
        subject: 'Pedido Rejeitado',
        message: `<p>Seu pedido (PO-2024-00${request.id}) no valor de R$ ${request.amount.toFixed(2)} foi rejeitado por <strong>${approverName}</strong>.</p><p>Por favor, revise e submeta novamente se necessário.</p>`,
        request_id: request.id,
        read: false
    }];
};

/**
 * Formats a timestamp for display
 * @param {String} timestamp - ISO timestamp string
 * @returns {String} Formatted date string
 */
export const formatNotificationDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
