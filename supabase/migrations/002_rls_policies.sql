-- =====================================================
-- Casa das Tintas - Row Level Security Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Everyone can view all users (needed for dropdowns, etc.)
CREATE POLICY "Users can view all users"
  ON users FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Only approvers can manage users (create, delete)
CREATE POLICY "Approvers can manage users"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'approver'
    )
  );

-- =====================================================
-- VENDORS TABLE POLICIES
-- =====================================================

-- Everyone can view vendors
CREATE POLICY "Everyone can view vendors"
  ON vendors FOR SELECT
  USING (true);

-- Approvers and buyers can manage vendors
CREATE POLICY "Approvers and buyers can manage vendors"
  ON vendors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('approver', 'buyer')
    )
  );

-- =====================================================
-- PURCHASE REQUESTS TABLE POLICIES
-- =====================================================

-- Users can view their own requests
CREATE POLICY "Users can view own requests"
  ON purchase_requests FOR SELECT
  USING (user_id = auth.uid());

-- Approvers and buyers can view all requests
CREATE POLICY "Approvers and buyers can view all requests"
  ON purchase_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('approver', 'buyer')
    )
  );

-- Users can create requests
CREATE POLICY "Users can create requests"
  ON purchase_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own pending requests
CREATE POLICY "Users can update own pending requests"
  ON purchase_requests FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- Approvers can update any request status
CREATE POLICY "Approvers can update request status"
  ON purchase_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'approver'
    )
  );

-- Users can delete their own pending requests
CREATE POLICY "Users can delete own pending requests"
  ON purchase_requests FOR DELETE
  USING (user_id = auth.uid() AND status = 'pending');

-- =====================================================
-- REQUEST ITEMS TABLE POLICIES
-- =====================================================

-- Users can view items of requests they can access
CREATE POLICY "Users can view items of accessible requests"
  ON request_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM purchase_requests pr
      WHERE pr.id = request_items.request_id
      AND (
        pr.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM users
          WHERE id = auth.uid() AND role IN ('approver', 'buyer')
        )
      )
    )
  );

-- Users can manage items of their own pending requests
CREATE POLICY "Users can manage items of own requests"
  ON request_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM purchase_requests pr
      WHERE pr.id = request_items.request_id
      AND pr.user_id = auth.uid()
      AND pr.status = 'pending'
    )
  );

-- =====================================================
-- NOTIFICATIONS TABLE POLICIES
-- =====================================================

-- Users can view only their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (recipient_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- System can insert notifications (via service role)
-- No policy needed - will use service role key

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if user is approver
CREATE OR REPLACE FUNCTION is_approver()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'approver'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is buyer
CREATE OR REPLACE FUNCTION is_buyer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'buyer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
