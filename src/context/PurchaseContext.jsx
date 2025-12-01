import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { createSubmissionNotifications, createApprovalNotifications, createRejectionNotifications } from '../utils/notificationService';

const PurchaseContext = createContext();

export const usePurchase = () => {
    const context = useContext(PurchaseContext);
    if (!context) {
        throw new Error('usePurchase must be used within a PurchaseProvider');
    }
    return context;
};

export const PurchaseProvider = ({ children }) => {
    // Authentication State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Data State
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        totalSpend: 0
    });

    // =====================================================
    // AUTHENTICATION
    // =====================================================

    useEffect(() => {
        // Check active session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            // Check if this is a password recovery flow
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const type = hashParams.get('type');

            if (session?.user && type !== 'recovery') {
                loadUserProfile(session.user.id);
            } else {
                setIsLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            // Mark password recovery in localStorage
            if (event === 'PASSWORD_RECOVERY') {
                localStorage.setItem('password_recovery_active', 'true');
                setIsLoading(false);
                return;
            }

            // Check if we're in recovery mode - don't authenticate
            const isRecoveryMode = localStorage.getItem('password_recovery_active') === 'true';
            if (isRecoveryMode) {
                setIsLoading(false);
                return;
            }

            // Check if this is a password recovery flow
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const type = hashParams.get('type');

            if (session?.user && type !== 'recovery') {
                loadUserProfile(session.user.id);
            } else if (!session?.user) {
                setCurrentUser(null);
                setIsAuthenticated(false);
                setIsLoading(false);
            } else {
                // User session exists but in recovery mode - don't authenticate yet
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadUserProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;

            if (data) {
                // Check if user is active
                if (data.active === false) {
                    console.warn('User account is inactive');
                    await supabase.auth.signOut();
                    alert('Sua conta foi desativada. Entre em contato com o administrador.');
                    setIsLoading(false);
                    return;
                }

                setCurrentUser(data);
                setIsAuthenticated(true);
                // Load all data after authentication
                await Promise.all([
                    loadUsers(),
                    loadRequests(),
                    loadVendors(),
                    loadNotifications(userId)
                ]);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setCurrentUser(null);
            setIsAuthenticated(false);
            setUsers([]);
            setRequests([]);
            setVendors([]);
            setNotifications([]);
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    // =====================================================
    // DATA LOADING
    // =====================================================

    const loadUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('name');

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const loadRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('purchase_requests')
                .select(`
                    *,
                    user:users(name, email, department),
                    items:request_items(*),
                    comments:request_comments(
                        id,
                        comment_type,
                        old_status,
                        new_status,
                        comment,
                        created_at,
                        user:users(name, email)
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform data to match existing structure
            const transformedRequests = data?.map(req => ({
                id: req.id,
                desc: req.description,
                amount: parseFloat(req.amount),
                status: req.status,
                createdAt: req.created_at, // Add raw timestamp for PO ID generation
                date: new Date(req.created_at).toLocaleDateString('pt-BR', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }),
                userId: req.user_id,
                user: req.user?.name || 'Unknown',
                department: req.department,
                items: req.items?.map(item => ({
                    id: item.id,
                    desc: item.description,
                    qty: item.quantity,
                    price: parseFloat(item.unit_price),
                    total: parseFloat(item.total),
                    vendor: item.vendor_id,
                    link: item.product_link || '',
                    deliveryDate: item.estimated_delivery_date
                })) || [],
                comments: req.comments?.map(comment => ({
                    id: comment.id,
                    type: comment.comment_type,
                    oldStatus: comment.old_status,
                    newStatus: comment.new_status,
                    comment: comment.comment,
                    createdAt: comment.created_at,
                    userName: comment.user?.name || 'Unknown',
                    userEmail: comment.user?.email
                })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || []
            })) || [];

            setRequests(transformedRequests);
        } catch (error) {
            console.error('Error loading requests:', error);
        }
    };

    const loadVendors = async () => {
        try {
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .order('name');

            if (error) throw error;
            setVendors(data || []);
        } catch (error) {
            console.error('Error loading vendors:', error);
        }
    };

    const loadNotifications = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('recipient_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform to match existing structure
            const transformedNotifications = data?.map(notif => ({
                id: notif.id,
                type: notif.type,
                recipientId: notif.recipient_id,
                subject: notif.subject,
                message: notif.message,
                requestId: notif.request_id,
                read: notif.read,
                timestamp: new Date(notif.created_at).toISOString()
            })) || [];

            setNotifications(transformedNotifications);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    // =====================================================
    // STATS CALCULATION
    // =====================================================

    useEffect(() => {
        if (requests.length > 0) {
            const pending = requests.filter(r => r.status === 'open').length;
            const approved = requests.filter(r => r.status === 'approved').length;
            const totalSpend = requests
                .filter(r => r.status === 'approved')
                .reduce((sum, r) => sum + r.amount, 0);

            setStats({ pending, approved, totalSpend });
        }
    }, [requests]);

    // =====================================================
    // PURCHASE REQUESTS CRUD
    // =====================================================

    const addRequest = async (newRequest) => {
        try {
            let totalAmount = newRequest.amount;
            if (newRequest.items && newRequest.items.length > 0) {
                totalAmount = newRequest.items.reduce((sum, item) => sum + item.total, 0);
            }

            // Insert purchase request
            const { data: request, error: requestError } = await supabase
                .from('purchase_requests')
                .insert([{
                    user_id: currentUser.id,
                    description: newRequest.desc,
                    amount: totalAmount,
                    department: currentUser.department,
                    status: 'open'
                }])
                .select()
                .single();

            if (requestError) throw requestError;

            // Insert request items
            if (newRequest.items && newRequest.items.length > 0) {
                const items = newRequest.items.map(item => ({
                    request_id: request.id,
                    description: item.desc,
                    quantity: item.qty,
                    unit_price: item.price,
                    total: item.total,
                    vendor_id: item.vendor || null,
                    product_link: item.link || null
                }));

                const { error: itemsError } = await supabase
                    .from('request_items')
                    .insert(items);

                if (itemsError) throw itemsError;
            }

            // Create notifications for approvers and admins
            const approvers = users.filter(u => u.role === 'approver' || u.role === 'admin');
            if (approvers.length > 0) {
                const submissionNotifications = approvers.map(approver => ({
                    recipient_id: approver.id,
                    type: 'submission',
                    subject: `Novo pedido de ${currentUser.name}`,
                    message: `<p><strong>${currentUser.name}</strong> submeteu um novo pedido:</p><p>${newRequest.desc}</p><p>Valor: R$ ${totalAmount.toFixed(2)}</p>`,
                    request_id: request.id
                }));

                await supabase
                    .from('notifications')
                    .insert(submissionNotifications);

                // Send email notification to approvers
                try {
                    await fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'submission',
                            request: {
                                id: request.id,
                                createdAt: request.created_at,
                                desc: newRequest.desc,
                                amount: totalAmount,
                                department: currentUser.department,
                                items: newRequest.items
                            },
                            requesterName: currentUser.name,
                            recipients: approvers.map(a => a.email),
                            cc: [currentUser.email]
                        })
                    });
                    console.log('Email notification sent to approvers');
                } catch (emailError) {
                    console.error('Error sending email:', emailError);
                    // Don't throw - email failure shouldn't break the request creation
                }
            }

            // Reload requests
            await loadRequests();
            if (currentUser) {
                await loadNotifications(currentUser.id);
            }
        } catch (error) {
            console.error('Error adding request:', error);
            throw error;
        }
    };

    const updateRequest = async (id, updatedData) => {
        try {
            let totalAmount = updatedData.amount;
            if (updatedData.items && updatedData.items.length > 0) {
                totalAmount = updatedData.items.reduce((sum, item) => sum + item.total, 0);
            }

            // Get current request to check status
            const currentRequest = requests.find(r => r.id === id);
            const updateData = {
                description: updatedData.desc,
                amount: totalAmount
            };

            // If request is 'pending' (awaiting changes), change to 'open' when edited
            if (currentRequest && currentRequest.status === 'pending') {
                updateData.status = 'open';
            }

            // Update purchase request
            const { error: requestError } = await supabase
                .from('purchase_requests')
                .update(updateData)
                .eq('id', id);

            if (requestError) throw requestError;

            // Delete existing items and insert new ones
            await supabase
                .from('request_items')
                .delete()
                .eq('request_id', id);

            if (updatedData.items && updatedData.items.length > 0) {
                const items = updatedData.items.map(item => ({
                    request_id: id,
                    description: item.desc,
                    quantity: item.qty,
                    unit_price: item.price,
                    total: item.total,
                    vendor_id: item.vendor || null,
                    product_link: item.link || null
                }));

                const { error: itemsError } = await supabase
                    .from('request_items')
                    .insert(items);

                if (itemsError) throw itemsError;
            }

            // Create comment if request was edited from pending status
            if (currentRequest && currentRequest.status === 'pending' && updateData.status === 'open') {
                await supabase
                    .from('request_comments')
                    .insert([{
                        request_id: id,
                        user_id: currentUser.id,
                        comment_type: 'edit',
                        old_status: 'pending',
                        new_status: 'open',
                        comment: updatedData.editComment || 'Pedido editado pelo solicitante'
                    }]);
            }

            // Reload data
            await loadRequests();
            if (currentUser) {
                await loadNotifications(currentUser.id);
            }
        } catch (error) {
            console.error('Error updating request:', error);
            throw error;
        }
    };

    const updateStatus = async (id, status, dates = null, comments = '') => {
        try {
            // Get current request to track old status
            const request = requests.find(r => r.id === id);
            const oldStatus = request?.status;

            // Update request status
            const { error: statusError } = await supabase
                .from('purchase_requests')
                .update({ status })
                .eq('id', id);

            if (statusError) throw statusError;

            // Create comment for status change
            if (oldStatus && oldStatus !== status) {
                await supabase
                    .from('request_comments')
                    .insert([{
                        request_id: id,
                        user_id: currentUser.id,
                        comment_type: 'status_change',
                        old_status: oldStatus,
                        new_status: status,
                        comment: comments || null
                    }]);
            }

            // Handle 'purchased' status with delivery dates
            if (status === 'purchased' && dates) {
                const updatePromises = Object.entries(dates).map(([itemId, date]) =>
                    supabase
                        .from('request_items')
                        .update({ estimated_delivery_date: date })
                        .eq('id', itemId)
                );
                await Promise.all(updatePromises);
            }

            // Create notifications based on status
            if (request) {
                if (status === 'approved') {
                    await createApprovalNotifications(request, currentUser, users, supabase);
                } else if (status === 'rejected') {
                    await createRejectionNotifications(request, currentUser, users, supabase);
                } else if (status === 'pending') {
                    // Notification when more info is requested
                    await supabase
                        .from('notifications')
                        .insert([{
                            recipient_id: request.userId,
                            type: 'more_info_requested',
                            subject: `Mais informações solicitadas`,
                            message: `<p>O aprovador solicitou mais informações sobre seu pedido:</p><p><em>${comments}</em></p>`,
                            request_id: request.id
                        }]);
                } else if (status === 'purchased') {
                    await supabase
                        .from('notifications')
                        .insert([{
                            recipient_id: request.userId,
                            type: 'purchased',
                            subject: `Pedido Comprado`,
                            message: `<p>Seu pedido <strong>${request.desc}</strong> foi comprado.</p>`,
                            request_id: request.id
                        }]);
                }
            }

            // Reload data
            await loadRequests();
            if (currentUser) {
                await loadNotifications(currentUser.id);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            throw error;
        }
    };

    // =====================================================
    // VENDORS CRUD
    // =====================================================

    const addVendor = async (newVendor) => {
        try {
            const { error } = await supabase
                .from('vendors')
                .insert([newVendor]);

            if (error) throw error;
            await loadVendors();
        } catch (error) {
            console.error('Error adding vendor:', error);
            throw error;
        }
    };

    // =====================================================
    // USER MANAGEMENT
    // =====================================================

    const addUser = async (newUser) => {
        try {
            // Validate email domain before attempting to create user
            const emailDomain = newUser.email.toLowerCase().split('@')[1];

            const { data: allowedDomains, error: domainCheckError } = await supabase
                .from('allowed_domains')
                .select('domain')
                .eq('domain', emailDomain)
                .single();

            if (domainCheckError || !allowedDomains) {
                throw new Error(`O domínio de email "${emailDomain}" não é permitido. Apenas emails corporativos são aceitos. Contate o administrador para adicionar este domínio.`);
            }

            // 1. Create Auth User (using a temporary client to avoid logging out current user)
            // We use the ANON key here, which allows sign up if enabled in Supabase
            const tempSupabase = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY,
                { auth: { persistSession: false } } // Important: Don't persist this session
            );

            console.log('Attempting to create Auth user:', newUser.email);
            const { data: authData, error: authError } = await tempSupabase.auth.signUp({
                email: newUser.email,
                password: newUser.password,
                options: {
                    data: {
                        name: newUser.name,
                        role: newUser.role,
                        department: newUser.department
                    }
                }
            });

            if (authError) {
                console.error('Auth SignUp Error:', authError);
                throw authError;
            }

            console.log('Auth user created:', authData);

            if (authData.user) {
                // 2. Create Public Profile
                console.log('Attempting to create public profile for:', authData.user.id);
                const { error: profileError } = await supabase
                    .from('users')
                    .insert([{
                        id: authData.user.id, // Use the ID from Auth
                        email: newUser.email,
                        name: newUser.name,
                        role: newUser.role,
                        department: newUser.department
                    }]);

                if (profileError) {
                    console.error('Profile Creation Error:', profileError);
                    throw profileError;
                }
                console.log('Public profile created successfully');
            }

            await loadUsers();
        } catch (error) {
            console.error('Error adding user (FINAL CATCH):', error);
            alert(`Erro ao criar usuário: ${error.message}`); // Show alert to user
            throw error;
        }
    };

    const updateUser = async (id, updatedData) => {
        try {
            // Remove password field - passwords are managed by Supabase Auth, not in users table
            const { password, ...dataWithoutPassword } = updatedData;

            // Note: Password updates for other users require Admin API (not implemented)
            // Admins can reset passwords manually via Supabase Dashboard

            const { error } = await supabase
                .from('users')
                .update(dataWithoutPassword)
                .eq('id', id);

            if (error) throw error;
            await loadUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    };

    const deleteUser = async (id) => {
        try {
            // Note: This only soft-deletes by removing from users table
            // The user's requests will remain in the system
            // Auth user remains in Supabase Auth but won't be able to log in
            // because profile is missing
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    };

    const toggleUserActive = async (id, currentActiveStatus) => {
        try {
            const newStatus = !currentActiveStatus;
            const { error } = await supabase
                .from('users')
                .update({ active: newStatus })
                .eq('id', id);

            if (error) throw error;
            await loadUsers();

            return newStatus;
        } catch (error) {
            console.error('Error toggling user active status:', error);
            throw error;
        }
    };

    // =====================================================
    // NOTIFICATIONS
    // =====================================================

    const markNotificationAsRead = async (id) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', id);

            if (error) throw error;

            // Update local state
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const getUnreadCount = (userId) => {
        return notifications.filter(n => n.recipientId === userId && !n.read).length;
    };

    // Legacy function for compatibility (not used with Supabase)
    const login = () => {
        console.warn('login() is deprecated. Use Supabase Auth instead.');
    };

    const addNotifications = () => {
        console.warn('addNotifications() is deprecated. Notifications are created in database.');
    };

    // =====================================================
    // PROVIDER
    // =====================================================

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px',
                color: '#666'
            }}>
                Carregando...
            </div>
        );
    }

    return (
        <PurchaseContext.Provider value={{
            requests,
            stats,
            vendors,
            users,
            currentUser,
            isAuthenticated,
            notifications,
            addRequest,
            updateRequest,
            updateStatus,
            addVendor,
            login, // Legacy
            logout,
            addUser,
            updateUser,
            deleteUser,
            toggleUserActive,
            addNotifications, // Legacy
            markNotificationAsRead,
            getUnreadCount
        }}>
            {children}
        </PurchaseContext.Provider>
    );
};
