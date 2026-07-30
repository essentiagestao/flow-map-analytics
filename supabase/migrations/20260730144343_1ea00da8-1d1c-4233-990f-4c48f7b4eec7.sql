DROP POLICY IF EXISTS "board_v1_storage_update" ON storage.objects;
CREATE POLICY "board_v1_storage_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'board-v1-assets' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'board-v1-assets' AND (auth.uid())::text = (storage.foldername(name))[1]);