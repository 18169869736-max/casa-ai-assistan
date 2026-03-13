-- Add room_image_url column to quiz_email_captures table
ALTER TABLE quiz_email_captures
ADD COLUMN IF NOT EXISTS room_image_url TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN quiz_email_captures.room_image_url IS 'URL of the uploaded room photo from Supabase Storage';
