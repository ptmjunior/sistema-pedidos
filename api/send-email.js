import nodemailer from 'nodemailer';
import { emailTemplates } from '../src/utils/emailTemplates.js';

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { type, request, recipients, requesterName, approverName, cc } = req.body;

        // Validate required fields
        if (!type || !request || !recipients || recipients.length === 0) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create transporter with Google SMTP
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Get email template based on type
        let emailData;
        switch (type) {
            case 'submission':
                emailData = emailTemplates.submission(request, requesterName);
                break;
            case 'approval':
                emailData = emailTemplates.approval(request, requesterName, approverName);
                break;
            case 'rejection':
                emailData = emailTemplates.rejection(request, requesterName, approverName);
                break;
            default:
                return res.status(400).json({ error: 'Invalid email type' });
        }

        // Send email
        const info = await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME || 'Sistema de Pedidos'}" <${process.env.SMTP_USER}>`,
            to: recipients.join(', '),
            cc: cc ? cc.join(', ') : undefined,
            subject: emailData.subject,
            html: emailData.html,
        });

        console.log('Email sent:', info.messageId);

        return res.status(200).json({
            success: true,
            messageId: info.messageId,
            recipients: recipients.length,
        });

    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({
            error: 'Failed to send email',
            message: error.message,
        });
    }
}
