-- OpenClaw Skill Shop - Storage Buckets Setup
-- Note: Run these commands in Supabase SQL Editor or via Management API

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Create skill-packages bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('skill-packages', 'skill-packages', false)
ON CONFLICT (id) DO NOTHING;

-- Create skill-assets bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('skill-assets', 'skill-assets', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES FOR skill-packages (private bucket)
-- ============================================================================

-- Authors can upload packages for their skills
CREATE POLICY "Authors can upload skill packages"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'skill-packages'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Authors can update their packages
CREATE POLICY "Authors can update skill packages"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'skill-packages'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users who purchased a skill can download the package
CREATE POLICY "Purchasers can download skill packages"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'skill-packages'
        AND (
            -- Author can download own packages
            auth.uid()::text = (storage.foldername(name))[1]
            OR
            -- Purchasers can download (check purchases table)
            EXISTS (
                SELECT 1 FROM purchases
                WHERE purchases.user_id = auth.uid()
                AND purchases.skill_id::text = (storage.foldername(name))[1]
            )
            OR
            -- Free skills - anyone can download
            EXISTS (
                SELECT 1 FROM skills
                WHERE skills.id::text = (storage.foldername(name))[1]
                AND skills.pricing_type = 'free'
                AND skills.status = 'published'
            )
            OR
            -- Admins can download any package
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
            )
        )
    );

-- ============================================================================
-- STORAGE POLICIES FOR skill-assets (public bucket)
-- ============================================================================

-- Anyone can view assets (public bucket)
CREATE POLICY "Anyone can view skill assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'skill-assets');

-- Authors can upload assets for their skills
CREATE POLICY "Authors can upload skill assets"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'skill-assets'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Authors can update their assets
CREATE POLICY "Authors can update skill assets"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'skill-assets'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Authors can delete their assets
CREATE POLICY "Authors can delete skill assets"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'skill-assets'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- ============================================================================
-- STORAGE PATH CONVENTION
-- ============================================================================

-- skill-packages bucket:
--   /{user_id}/{skill_id}/{version}.zip
--   Example: /550e8400-e29b-41d4-a716-446655440000/660e8400-e29b-41d4-a716-446655440001/1.0.0.zip

-- skill-assets bucket:
--   /{user_id}/{skill_id}/icon.png
--   /{user_id}/{skill_id}/screenshot-1.png
--   /{user_id}/{skill_id}/screenshot-2.png
--   Example: /550e8400-e29b-41d4-a716-446655440000/660e8400-e29b-41d4-a716-446655440001/icon.png
