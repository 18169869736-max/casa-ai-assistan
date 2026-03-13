-- Seed data for example photos
-- Note: Update the image URLs with actual Supabase Storage URLs after uploading images

INSERT INTO public.example_photos (category, title, tagline, before_image_url, after_image_url, display_order, is_active)
VALUES
    ('living_room', 'Living Room', 'Transform your living space', 'https://placeholder.com/before-living-room.jpg', 'https://placeholder.com/after-living-room.jpg', 1, true),
    ('kitchen', 'Kitchen', 'Modernize your cooking space', 'https://placeholder.com/before-kitchen.jpg', 'https://placeholder.com/after-kitchen.jpg', 2, true),
    ('bedroom', 'Bedroom', 'Create your dream sanctuary', 'https://placeholder.com/before-bedroom.jpg', 'https://placeholder.com/after-bedroom.jpg', 3, true),
    ('home_office', 'Home Office', 'Design a productive workspace', 'https://placeholder.com/before-office.jpg', 'https://placeholder.com/after-office.jpg', 4, true),
    ('bathroom', 'Bathroom', 'Refresh your bathroom style', 'https://placeholder.com/before-bathroom.jpg', 'https://placeholder.com/after-bathroom.jpg', 5, true),
    ('dining_room', 'Dining Room', 'Elevate your dining experience', 'https://placeholder.com/before-dining.jpg', 'https://placeholder.com/after-dining.jpg', 6, true)
ON CONFLICT DO NOTHING;
