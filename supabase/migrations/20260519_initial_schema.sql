-- OpenClaw Skill Shop - Initial Schema
-- This migration creates all required tables, enums, indexes, constraints, triggers, and RLS policies

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User role enum
CREATE TYPE user_role AS ENUM ('user', 'author', 'admin');

-- Skill status enum
CREATE TYPE skill_status AS ENUM ('draft', 'pending_review', 'published', 'rejected', 'suspended', 'archived');

-- Pricing type enum
CREATE TYPE pricing_type AS ENUM ('free', 'paid');

-- Order status enum
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'cancelled', 'refunded', 'failed');

-- Skill version status enum
CREATE TYPE skill_version_status AS ENUM ('draft', 'active', 'deprecated', 'blocked');

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_enabled ON categories(enabled);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Categories are viewable by everyone when enabled"
    ON categories FOR SELECT
    USING (enabled = true);

CREATE POLICY "Admins can manage categories"
    ON categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ============================================================================
-- SKILLS TABLE
-- ============================================================================

CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    description TEXT,
    icon_url TEXT,
    status skill_status NOT NULL DEFAULT 'draft',
    pricing_type pricing_type NOT NULL DEFAULT 'free',
    price_cents INTEGER DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    tags TEXT[] DEFAULT '{}',
    rating_avg REAL DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    install_count INTEGER DEFAULT 0,
    purchase_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_skills_author_id ON skills(author_id);
CREATE INDEX idx_skills_category_id ON skills(category_id);
CREATE INDEX idx_skills_slug ON skills(slug);
CREATE INDEX idx_skills_status ON skills(status);
CREATE INDEX idx_skills_pricing_type ON skills(pricing_type);
CREATE INDEX idx_skills_created_at ON skills(created_at DESC);
CREATE INDEX idx_skills_rating_avg ON skills(rating_avg DESC);
CREATE INDEX idx_skills_install_count ON skills(install_count DESC);
CREATE INDEX idx_skills_purchase_count ON skills(purchase_count DESC);
-- GIN index for tags array
CREATE INDEX idx_skills_tags ON skills USING GIN(tags);

-- Trigger for updated_at
CREATE TRIGGER set_skills_updated_at
    BEFORE UPDATE ON skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Published skills are viewable by everyone"
    ON skills FOR SELECT
    USING (status = 'published');

CREATE POLICY "Authors can view own skills"
    ON skills FOR SELECT
    USING (auth.uid() = author_id);

CREATE POLICY "Admins can view all skills"
    ON skills FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Authenticated users can create skills"
    ON skills FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own skills"
    ON skills FOR UPDATE
    USING (auth.uid() = author_id);

CREATE POLICY "Admins can update all skills"
    ON skills FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Authors can delete own drafts"
    ON skills FOR DELETE
    USING (auth.uid() = author_id AND status = 'draft');

CREATE POLICY "Admins can delete any skill"
    ON skills FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ============================================================================
-- SKILL_VERSIONS TABLE
-- ============================================================================

CREATE TABLE skill_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    manifest JSONB NOT NULL,
    changelog TEXT,
    package_path TEXT,
    checksum TEXT,
    package_size INTEGER,
    status skill_version_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_skill_versions_skill_id ON skill_versions(skill_id);
CREATE INDEX idx_skill_versions_version ON skill_versions(version);
CREATE INDEX idx_skill_versions_status ON skill_versions(status);
CREATE UNIQUE INDEX idx_skill_versions_skill_version ON skill_versions(skill_id, version);

-- RLS
ALTER TABLE skill_versions ENABLE ROW LEVEL SECURITY;

-- Policies - inherit from skills visibility
CREATE POLICY "Skill versions viewable when skill is published"
    ON skill_versions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM skills
            WHERE skills.id = skill_versions.skill_id
            AND (skills.status = 'published' OR skills.author_id = auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Authors can create versions for own skills"
    ON skill_versions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM skills
            WHERE skills.id = skill_versions.skill_id
            AND skills.author_id = auth.uid()
        )
    );

CREATE POLICY "Authors can update own skill versions"
    ON skill_versions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM skills
            WHERE skills.id = skill_versions.skill_id
            AND skills.author_id = auth.uid()
        )
    );

CREATE POLICY "Admins can update any version"
    ON skill_versions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status order_status NOT NULL DEFAULT 'pending',
    payment_provider TEXT,
    payment_ref TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_skill_id ON orders(skill_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can create orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update orders (service role)"
    ON orders FOR UPDATE
    USING (true);

-- ============================================================================
-- PURCHASES TABLE
-- ============================================================================

CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, skill_id)
);

-- Indexes
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_skill_id ON purchases(skill_id);
CREATE INDEX idx_purchases_order_id ON purchases(order_id);

-- RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own purchases"
    ON purchases FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases"
    ON purchases FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "System can insert purchases"
    ON purchases FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, skill_id)
);

-- Indexes
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_skill_id ON reviews(skill_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Trigger for updated_at
CREATE TRIGGER set_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Reviews are viewable by everyone"
    ON reviews FOR SELECT
    USING (true);

CREATE POLICY "Users can create reviews for purchased/installed skills"
    ON reviews FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND (
            EXISTS (SELECT 1 FROM purchases WHERE purchases.user_id = auth.uid() AND purchases.skill_id = reviews.skill_id)
            OR EXISTS (SELECT 1 FROM installs WHERE installs.user_id = auth.uid() AND installs.skill_id = reviews.skill_id)
        )
    );

CREATE POLICY "Users can update own reviews"
    ON reviews FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
    ON reviews FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any review"
    ON reviews FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ============================================================================
-- FAVORITES TABLE
-- ============================================================================

CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, skill_id)
);

-- Indexes
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_skill_id ON favorites(skill_id);

-- RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own favorites"
    ON favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create favorites"
    ON favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
    ON favorites FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- INSTALLS TABLE
-- ============================================================================

CREATE TABLE installs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    version_id UUID REFERENCES skill_versions(id) ON DELETE SET NULL,
    client_version TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_installs_user_id ON installs(user_id);
CREATE INDEX idx_installs_skill_id ON installs(skill_id);
CREATE INDEX idx_installs_version_id ON installs(version_id);

-- RLS
ALTER TABLE installs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own installs"
    ON installs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create installs for accessible skills"
    ON installs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all installs"
    ON installs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ============================================================================
-- AUDIT_LOGS TABLE
-- ============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_target_type ON audit_logs(target_type);
CREATE INDEX idx_audit_logs_target_id ON audit_logs(target_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies - only admins can view
CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update skill rating stats after review insert/update/delete
CREATE OR REPLACE FUNCTION update_skill_rating()
RETURNS TRIGGER AS $$
DECLARE
    skill_uuid UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        skill_uuid := OLD.skill_id;
    ELSE
        skill_uuid := NEW.skill_id;
    END IF;

    UPDATE skills
    SET rating_avg = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE skill_id = skill_uuid
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE skill_id = skill_uuid
        )
    WHERE id = skill_uuid;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_skill_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_skill_rating();

-- Function to update skill install_count
CREATE OR REPLACE FUNCTION update_skill_install_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE skills
    SET install_count = (
            SELECT COUNT(*)
            FROM installs
            WHERE skill_id = NEW.skill_id
        )
    WHERE id = NEW.skill_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_skill_install_count_trigger
    AFTER INSERT ON installs
    FOR EACH ROW
    EXECUTE FUNCTION update_skill_install_count();

-- Function to update skill purchase_count
CREATE OR REPLACE FUNCTION update_skill_purchase_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE skills
    SET purchase_count = (
            SELECT COUNT(*)
            FROM purchases
            WHERE skill_id = NEW.skill_id
        )
    WHERE id = NEW.skill_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_skill_purchase_count_trigger
    AFTER INSERT ON purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_skill_purchase_count();

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Note: Storage buckets are created via Supabase Dashboard or Management API
-- These are placeholder statements for documentation purposes

-- skill-packages bucket: stores skill zip packages
-- skill-assets bucket: stores skill icons and screenshots

-- Bucket policies will be configured in Supabase Dashboard:
-- skill-packages: private bucket, access via signed URLs only
-- skill-assets: public bucket for icons and screenshots

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default categories
INSERT INTO categories (name, slug, description, sort_order, enabled) VALUES
    ('Productivity', 'productivity', 'Tools to boost your productivity', 1, true),
    ('Development', 'development', 'Development and coding tools', 2, true),
    ('Communication', 'communication', 'Communication and collaboration tools', 3, true),
    ('Data Analysis', 'data-analysis', 'Data processing and analysis tools', 4, true),
    ('Automation', 'automation', 'Automation and workflow tools', 5, true),
    ('AI & Machine Learning', 'ai-ml', 'AI and machine learning powered tools', 6, true),
    ('Utilities', 'utilities', 'General utility tools', 7, true),
    ('Other', 'other', 'Other skills', 99, true);

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant necessary permissions to authenticated and anon roles
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Profiles
GRANT SELECT ON profiles TO authenticated, anon;
GRANT INSERT, UPDATE ON profiles TO authenticated;

-- Categories
GRANT SELECT ON categories TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON categories TO authenticated;

-- Skills
GRANT SELECT ON skills TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON skills TO authenticated;

-- Skill versions
GRANT SELECT ON skill_versions TO authenticated, anon;
GRANT INSERT, UPDATE ON skill_versions TO authenticated;

-- Orders
GRANT SELECT ON orders TO authenticated;
GRANT INSERT ON orders TO authenticated;

-- Purchases
GRANT SELECT ON purchases TO authenticated;
GRANT INSERT ON purchases TO authenticated;

-- Reviews
GRANT SELECT ON reviews TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON reviews TO authenticated;

-- Favorites
GRANT SELECT ON favorites TO authenticated;
GRANT INSERT, DELETE ON favorites TO authenticated;

-- Installs
GRANT SELECT ON installs TO authenticated;
GRANT INSERT ON installs TO authenticated;

-- Audit logs
GRANT SELECT ON audit_logs TO authenticated;
GRANT INSERT ON audit_logs TO authenticated;
