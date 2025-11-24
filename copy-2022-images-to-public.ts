import * as fs from 'fs';
import * as path from 'path';

// 源目录和目标目录
const sourceDir = 'E:\\tiku\\shuju\\2022年执业药师中药师药一历年真题图片';
const targetDir = 'E:\\tiku\\public\\shuju\\2022年执业药师中药师药一历年真题图片';

async function copyImages() {
  console.log('🖼️  开始复制2022年图片文件...\n');

  try {
    // 创建目标目录（如果不存在）
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log('📁 创建目标目录:', targetDir);
    }

    // 读取源目录中的所有文件
    const files = fs.readdirSync(sourceDir);
    
    // 过滤出图片文件
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
    });

    console.log(`📊 找到 ${imageFiles.length} 个图片文件:\n`);

    let successCount = 0;
    let errorCount = 0;

    // 复制每个图片文件
    for (const file of imageFiles) {
      try {
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(targetDir, file);

        // 复制文件
        fs.copyFileSync(sourcePath, targetPath);
        
        // 验证文件大小
        const sourceStats = fs.statSync(sourcePath);
        const targetStats = fs.statSync(targetPath);
        
        if (sourceStats.size === targetStats.size) {
          console.log(`✅ ${file} (${Math.round(sourceStats.size / 1024)}KB)`);
          successCount++;
        } else {
          console.log(`❌ ${file} - 文件大小不匹配`);
          errorCount++;
        }
      } catch (error) {
        console.log(`❌ ${file} - 复制失败:`, error);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`📊 复制统计:`);
    console.log(`   ✅ 成功: ${successCount} 个文件`);
    console.log(`   ❌ 失败: ${errorCount} 个文件`);
    console.log(`   📁 目标目录: ${targetDir}`);
    console.log('='.repeat(50));

    // 验证关键图片文件
    console.log('\n🔍 验证关键图片文件:');
    const keyImages = [
      '37_A.jpg',  // 题37 - 桔梗
      '78_79_A .png', // 题78-79 - 化学结构（注意文件名有空格）
      '97_98_A.jpg', // 题97-98 - 细辛/白前
      '99_100_A.jpg' // 题99-100 - 栀子/金樱子
    ];

    for (const img of keyImages) {
      const targetPath = path.join(targetDir, img);
      if (fs.existsSync(targetPath)) {
        const stats = fs.statSync(targetPath);
        console.log(`   ✅ ${img} (${Math.round(stats.size / 1024)}KB)`);
      } else {
        console.log(`   ❌ ${img} - 文件不存在`);
      }
    }

    console.log('\n🌐 前端访问路径示例:');
    console.log(`   /shuju/2022年执业药师中药师药一历年真题图片/37_A.jpg`);
    console.log(`   /shuju/2022年执业药师中药师药一历年真题图片/78_79_A .png`);
    
    console.log('\n✅ 图片复制完成！现在可以在前端正常显示图片了。');

  } catch (error) {
    console.error('❌ 复制过程中发生错误:', error);
  }
}

copyImages();
