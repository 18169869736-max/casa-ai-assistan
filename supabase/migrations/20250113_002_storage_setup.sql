-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('original-images', 'original-images', false, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
    ('generated-designs', 'generated-designs', false, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
    ('example-photos', 'example-photos', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for original-images bucket
CREATE POLICY "Users can upload their own original images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'original-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own original images"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'original-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own original images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'original-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own original images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'original-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for generated-designs bucket
CREATE POLICY "Users can upload their own generated designs"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'generated-designs' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own generated designs"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'generated-designs' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own generated designs"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'generated-designs' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own generated designs"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'generated-designs' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for example-photos bucket (public read, admin write)
CREATE POLICY "Example photos are publicly readable"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'example-photos');

CREATE POLICY "Only authenticated users can upload example photos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'example-photos');

CREATE POLICY "Only authenticated users can update example photos"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'example-photos');

CREATE POLICY "Only authenticated users can delete example photos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'example-photos');
