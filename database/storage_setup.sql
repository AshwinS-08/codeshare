-- ========================================
-- Storage Bucket Setup
-- ========================================

-- Create storage bucket for shared files
-- Note: This needs to be created via Supabase Dashboard or API
-- Bucket name: shared-files
-- Public access: Yes (for direct file access)

-- Storage policies for the shared-files bucket
CREATE POLICY "Allow public read access to shared files"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'shared-files'
    AND (storage.foldername(name))[1] ~ '^[A-Z0-9]{6}-\d+\.' -- Match pattern: ABCDEFG-123456.ext
);

CREATE POLICY "Allow service role to upload files"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'shared-files'
    AND auth.role() = 'service_role'
);

CREATE POLICY "Allow service role to update files"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'shared-files'
    AND auth.role() = 'service_role'
);

CREATE POLICY "Allow service role to delete files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'shared-files'
    AND auth.role() = 'service_role'
);
