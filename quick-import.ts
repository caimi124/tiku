import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// 加载配置
config({ path: '.env.import' });

const prisma = new PrismaClient();

console.log('\n🚀 2024年执业药师中药综合真题 - 快速导入\n');

// 前10道题作为测试（使用snake_case字段名）
const questions = [
  {exam_type:'执业药师',subject:'中药学综合知识与技能',chapter:'中医基础理论',question_type:'single',content:'属于"阳脉之海"的是',options:[{key:'A',value:'阳维之脉'},{key:'B',value:'阳跷之脉'},{key:'C',value:'督脉'},{key:'D',value:'带脉'},{key:'E',value:'任脉'}],correct_answer:'C',explanation:'督脉为"阳脉之海"。任脉为"阴脉之海"。',difficulty:2,knowledge_points:['经络学说','奇经八脉'],source_type:'历年真题',source_year:2024},
  {exam_type:'执业药师',subject:'中药学综合知识与技能',chapter:'中药贮藏',question_type:'single',content:'《中国药典》"凡例"中贮藏项下各名词术语进行了解释，关于中药贮藏名词说法，正确的是',options:[{key:'A',value:'密封系指将容器密闭，以防止尘及异物进入'},{key:'B',value:'遮光系指避免日光直射'},{key:'C',value:'阴凉处系指不超过20°C的环境'},{key:'D',value:'冷处系指0~8°C的环境'},{key:'E',value:'常温系指10~25°C的环境'}],correct_answer:'C',explanation:'阴凉处系指不超过20°C的环境。',difficulty:2,knowledge_points:['中药贮藏','药典知识'],source_type:'历年真题',source_year:2024},
  {exam_type:'执业药师',subject:'中药学综合知识与技能',chapter:'中医药学发展史',question_type:'single',content:'由唐代孙思邈撰著，在序例中著有"大医习业""大医精诚"两篇专论的典籍是',options:[{key:'A',value:'《外台秘要》'},{key:'B',value:'《巢氏病源》'},{key:'C',value:'《千金要方》'},{key:'D',value:'《千金翼方》'},{key:'E',value:'《新修本草》'}],correct_answer:'C',explanation:'在序例中著有"大医习业""大医精诚"两篇专论的典籍是《千金要方》。',difficulty:1,knowledge_points:['中医典籍','孙思邈'],source_type:'历年真题',source_year:2024}
];

async function main() {
  try {
    console.log(`📦 准备导入 ${questions.length} 道题目...\n`);
    
    for (let i = 0; i < questions.length; i++) {
      await prisma.questions.create({ data: questions[i] });
      console.log(`✅ [${i + 1}/${questions.length}] ${questions[i].content.substring(0, 30)}...`);
    }

    console.log(`\n🎉 成功导入 ${questions.length} 道题目！\n`);
    
  } catch (error) {
    console.error('❌ 导入失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
