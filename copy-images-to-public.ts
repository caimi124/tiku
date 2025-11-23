import * as fs from 'fs';
import * as path from 'path';

async function copyImages() {
  console.log('📁 复制图片到public文件夹\n');

  try {
    // 源目录和目标目录
    const sourceDir = path.join(__dirname, 'shuju/2024年执业药师中药药一历年真题/img');
    const targetDir = path.join(__dirname, 'public/shuju/2024年执业药师中药药一历年真题/img');

    console.log(`源目录: ${sourceDir}`);
    console.log(`目标目录: ${targetDir}\n`);

    // 创建目标目录（如果不存在）
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log('✅ 创建目标目录成功\n');
    }

    // 读取源目录中的所有文件
    const files = fs.readdirSync(sourceDir);
    const imageFiles = files.filter(f => f.toLowerCase().endsWith('.jpeg') || f.toLowerCase().endsWith('.jpg'));

    console.log(`找到 ${imageFiles.length} 张图片\n`);
    console.log('开始复制...\n');

    let copiedCount = 0;
    for (const file of imageFiles) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);

      try {
        fs.copyFileSync(sourcePath, targetPath);
        copiedCount++;
        console.log(`✅ [${copiedCount}/${imageFiles.length}] ${file}`);
      } catch (error: any) {
        console.error(`❌ 复制失败 ${file}:`, error.message);
      }
    }

    console.log(`\n📊 复制完成: ${copiedCount}/${imageFiles.length} 张图片`);
    console.log(`\n✅ 图片现在可以通过以下URL访问:`);
    console.log(`   http://localhost:3000/shuju/2024年执业药师中药药一历年真题/img/8-A.jpeg\n`);

  } catch (error: any) {
    console.error('❌ 操作失败:', error.message);
    throw error;
  }
}

copyImages();
