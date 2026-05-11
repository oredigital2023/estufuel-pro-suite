-- SCRIPT DE ESTRUCTURA SEGURO PARA ESTUFUEL PRO SUITE (V1.0)
-- Este script usa prefijos 'suite_' para evitar conflictos con tus otras apps.

-- 1. TABLA DE PROSPECTOS (SUITE)
CREATE TABLE IF NOT EXISTS suite_prospects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    origen TEXT DEFAULT 'Desconocido',
    estado TEXT DEFAULT 'Nuevo',
    notes TEXT,
    last_contact TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id)
);

-- 2. TABLA DE CLIENTES (SUITE)
CREATE TABLE IF NOT EXISTS suite_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    level TEXT DEFAULT 'Cliente',
    notes TEXT,
    user_id UUID REFERENCES auth.users(id)
);

-- 3. TABLA DE PRODUCTOS (SUITE)
CREATE TABLE IF NOT EXISTS suite_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sku TEXT UNIQUE,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    pv DECIMAL(10,2) DEFAULT 0,
    tax_type TEXT DEFAULT 'internal',
    category TEXT,
    user_id UUID REFERENCES auth.users(id)
);

-- 4. TABLA DE TRANSACCIONES (SUITE)
CREATE TABLE IF NOT EXISTS suite_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    date DATE DEFAULT CURRENT_DATE,
    type TEXT NOT NULL,
    customer_id UUID REFERENCES suite_customers(id) ON DELETE SET NULL,
    income DECIMAL(10,2) DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0,
    profit DECIMAL(10,2) DEFAULT 0,
    pv DECIMAL(10,2) DEFAULT 0,
    details JSONB,
    user_id UUID REFERENCES auth.users(id)
);

-- HABILITAR RLS
ALTER TABLE suite_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE suite_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suite_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suite_transactions ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE SEGURIDAD (Aislar datos por usuario)
CREATE POLICY "Users can only see their own suite_prospects" ON suite_prospects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own suite_customers" ON suite_customers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own suite_products" ON suite_products FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own suite_transactions" ON suite_transactions FOR ALL USING (auth.uid() = user_id);
