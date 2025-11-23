import * as fs from 'fs';
import * as path from 'path';

// 复制图片到public目录
async function copyImages() {
  const sourceDir = path.join(__dirname, 'shuju/2023年执业药师中药药一历年真题图片');
  const targetDir = path.join(__dirname, 'public/shuju/2023年执业药师中药药一历年真题图片/img');

  console.log('🚀 开始复制2023年图片到public目录\n');
  console.log(`📁 源目录: ${sourceDir}`);
  console.log(`📁 目标目录: ${targetDir}\n`);

  // 创建目标目录
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log('✅ 创建目标目录成功\n');
  }

  // 读取源目录所有文件
  const files = fs.readdirSync(sourceDir);
  const imageFiles = files.filter(f => 
    f.toLowerCase().endsWith('.jpeg') || 
    f.toLowerCase().endsWith('.jpg') || 
    f.toLowerCase().endsWith('.png')
  );

  console.log(`📊 发现 ${imageFiles.length} 张图片\n`);

  let copiedCount = 0;
  for (const file of imageFiles) {
    try {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      
      fs.copyFileSync(sourcePath, targetPath);
      copiedCount++;
      console.log(`✅ [${copiedCount}/${imageFiles.length}] 复制: ${file}`);
    } catch (error: any) {
      console.error(`❌ 复制失败 ${file}:`, error.message);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✨ 复制完成: ${copiedCount}/${imageFiles.length} 张图片`);
  console.log(`${'='.repeat(60)}\n`);
}

copyImages().catch(console.error);
