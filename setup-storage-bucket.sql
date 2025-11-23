-- 创建question-images存储桶用于存储题目图片
-- 在Supabase Dashboard的SQL Editor中运行此脚本

-- 1. 创建存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'question-images',
  'question-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. 设置存储桶的公开访问策略
-- 允许所有人读取
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'question-images');

-- 允许所有人上传（可选，如果需要限制可以删除此策略）
CREATE POLICY "Public Upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'question-images');

-- 允许所有人更新（可选）
CREATE POLICY "Public Update" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'question-images')
  WITH CHECK (bucket_id = 'question-images');

-- 3. 验证创建结果
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'question-images';
