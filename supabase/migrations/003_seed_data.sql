-- =====================================================
-- Casa das Tintas - Seed Data
-- Initial users, vendors, and sample data
-- =====================================================

-- =====================================================
-- USERS
-- =====================================================
-- Note: These users need to be created in Supabase Auth first
-- This just adds their profile data

INSERT INTO users (id, email, name, role, department) VALUES
  ('00000000-0000-0000-0000-000000000001', 'joao.silva@casadastintas-al.com', 'João Silva', 'requester', 'Vendas'),
  ('00000000-0000-0000-0000-000000000002', 'maria.santos@casadastintas-al.com', 'Maria Santos', 'approver', 'Gerência'),
  ('00000000-0000-0000-0000-000000000003', 'pedro.oliveira@casadastintas-al.com', 'Pedro Oliveira', 'buyer', 'Compras')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VENDORS
-- =====================================================

INSERT INTO vendors (name, email, phone) VALUES
  ('Tintas Coral', 'vendas@coral.com.br', '(82) 3333-1111'),
  ('Suvinil Distribuidora', 'contato@suvinil.com.br', '(82) 3333-2222'),
  ('Sherwin-Williams', 'comercial@sherwin.com.br', '(82) 3333-3333'),
  ('Eucatex', 'vendas@eucatex.com.br', '(82) 3333-4444'),
  ('Ypiranga Tintas', 'atendimento@ypiranga.com.br', '(82) 3333-5555');

-- =====================================================
-- SAMPLE PURCHASE REQUESTS (Optional)
-- =====================================================
-- Uncomment if you want sample data for testing

/*
INSERT INTO purchase_requests (user_id, description, amount, status, department) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Tintas para reforma da loja matriz', 2500.00, 'pending', 'Vendas'),
  ('00000000-0000-0000-0000-000000000001', 'Material de pintura para estoque', 1800.00, 'approved', 'Vendas');

-- Get the IDs of the inserted requests
DO $$
DECLARE
  request1_id UUID;
  request2_id UUID;
BEGIN
  SELECT id INTO request1_id FROM purchase_requests WHERE description = 'Tintas para reforma da loja matriz';
  SELECT id INTO request2_id FROM purchase_requests WHERE description = 'Material de pintura para estoque';

  -- Items for first request
  INSERT INTO request_items (request_id, description, quantity, unit_price, total) VALUES
    (request1_id, 'Tinta Acrílica Premium 18L - Branco', 10, 150.00, 1500.00),
    (request1_id, 'Tinta Acrílica Premium 18L - Cinza', 5, 150.00, 750.00),
    (request1_id, 'Rolo de Lã 23cm', 20, 12.50, 250.00);

  -- Items for second request
  INSERT INTO request_items (request_id, description, quantity, unit_price, total) VALUES
    (request2_id, 'Tinta Látex 18L - Cores Variadas', 12, 120.00, 1440.00),
    (request2_id, 'Pincel 2 polegadas', 30, 8.00, 240.00),
    (request2_id, 'Fita Crepe 18mm', 24, 5.00, 120.00);
END $$;
*/

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE users IS 'Seed data: Initial system users';
COMMENT ON TABLE vendors IS 'Seed data: Common paint suppliers in Alagoas';
