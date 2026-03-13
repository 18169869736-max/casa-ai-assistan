-- Create the quiz-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('quiz-images', 'quiz-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public uploads to quiz-images bucket
CREATE POLICY "Public Upload Access"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'quiz-images');

-- Policy to allow public reads from quiz-images bucket
CREATE POLICY "Public Read Access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'quiz-images');

-- Policy to allow users to delete their own uploads (optional)
CREATE POLICY "Users can delete own uploads"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'quiz-images');
