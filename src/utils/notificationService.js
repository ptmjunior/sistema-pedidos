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
        id: notificationIdCounter++,
        type: 'submission',
        recipientId: approver.id,
        recipientEmail: approver.email,
        subject: 'New Purchase Order Awaiting Approval',
        message: `A new purchase order (PO-2024-00${request.id}) has been submitted by ${request.user} for $${request.amount.toFixed(2)}. Description: ${request.desc}`,
        requestId: request.id,
        timestamp: new Date().toISOString(),
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
            id: notificationIdCounter++,
            type: 'approval',
            recipientId: requester.id,
            recipientEmail: requester.email,
            subject: 'Purchase Order Approved',
            message: `Your purchase order (PO-2024-00${request.id}) for $${request.amount.toFixed(2)} has been approved by ${approverName}. The procurement team will process your order.`,
            requestId: request.id,
            timestamp: new Date().toISOString(),
            read: false
        });
    }

    // Notifications for buyers
    buyers.forEach(buyer => {
        notifications.push({
            id: notificationIdCounter++,
            type: 'approval',
            recipientId: buyer.id,
            recipientEmail: buyer.email,
            subject: 'New Approved Purchase Order for Processing',
            message: `Purchase order (PO-2024-00${request.id}) for $${request.amount.toFixed(2)} has been approved by ${approverName}. Requested by ${request.user}. Description: ${request.desc}`,
            requestId: request.id,
            timestamp: new Date().toISOString(),
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
        id: notificationIdCounter++,
        type: 'rejection',
        recipientId: requester.id,
        recipientEmail: requester.email,
        subject: 'Purchase Order Rejected',
        message: `Your purchase order (PO-2024-00${request.id}) for $${request.amount.toFixed(2)} has been rejected by ${approverName}. Please review and resubmit if necessary.`,
        requestId: request.id,
        timestamp: new Date().toISOString(),
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
