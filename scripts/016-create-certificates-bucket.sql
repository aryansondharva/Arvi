-- Create storage bucket for certificates
-- This script sets up the necessary storage policies for certificate uploads

-- Create the certificates bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificates',
  'certificates',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create policy for users to upload their own certificates
CREATE POLICY "Users can upload their own certificates"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'certificates' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create policy for users to update their own certificates
CREATE POLICY "Users can update their own certificates"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'certificates' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create policy for users to view their own certificates
CREATE POLICY "Users can view their own certificates"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'certificates' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create policy for public access to certificates (for sharing)
CREATE POLICY "Certificates are publicly viewable"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'certificates'
  );

-- Grant necessary permissions
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;
