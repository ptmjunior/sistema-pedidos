-- =====================================================
-- Casa das Tintas - FIX: Row Level Security Policies
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- PRIMEIRO: Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Approvers can manage users" ON users;
DROP POLICY IF EXISTS "Everyone can view vendors" ON vendors;
DROP POLICY IF EXISTS "Approvers and buyers can manage vendors" ON vendors;
DROP POLICY IF EXISTS "Users can view own requests" ON purchase_requests;
DROP POLICY IF EXISTS "Approvers and buyers can view all requests" ON purchase_requests;
DROP POLICY IF EXISTS "Users can create requests" ON purchase_requests;
DROP POLICY IF EXISTS "Users can update own pending requests" ON purchase_requests;
DROP POLICY IF EXISTS "Approvers can update request status" ON purchase_requests;
DROP POLICY IF EXISTS "Users can delete own pending requests" ON purchase_requests;
DROP POLICY IF EXISTS "Users can view items of accessible requests" ON request_items;
DROP POLICY IF EXISTS "Users can manage items of own requests" ON request_items;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- =====================================================
-- USERS TABLE POLICIES (SIMPLIFIED - NO RECURSION)
-- =====================================================

-- Everyone authenticated can view all users
CREATE POLICY "Authenticated users can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- =====================================================
-- VENDORS TABLE POLICIES
-- =====================================================

-- Everyone authenticated can view vendors
CREATE POLICY "Authenticated users can view vendors"
  ON vendors FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert vendors (we'll handle role check in app)
CREATE POLICY "Authenticated users can manage vendors"
  ON vendors FOR ALL
  TO authenticated
  USING (true);

-- =====================================================
-- PURCHASE REQUESTS TABLE POLICIES
-- =====================================================

-- Users can view their own requests
CREATE POLICY "Users can view own requests"
  ON purchase_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Authenticated users can view all requests (role check in app)
CREATE POLICY "All authenticated can view requests"
  ON purchase_requests FOR SELECT
  TO authenticated
  USING (true);

-- Users can create requests
CREATE POLICY "Users can create requests"
  ON purchase_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update requests
CREATE POLICY "Users can update requests"
  ON purchase_requests FOR UPDATE
  TO authenticated
  USING (true);

-- Users can delete their own pending requests
CREATE POLICY "Users can delete own pending requests"
  ON purchase_requests FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending');

-- =====================================================
-- REQUEST ITEMS TABLE POLICIES
-- =====================================================

-- Authenticated users can view all items
CREATE POLICY "Authenticated users can view items"
  ON request_items FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can manage items
CREATE POLICY "Authenticated users can manage items"
  ON request_items FOR ALL
  TO authenticated
  USING (true);

-- =====================================================
-- NOTIFICATIONS TABLE POLICIES
-- =====================================================

-- Users can view only their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Authenticated users can insert notifications
CREATE POLICY "Authenticated users can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);
