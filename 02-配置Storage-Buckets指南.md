# 📦 Supabase Storage Buckets 配置指南

## 🎯 目标

配置文件存储系统，用于存储：
- PDF学习资料
- 用户头像
- 机构Logo
- PDF缩略图

---

## 🚀 快速配置（按步骤操作）

### 第1步：访问 Storage 页面

1. **打开 Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/tparjdkxxtnentsdazfw
   ```

2. **点击左侧菜单 "Storage"**

3. **你会看到 Storage 管理界面**

---

### 第2步：创建 PDF 资源 Bucket

#### 2.1 创建 Bucket

1. 点击右上角 **"New bucket"** 按钮

2. 填写信息：
   ```
   Name: pdfs
   Public bucket: ✓ 勾选（允许公开访问）
   File size limit: 50 MB（可选，限制单个文件大小）
   Allowed MIME types: application/pdf（可选，只允许PDF）
   ```

3. 点击 **"Create bucket"**

#### 2.2 创建文件夹结构

在 `pdfs` bucket 中创建子文件夹：

1. 进入 `pdfs` bucket

2. 点击 **"Upload file"** 旁边的 **"Create folder"**

3. 创建以下文件夹：
   - `chapters/` - 章节内容PDF
   - `highlights/` - 高频考点PDF
   - `outlines/` - 考试大纲PDF
   - `predictions/` - 押题卷解析PDF
   - `thumbnails/` - PDF缩略图

---

### 第3步：创建用户头像 Bucket

1. 点击 **"New bucket"**

2. 填写信息：
   ```
   Name: avatars
   Public bucket: ✓ 勾选
   File size limit: 5 MB
   Allowed MIME types: image/jpeg, image/png, image/webp
   ```

3. 点击 **"Create bucket"**

---

### 第4步：创建机构 Logo Bucket

1. 点击 **"New bucket"**

2. 填写信息：
   ```
   Name: institution-logos
   Public bucket: ✓ 勾选
   File size limit: 2 MB
   Allowed MIME types: image/jpeg, image/png, image/svg+xml
   ```

3. 点击 **"Create bucket"**

---

### 第5步：配置 Bucket 策略（重要！）

为了让用户可以访问和上传文件，需要配置 RLS 策略。

#### 5.1 pdfs Bucket 策略

在 `pdfs` bucket 页面：

1. 点击右侧的 **"Policies"** 标签

2. 点击 **"New policy"**

3. **策略1：允许所有人读取PDF**
   ```
   Policy name: Public read access
   Policy definition: SELECT
   Target roles: public
   
   使用以下SQL：
   CREATE POLICY "Public read access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'pdfs');
   ```

4. **策略2：允许认证用户上传PDF**
   ```
   Policy name: Authenticated users can upload
   Policy definition: INSERT
   Target roles: authenticated
   
   使用以下SQL：
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'pdfs' AND auth.role() = 'authenticated');
   ```

#### 5.2 avatars Bucket 策略

1. **允许用户上传和更新自己的头像**
   ```sql
   CREATE POLICY "Users can upload own avatar"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'avatars' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   
   CREATE POLICY "Users can update own avatar"
   ON storage.objects FOR UPDATE
   USING (
     bucket_id = 'avatars' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   
   CREATE POLICY "Anyone can view avatars"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'avatars');
   ```

#### 5.3 institution-logos Bucket 策略

1. **允许管理员上传，所有人查看**
   ```sql
   CREATE POLICY "Public read access to logos"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'institution-logos');
   
   CREATE POLICY "Authenticated can upload logos"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'institution-logos' 
     AND auth.role() = 'authenticated'
   );
   ```

---

## 📝 使用 SQL 批量配置

如果你想一次性配置所有策略，可以在 **SQL Editor** 中运行：

```sql
-- ========================================
-- Storage Buckets RLS 策略配置
-- ========================================

-- 1. pdfs bucket 策略
CREATE POLICY "Public read pdfs"
ON storage.objects FOR SELECT
USING (bucket_id = 'pdfs');

CREATE POLICY "Authenticated upload pdfs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pdfs' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated update pdfs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'pdfs' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated delete pdfs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'pdfs' 
  AND auth.role() = 'authenticated'
);

-- 2. avatars bucket 策略
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. institution-logos bucket 策略
CREATE POLICY "Public read logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'institution-logos');

CREATE POLICY "Authenticated upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'institution-logos' 
  AND auth.role() = 'authenticated'
);

-- 验证策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
ORDER BY policyname;
```

---

## 🧪 测试 Storage 配置

### 方法1：在 Dashboard 中测试上传

1. **进入 pdfs bucket**
2. **点击 "Upload file"**
3. **选择一个PDF文件上传**
4. **上传成功后，点击文件查看详情**
5. **复制 "Public URL"**
6. **在浏览器中访问URL，验证可以访问**

### 方法2：使用代码测试

创建测试文件 `test-storage.ts`：

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tparjdkxxtnentsdazfw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // anon key

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorage() {
  console.log('🧪 测试 Storage 配置...\n');
  
  // 1. 列出所有 buckets
  const { data: buckets, error: bucketsError } = await supabase
    .storage
    .listBuckets();
  
  if (bucketsError) {
    console.error('❌ 获取 buckets 失败:', bucketsError);
    return;
  }
  
  console.log('✅ Buckets 列表:');
  buckets.forEach(bucket => {
    console.log(`   - ${bucket.name} (${bucket.public ? '公开' : '私有'})`);
  });
  console.log('');
  
  // 2. 列出 pdfs bucket 中的文件
  const { data: files, error: filesError } = await supabase
    .storage
    .from('pdfs')
    .list();
  
  if (filesError) {
    console.error('❌ 列出文件失败:', filesError);
    return;
  }
  
  console.log(`✅ pdfs bucket 中有 ${files.length} 个文件/文件夹\n`);
  
  // 3. 测试获取公开URL
  if (files.length > 0) {
    const { data } = supabase
      .storage
      .from('pdfs')
      .getPublicUrl(files[0].name);
    
    console.log('✅ 示例文件 URL:');
    console.log(`   ${data.publicUrl}\n`);
  }
  
  console.log('✅ Storage 配置测试完成！');
}

testStorage();
```

---

## 📁 文件路径规范

### PDF资源路径格式

```
pdfs/
├── chapters/
│   ├── {exam_type}/
│   │   ├── {subject}/
│   │   │   └── chapter-{number}.pdf
├── highlights/
│   ├── {year}/
│   │   └── {subject}-highlights.pdf
├── outlines/
│   └── {year}/
│       └── {exam_type}-outline.pdf
└── predictions/
    └── {institution_id}/
        └── {year}-{subject}.pdf
```

### 示例路径

```
pdfs/chapters/执业药师/中药学综合知识与技能/chapter-1.pdf
pdfs/highlights/2024/中药学综合知识与技能-highlights.pdf
pdfs/outlines/2024/执业药师-outline.pdf
pdfs/predictions/inst_001/2024-中药药综.pdf
```

### 头像路径格式

```
avatars/{user_id}/{filename}

例如：
avatars/550e8400-e29b-41d4-a716-446655440000/avatar.jpg
```

### Logo路径格式

```
institution-logos/{institution_id}/{filename}

例如：
institution-logos/inst_huatu/logo.png
```

---

## 🔐 安全最佳实践

### 1. 文件大小限制

在创建bucket时设置合理的文件大小限制：
- PDF: 50 MB
- 头像: 5 MB
- Logo: 2 MB

### 2. MIME类型限制

限制允许的文件类型，防止恶意文件上传：
- PDF bucket: `application/pdf`
- 头像: `image/jpeg, image/png, image/webp`
- Logo: `image/jpeg, image/png, image/svg+xml`

### 3. RLS策略

- 公开资料（PDF、Logo）：允许所有人读取
- 个人资料（头像）：只允许用户管理自己的文件
- 敏感资料：需要认证才能访问

### 4. 定期清理

设置生命周期规则，定期清理未使用的文件：
```sql
-- 删除30天前的临时文件
DELETE FROM storage.objects
WHERE bucket_id = 'pdfs'
  AND name LIKE 'temp/%'
  AND created_at < NOW() - INTERVAL '30 days';
```

---

## 📊 Storage 使用监控

### 查询 Storage 使用情况

```sql
-- 各 bucket 文件数量和总大小
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  SUM(COALESCE((metadata->>'size')::bigint, 0)) / 1024 / 1024 as total_size_mb
FROM storage.objects
GROUP BY bucket_id
ORDER BY total_size_mb DESC;

-- 最近上传的文件
SELECT 
  bucket_id,
  name,
  (metadata->>'size')::bigint / 1024 as size_kb,
  created_at
FROM storage.objects
ORDER BY created_at DESC
LIMIT 10;

-- 最大的文件
SELECT 
  bucket_id,
  name,
  (metadata->>'size')::bigint / 1024 / 1024 as size_mb
FROM storage.objects
ORDER BY (metadata->>'size')::bigint DESC
LIMIT 10;
```

---

## ✅ 配置检查清单

完成以下检查项，确保配置正确：

### Buckets 创建
- [ ] pdfs bucket 已创建（public）
- [ ] avatars bucket 已创建（public）
- [ ] institution-logos bucket 已创建（public）

### 文件夹结构
- [ ] pdfs/chapters/ 已创建
- [ ] pdfs/highlights/ 已创建
- [ ] pdfs/outlines/ 已创建
- [ ] pdfs/predictions/ 已创建
- [ ] pdfs/thumbnails/ 已创建

### RLS 策略
- [ ] pdfs - 公开读取策略
- [ ] pdfs - 认证用户上传策略
- [ ] avatars - 用户管理自己头像策略
- [ ] avatars - 公开读取策略
- [ ] logos - 公开读取策略
- [ ] logos - 认证用户上传策略

### 测试验证
- [ ] 可以在 Dashboard 上传文件
- [ ] 可以获取文件的公开 URL
- [ ] 可以在浏览器中访问公开 URL
- [ ] 代码中可以列出文件
- [ ] 代码中可以上传文件

---

## 🎉 完成后的效果

配置完成后，你可以：

1. **在代码中上传PDF**
   ```typescript
   const { data, error } = await supabase.storage
     .from('pdfs')
     .upload('chapters/执业药师/chapter-1.pdf', file);
   ```

2. **获取PDF的公开URL**
   ```typescript
   const { data } = supabase.storage
     .from('pdfs')
     .getPublicUrl('chapters/执业药师/chapter-1.pdf');
   
   console.log(data.publicUrl);
   // https://tparjdkxxtnentsdazfw.supabase.co/storage/v1/object/public/pdfs/chapters/执业药师/chapter-1.pdf
   ```

3. **在前端显示PDF**
   ```tsx
   <iframe src={pdfUrl} width="100%" height="600px" />
   ```

4. **用户上传头像**
   ```typescript
   const userId = user.id;
   const { data, error } = await supabase.storage
     .from('avatars')
     .upload(`${userId}/avatar.jpg`, avatarFile);
   ```

---

## 🔗 相关文档

- Supabase Storage 文档: https://supabase.com/docs/guides/storage
- Storage RLS 策略: https://supabase.com/docs/guides/storage/security/access-control
- Storage API 参考: https://supabase.com/docs/reference/javascript/storage-from-upload

---

## 📞 需要帮助？

如果配置过程中遇到问题：
1. 检查 Supabase Dashboard 的日志
2. 确认 RLS 策略是否正确
3. 测试 API 连接是否正常
4. 随时告诉我遇到的错误信息！

**下一步：设置 RLS 数据安全策略** 🔒
