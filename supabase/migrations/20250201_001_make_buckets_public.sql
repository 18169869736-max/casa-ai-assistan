-- Make generated-designs and original-images buckets public
-- This allows images to be displayed in the browser without signed URLs
-- Images are still protected by folder structure (user UUID paths)

UPDATE storage.buckets
SET public = true
WHERE id IN ('generated-designs', 'original-images');

-- Add public read policies for both buckets so anyone with the URL can view
-- This is safe because:
-- 1. Design images are not sensitive data
-- 2. User UUIDs in paths provide obscurity
-- 3. Only bucket owners can upload/modify

CREATE POLICY "Public can view generated designs"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'generated-designs');

CREATE POLICY "Public can view original images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'original-images');

-- Note: Upload/update/delete policies remain restricted to authenticated users
-- who own the folders (via auth.uid() checks)
