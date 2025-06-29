# Database Setup Guide

## ✅ App Status: WORKING
The MilkMatrix mobile app is now fully functional with all Node.js compatibility issues resolved!

## Quick Test Setup

# Database Setup Guide

## ✅ App Status: WORKING
The MilkMatrix mobile app is now fully functional with all Node.js compatibility issues resolved!

## Complete Database Schema

To set up the comprehensive dairy farm management database, run the following SQL script in your Supabase SQL Editor:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create core tables for cattle management
CREATE TABLE cows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tag_number VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  breed VARCHAR NOT NULL,
  date_of_birth DATE NOT NULL,
  status VARCHAR NOT NULL,
  health_status VARCHAR NOT NULL,
  owner VARCHAR NOT NULL,
  last_health_check DATE,
  vaccination_status VARCHAR,
  alerts JSONB DEFAULT '[]'::jsonb,
  image_url VARCHAR,
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  initial_weight DECIMAL(10,2),
  current_weight DECIMAL(10,2),
  growth_rate DECIMAL(10,2),
  mother VARCHAR,
  father VARCHAR,
  birth_type VARCHAR DEFAULT 'Single',
  is_calf BOOLEAN DEFAULT false,
  transition_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create milk production table with quality parameters
CREATE TABLE milk_production (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  shift VARCHAR,
  quality VARCHAR,
  fat DECIMAL(4,2),
  protein DECIMAL(4,2),
  lactose DECIMAL(4,2),
  somatic_cell_count INTEGER,
  bacteria_count INTEGER,
  quality_grade VARCHAR,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create health events table
CREATE TABLE health_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
  event_type VARCHAR NOT NULL,
  event_date DATE NOT NULL,
  description TEXT NOT NULL,
  performed_by VARCHAR,
  medications JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  follow_up DATE,
  status VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create breeding events table
CREATE TABLE breeding_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  event_type VARCHAR NOT NULL,
  details TEXT,
  result VARCHAR,
  notes TEXT,
  performed_by VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reproductive status table
CREATE TABLE reproductive_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL,
  last_heat_date DATE,
  next_heat_date DATE,
  calving_count INTEGER DEFAULT 0,
  last_calving_date DATE,
  breeding_plan TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medications table
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR NOT NULL,
  expiration_date DATE,
  supplier VARCHAR,
  reorder_level INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vaccination schedule table
CREATE TABLE vaccination_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
  vaccination_type VARCHAR NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'Scheduled',
  assigned_to VARCHAR,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medication usage tracking
CREATE TABLE medication_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  health_event_id UUID REFERENCES health_events(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  used_by VARCHAR,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Employee',
  status TEXT NOT NULL DEFAULT 'Active',
  phone TEXT,
  address TEXT, 
  job_title TEXT,
  department TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  date_joined TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employees table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  job_title VARCHAR NOT NULL,
  department VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  address TEXT,
  date_joined DATE NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'Active',
  schedule VARCHAR NOT NULL DEFAULT 'Full-time',
  image_url VARCHAR DEFAULT '/api/placeholder/120/120',
  performance_rating DECIMAL(3, 1) DEFAULT 0,
  attendance_rate INTEGER DEFAULT 100,
  salary DECIMAL(10, 2) NOT NULL,
  skills JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  last_review_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create financial tables
CREATE TABLE financial_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month VARCHAR NOT NULL,
  year INTEGER NOT NULL,
  net_profit DECIMAL(10, 2) NOT NULL,
  revenue DECIMAL(10, 2) NOT NULL,
  expenses DECIMAL(10, 2) NOT NULL,
  cashflow DECIMAL(10, 2) NOT NULL,
  previous_net_profit DECIMAL(10, 2) NOT NULL,
  previous_revenue DECIMAL(10, 2) NOT NULL,
  previous_expenses DECIMAL(10, 2) NOT NULL,
  previous_cashflow DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month, year)
);

-- Create revenue tracking
CREATE TABLE revenue_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month VARCHAR NOT NULL,
  year INTEGER NOT NULL,
  income DECIMAL(10, 2) NOT NULL,
  expenses DECIMAL(10, 2) NOT NULL,
  profit DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(month, year)
);

-- Create inventory management tables
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'India',
  category VARCHAR(100),
  payment_terms VARCHAR(255),
  lead_time_days INTEGER,
  rating DECIMAL(3,2),
  website VARCHAR(255),
  last_order_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  department VARCHAR(50) CHECK (department IN ('feed', 'milking', 'equipment', 'health')) NOT NULL,
  current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  reorder_level DECIMAL(10,2) NOT NULL,
  supplier_id UUID,
  location VARCHAR(100),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- Create system settings and audit
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Create trigger function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_cows_updated_at
BEFORE UPDATE ON cows
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_revenue_data_updated_at
BEFORE UPDATE ON revenue_data
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

-- Create user signup trigger
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (
    id, 
    email,
    first_name,
    last_name,
    display_name,
    role,
    status
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    CONCAT(
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''), 
      ' ', 
      COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    ),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Employee'),
    'Active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Enable Row Level Security
ALTER TABLE cows ENABLE ROW LEVEL SECURITY;
ALTER TABLE milk_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE breeding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reproductive_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Enable access to all users" ON cows FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable access to all users" ON milk_production FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable access to all users" ON health_events FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable access to all users" ON breeding_events FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable access to all users" ON reproductive_status FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable access to all users" ON medications FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable access to all users" ON vaccination_schedule FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all authenticated users to view profiles" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable access to all users" ON employees FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable access to all users" ON financial_stats FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable access to all users" ON revenue_data FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable access to all users" ON suppliers FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable access to all users" ON inventory_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to view system settings" ON system_settings FOR SELECT USING (auth.role() = 'authenticated');

-- Create performance indexes
CREATE INDEX idx_milk_production_cow_id ON milk_production(cow_id);
CREATE INDEX idx_milk_production_date ON milk_production(date);
CREATE INDEX idx_health_events_cow_id ON health_events(cow_id);
CREATE INDEX idx_health_events_event_date ON health_events(event_date);
CREATE INDEX idx_health_events_status ON health_events(status);
CREATE INDEX idx_breeding_events_cow_id ON breeding_events(cow_id);
CREATE INDEX idx_breeding_events_date ON breeding_events(date);
CREATE INDEX idx_cows_tag_number ON cows(tag_number);
CREATE INDEX idx_cows_status ON cows(status);
CREATE INDEX idx_inventory_items_department ON inventory_items(department);
CREATE INDEX idx_revenue_data_year_month ON revenue_data(year, month);

-- Add unique constraint to prevent duplicate milk records for same cow, date, and shift
ALTER TABLE milk_production
  ADD CONSTRAINT unique_cow_date_shift UNIQUE (cow_id, date, shift);

-- Insert sample data for testing
INSERT INTO cows (tag_number, name, breed, date_of_birth, status, health_status, owner) VALUES
  ('001', 'Bessie', 'Holstein', '2020-03-15', 'Active', 'Healthy', 'Farm Owner'),
  ('002', 'Daisy', 'Jersey', '2019-08-22', 'Active', 'Healthy', 'Farm Owner'),
  ('003', 'Moo-nique', 'Guernsey', '2021-01-10', 'Active', 'Healthy', 'Farm Owner');

-- Insert initial system settings
INSERT INTO system_settings (key, value) VALUES 
('general', '{"farmName":"Pranavika Dairy Farms Pvt Ltd","address":"Pollachi","phone":"(555) 123-4567","email":"contact@greenmeadowsdairy.com","timezone":"America/Los_Angeles","dateFormat":"MM/DD/YYYY","language":"en-US"}'::jsonb),
('notifications', '{"emailNotifications":true,"pushNotifications":true,"smsNotifications":false,"lowInventoryAlerts":true,"healthAlerts":true,"milkProductionReports":true,"financialReports":true}'::jsonb);
```

## Quick Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your Project URL and API Key from Project Settings > API

### 2. Run Database Schema
1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the complete SQL script above
3. Execute the script to create all tables and relationships

### 3. Configure Environment Variables
Copy your Supabase credentials to `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Create Test User
1. Go to Authentication > Users in your Supabase dashboard
2. Create a new user with email and password
3. Use these credentials to log into the mobile app

### 5. Test QR Codes
For testing QR scanning, create QR codes with cattle tag numbers (001, 002, 003) using any online QR code generator.

## Features to Test

1. **Login** - Use the test user credentials
2. **Dashboard** - View recent records and statistics  
3. **QR Scanning** - Scan QR codes with cattle tag numbers
4. **Record Milk** - Add milk production data with quality parameters
5. **Record Health** - Add health events and treatments
6. **View Records** - Browse historical data and analytics

The comprehensive database schema supports full dairy farm management including cattle tracking, milk production monitoring, health management, financial tracking, employee management, inventory control, and system administration.
