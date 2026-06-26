DROP POLICY IF EXISTS "Authenticated users can upload post images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload post-images" ON storage.objects;
DROP POLICY IF EXISTS "Auth users upload post-images" ON storage.objects;

CREATE POLICY "Editors/admins can upload post-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'post-images'
  AND private.is_editor_or_admin(auth.uid())
);

CREATE POLICY "Editors/admins can update post-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'post-images' AND private.is_editor_or_admin(auth.uid()))
WITH CHECK (bucket_id = 'post-images' AND private.is_editor_or_admin(auth.uid()));

CREATE POLICY "Editors/admins can delete post-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'post-images' AND private.is_editor_or_admin(auth.uid()));