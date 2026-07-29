-- Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table (kept in sync with auth.users via trigger in Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  gender text,
  role text,
  phone text,
  avatar_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- If the on_auth_user_created trigger doesn't exist on the project, create a simple helper
-- (Supabase projects typically add their own trigger; keep this safe to run)
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, created_at)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'role', now())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_created();

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  gender text,
  city text,
  address text,
  state text,
  pincode text,
  avatar_url text,
  status text DEFAULT 'active',
  tier text,
  risk_score integer DEFAULT 0,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Policy types
CREATE TABLE IF NOT EXISTS policy_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true
);

-- Policies
CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  policy_type_id uuid REFERENCES policy_types(id) ON DELETE SET NULL,
  agent_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  plan_name text,
  premium_amount numeric(12,2),
  coverage_amount numeric(12,2),
  start_date date,
  end_date date,
  premium_frequency text DEFAULT 'monthly',
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Claims
CREATE TABLE IF NOT EXISTS claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number text UNIQUE NOT NULL,
  policy_id uuid REFERENCES policies(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  claim_amount numeric(12,2),
  claim_type text,
  status text DEFAULT 'Pending',
  priority text DEFAULT 'Medium',
  description text,
  submission_date timestamp with time zone DEFAULT now(),
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Premium payments
CREATE TABLE IF NOT EXISTS premium_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  policy_id uuid REFERENCES policies(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  amount numeric(12,2),
  payment_method text,
  due_date date,
  paid_date date,
  payment_status text DEFAULT 'Pending',
  created_at timestamp with time zone DEFAULT now()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  size bigint,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  status text DEFAULT 'active',
  file_path text,
  file_name text,
  file_type text,
  policy_id uuid REFERENCES policies(id) ON DELETE SET NULL,
  uploaded_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text,
  message text,
  type text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  user_name text,
  user_role text,
  action text,
  details jsonb,
  ip_address text,
  category text,
  created_at timestamp with time zone DEFAULT now()
);

-- Agents are managed separately from authentication. A future profile can be
-- linked using profile_id when that agent accepts an invitation.
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE REFERENCES profiles(id) ON DELETE SET NULL,
  employee_code text UNIQUE NOT NULL,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text,
  designation text,
  avatar_url text,
  assigned_customers integer DEFAULT 0,
  active_policies integer DEFAULT 0,
  claim_resolution_rate text DEFAULT '0%',
  revenue_generated text DEFAULT '$0',
  status text DEFAULT 'Active',
  created_at timestamp with time zone DEFAULT now()
);

-- Compatibility upgrades for projects where an earlier draft of this script
-- was already run. These statements preserve existing records.
ALTER TABLE customers ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS pincode text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS premium_frequency text DEFAULT 'monthly';
ALTER TABLE claims ADD COLUMN IF NOT EXISTS claim_amount numeric(12,2);
ALTER TABLE claims ADD COLUMN IF NOT EXISTS claim_type text;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS submission_date timestamp with time zone DEFAULT now();
ALTER TABLE claims ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;
ALTER TABLE premium_payments ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'Pending';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS policy_id uuid REFERENCES policies(id) ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_name text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_type text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS uploaded_at timestamp with time zone DEFAULT now();

-- Enable RLS for tables that require it
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS premium_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON profiles;
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (id = auth.uid());
DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- RLS helper: get role of current user from profiles
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql STABLE;

-- Basic policies:
-- Admins: full access
-- Agents: limited access to resources they created or assigned
-- Customers: limited read access to their own policies/claims/payments

-- Customers policies
DROP POLICY IF EXISTS customers_select_admin ON customers;
CREATE POLICY customers_select_admin ON customers FOR SELECT USING (
  public.current_user_role() = 'Admin'
);
DROP POLICY IF EXISTS customers_select_agent ON customers;
CREATE POLICY customers_select_agent ON customers FOR SELECT USING (
  public.current_user_role() = 'Insurance Agent' AND created_by = auth.uid()
);
DROP POLICY IF EXISTS customers_insert_agent ON customers;
CREATE POLICY customers_insert_agent ON customers FOR INSERT WITH CHECK (
  public.current_user_role() = 'Insurance Agent' OR public.current_user_role() = 'Admin'
);
DROP POLICY IF EXISTS customers_update_agent ON customers;
CREATE POLICY customers_update_agent ON customers FOR UPDATE USING (
  public.current_user_role() = 'Admin' OR (public.current_user_role() = 'Insurance Agent' AND created_by = auth.uid())
);

-- Policies policies
DROP POLICY IF EXISTS policies_select_admin ON policies;
CREATE POLICY policies_select_admin ON policies FOR SELECT USING (
  public.current_user_role() = 'Admin'
);
DROP POLICY IF EXISTS policies_select_agent ON policies;
CREATE POLICY policies_select_agent ON policies FOR SELECT USING (
  public.current_user_role() = 'Insurance Agent' AND agent_id = auth.uid()
);
DROP POLICY IF EXISTS policies_select_customer ON policies;
CREATE POLICY policies_select_customer ON policies FOR SELECT USING (
  public.current_user_role() = 'Customer' AND customer_id IN (SELECT id FROM customers WHERE email = (SELECT email FROM public.profiles WHERE id = auth.uid()))
);
DROP POLICY IF EXISTS policies_insert_agent ON policies;
CREATE POLICY policies_insert_agent ON policies FOR INSERT WITH CHECK (
  public.current_user_role() IN ('Insurance Agent','Admin')
);
DROP POLICY IF EXISTS policies_update_agent ON policies;
CREATE POLICY policies_update_agent ON policies FOR UPDATE USING (
  public.current_user_role() = 'Admin' OR (public.current_user_role() = 'Insurance Agent' AND agent_id = auth.uid())
);

-- Claims policies
DROP POLICY IF EXISTS claims_select_admin ON claims;
CREATE POLICY claims_select_admin ON claims FOR SELECT USING (
  public.current_user_role() = 'Admin'
);
DROP POLICY IF EXISTS claims_select_agent ON claims;
CREATE POLICY claims_select_agent ON claims FOR SELECT USING (
  public.current_user_role() = 'Insurance Agent' AND EXISTS (SELECT 1 FROM policies p WHERE p.id = claims.policy_id AND p.agent_id = auth.uid())
);
DROP POLICY IF EXISTS claims_select_customer ON claims;
CREATE POLICY claims_select_customer ON claims FOR SELECT USING (
  public.current_user_role() = 'Customer' AND customer_id = (SELECT id FROM customers WHERE email = (SELECT email FROM public.profiles WHERE id = auth.uid()))
);
DROP POLICY IF EXISTS claims_insert_customer ON claims;
CREATE POLICY claims_insert_customer ON claims FOR INSERT WITH CHECK (
  public.current_user_role() IN ('Customer','Insurance Agent','Admin')
);

-- Payments policies
DROP POLICY IF EXISTS payments_select_admin ON premium_payments;
CREATE POLICY payments_select_admin ON premium_payments FOR SELECT USING (
  public.current_user_role() = 'Admin'
);
DROP POLICY IF EXISTS payments_select_customer ON premium_payments;
CREATE POLICY payments_select_customer ON premium_payments FOR SELECT USING (
  public.current_user_role() = 'Customer' AND customer_id = (SELECT id FROM customers WHERE email = (SELECT email FROM public.profiles WHERE id = auth.uid()))
);

-- Documents
DROP POLICY IF EXISTS documents_select_admin ON documents;
CREATE POLICY documents_select_admin ON documents FOR SELECT USING (
  public.current_user_role() = 'Admin'
);
DROP POLICY IF EXISTS documents_select_owner ON documents;
CREATE POLICY documents_select_owner ON documents FOR SELECT USING (
  uploaded_by = auth.uid() OR customer_id IN (SELECT id FROM customers WHERE email = (SELECT email FROM public.profiles WHERE id = auth.uid()))
);

-- Notifications
DROP POLICY IF EXISTS notifications_select_own ON notifications;
CREATE POLICY notifications_select_own ON notifications FOR SELECT USING (
  user_id = auth.uid() OR public.current_user_role() = 'Admin'
);

-- Audit logs: read-only, admins can read, agents can read but not write
DROP POLICY IF EXISTS audit_logs_select_admin ON audit_logs;
CREATE POLICY audit_logs_select_admin ON audit_logs FOR SELECT USING (
  public.current_user_role() = 'Admin' OR public.current_user_role() = 'Insurance Agent'
);

-- Update timestamps on modified rows automatically
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach update triggers
DROP TRIGGER IF EXISTS set_timestamp_customers ON customers;
CREATE TRIGGER set_timestamp_customers BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_policies ON policies;
CREATE TRIGGER set_timestamp_policies BEFORE UPDATE ON policies FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_claims ON claims;
CREATE TRIGGER set_timestamp_claims BEFORE UPDATE ON claims FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- ============================================================
-- Claims Workflow Migration v2 (Claim Review Workflow)
-- Applied: 2026-07-29 — Run in Supabase SQL Editor if not done
-- ============================================================

-- Ensure claims workflow columns exist
ALTER TABLE claims ADD COLUMN IF NOT EXISTS agent_id uuid REFERENCES agents(id) ON DELETE SET NULL;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS review_comment text;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS reason text;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
-- Ensure FK constraint exists (needed for Supabase PostgREST joins)
ALTER TABLE claims DROP CONSTRAINT IF EXISTS claims_agent_id_fkey;
ALTER TABLE claims ADD CONSTRAINT claims_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL;

-- Helper: current user role lookup
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Drop any permissive blanket policies on claims
DROP POLICY IF EXISTS allow_auth_select ON claims;
DROP POLICY IF EXISTS allow_auth_insert ON claims;
DROP POLICY IF EXISTS allow_auth_update ON claims;
DROP POLICY IF EXISTS claims_select_admin ON claims;
DROP POLICY IF EXISTS claims_select_agent ON claims;
DROP POLICY IF EXISTS claims_select_customer ON claims;
DROP POLICY IF EXISTS claims_insert_customer ON claims;
DROP POLICY IF EXISTS claims_update_admin ON claims;
DROP POLICY IF EXISTS claims_update_agent ON claims;

ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Admin: full access
CREATE POLICY claims_select_admin ON claims
  FOR SELECT USING (public.current_user_role() = 'Admin');

-- Agent: only see claims assigned to them (agents.user_id = auth.uid())
CREATE POLICY claims_select_agent ON claims
  FOR SELECT USING (
    public.current_user_role() = 'Insurance Agent'
    AND agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid())
  );

-- Customer: only their own claims
CREATE POLICY claims_select_customer ON claims
  FOR SELECT USING (
    public.current_user_role() = 'Customer'
    AND customer_id IN (
      SELECT id FROM public.customers
      WHERE email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    )
  );

-- INSERT: customers, agents, and admins may create claims
CREATE POLICY claims_insert_customer ON claims
  FOR INSERT WITH CHECK (
    public.current_user_role() IN ('Customer', 'Insurance Agent', 'Admin')
  );

-- UPDATE: Admin can update any claim; agents can only update their assigned claims
CREATE POLICY claims_update_admin ON claims
  FOR UPDATE USING (public.current_user_role() = 'Admin');

CREATE POLICY claims_update_agent ON claims
  FOR UPDATE USING (
    public.current_user_role() = 'Insurance Agent'
    AND agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid())
  );
-- NOTE: No UPDATE policy for 'Customer' role — denied by RLS + enforced at backend level

