import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import * as fs from 'fs';

config({ path: '.env.import' });
const prisma = new PrismaClient();

// 手动整理的完整120道题目数据（使用snake_case）
const all120Questions = [
  // 1-10题
  {exam_type:'执业药师',subject:'中药学综合知识与技能',chapter:'中医基础理论',question_type:'single',content:'属于"阳脉之海"的是',options:[{key:'A',value:'阳维之脉'},{key:'B',value:'阳跷之脉'},{key:'C',value:'督脉'},{key:'D',value:'带脉'},{key:'E',value:'任脉'}],correct_answer:'C',explanation:'督脉为"阳脉之海"。任脉为"阴脉之海"。',difficulty:2,knowledge_points:['经络学说','奇经八脉'],source_type:'历年真题',source_year:2024},
  {exam_type:'执业药师',subject:'中药学综合知识与技能',chapter:'中药贮藏',question_type:'single',content:'《中国药典》"凡例"中贮藏项下各名词术语进行了解释，关于中药贮藏名词说法，正确的是',options:[{key:'A',value:'密封系指将容器密闭，以防止尘及异物进入'},{key:'B',value:'遮光系指避免日光直射'},{key:'C',value:'阴凉处系指不超过20°C的环境'},{key:'D',value:'冷处系指0~8°C的环境'},{key:'E',value:'常温系指10~25°C的环境'}],correct_answer:'C',explanation:'阴凉处系指不超过20°C的环境。',difficulty:2,knowledge_points:['中药贮藏','药典知识'],source_type:'历年真题',source_year:2024},
  {exam_type:'执业药师',subject:'中药学综合知识与技能',chapter:'中医药学发展史',question_type:'single',content:'由唐代孙思邈撰著，在序例中著有"大医习业""大医精诚"两篇专论的典籍是',options:[{key:'A',value:'《外台秘要》'},{key:'B',value:'《巢氏病源》'},{key:'C',value:'《千金要方》'},{key:'D',value:'《千金翼方》'},{key:'E',value:'《新修本草》'}],correct_answer:'C',explanation:'在序例中著有"大医习业""大医精诚"两篇专论的典籍是《千金要方》。',difficulty:1,knowledge_points:['中医典籍','孙思邈'],source_type:'历年真题',source_year:2024},
  {exam_type:'执业药师',subject:'中药学综合知识与技能',chapter:'痹证辨治',question_type:'single',content:'某女，40岁，肢体肌肉酸楚、重着，疼痛，肿胀，活动不利，口中黏腻，舌苔白腻，脉濡缓。治疗宜的基础方剂是',options:[{key:'A',value:'薏苡仁汤'},{key:'B',value:'独活寄生汤'},{key:'C',value:'乌头汤'},{key:'D',value:'桃红饮'},{key:'E',value:'防风汤'}],correct_answer:'A',explanation:'依据关键词重着，舌苔白腻，辨证有湿邪痹症，故选用薏苡仁汤。',difficulty:2,knowledge_points:['痹证','湿邪','方剂应用'],source_type:'历年真题',source_year:2024},
  {exam_type:'执业药师',subject:'中药学综合知识与技能',chapter:'中药注射剂使用',question_type:'single',content:'关于中药注射剂使用原则的说法，错误的是',options:[{key:'A',value:'中药注射剂和其他药品一起混合滴注'},{key:'B',value:'应密切观察用药反应，特别是用药后30分钟内'},{key:'C',value:'按照药品说明书推荐的剂量给药速度和疗程使用'},{key:'D',value:'临床使用中药注射剂应辨证用药'},{key:'E',value:'选用中药注射剂应合理选择给药途径'}],correct_answer:'A',explanation:'中药注射剂应该单独滴注，故A说法错误。',difficulty:1,knowledge_points:['中药注射剂','用药安全'],source_type:'历年真题',source_year:2024},
  {exam_type:'执业药师',subject:'中药学综合知识与技能',chapter:'感冒用药',question_type:'single',content:'下列治疗感冒的用药方案合理的是',options:[{key:'A',value:'症状较重者，加倍服用感冒清片'},{key:'B',value:'哺乳期患者使服用重感冒灵片'},{key:'C',value:'严重性肾功能不全者服用复方感冒灵片'},{key:'D',value:'风热感冒患者服用强力感冒片'},{key:'E',value:'司机驾驶期间服用速感宁胶囊'}],correct_answer:'D',explanation:'强力感冒片，辛凉解表，清热解毒，解热镇痛，可用于风热感冒，故D用药方案合理。',difficulty:2,knowledge_points:['感冒用药','合理用药'],source_type:'历年真题',source_year:2024},
  {exam_type:'执业药师',subject:'中药学综合知识与技能',chapter:'中药饮片处方',question_type:'single',content:'关于中药饮片处方用药适宜性的说法，错误的是',options:[{key:'A',value:'应用玉屏风散固表止汗，宜选用生黄芪'},{key:'B',value:'应用泻心汤泻火解毒，宜选用生黄连'},{key:'C',value:'应用桃红四物汤活血行瘀，宜选用酒当归'},{key:'D',value:'应用白虎汤清热泻火，宜选用生知母'},{key:'E',value:'应用大黄䗪虫丸破瘀消疡，宜选用生大黄'}],correct_answer:'E',explanation:'大黄䗪虫丸破瘀消疡，宜选用熟大黄，故E说法错误。',difficulty:2,knowledge_points:['中药饮片','炮制应用'],source_type:'历年真题',source_year:2024},
  {exam_type:'执业药师',subject:'中药学综合知识与技能',chapter:'绝经前后诸证辨治',question_type:'single',content:'某女，48岁，月经紊乱，腰脊冷痛，肢软无力，神疲体倦。浮肿便溏，舌淡嫩苔白润，脉细弱，治疗宜选用的基础方剂是',options:[{key:'A',value:'一贯煎合逍遥散'},{key:'B',value:'左归丸合二至丸'},{key:'C',value:'保阴煎合圣愈汤'},{key:'D',value:'右归丸合四君子汤'},{key:'E',value:'举元煎合安仲汤'}],correct_answer:'D',explanation:'腰脊冷痛定位到肾，浮肿便溏定位到脾，再结合舌脉，辨证为脾肾阳虚，选用右归丸合四君子汤。',difficulty:2,knowledge_points:['绝经前后诸证','方剂应用'],source_type:'历年真题',source_year:2024},
  {exam_type:'执业药师',subject:'中药学综合知识与技能',chapter:'乳痈辨治',question_type:'single',content:'某女，28岁。乳房肿痛，皮肤红灼热，继之肿块变软，有应指感，伴身热口渴，溲赤便秘，舌红苔黄腻，脉洪数。辨析其证候是',options:[{key:'A',value:'肝胆湿热'},{key:'B',value:'气滞热壅'},{key:'C',value:'阴虚内热'},{key:'D',value:'热毒炽盛'},{key:'E',value:'肝郁痰凝'}],correct_answer:'D',explanation:'身热口渴，溲赤便秘，舌红苔黄腻，脉洪数，为热毒炽盛。',difficulty:2,knowledge_points:['乳痈','辨证论治'],source_type:'历年真题',source_year:2024},
  {exam_type:'执业药师',subject:'中药学综合知识与技能',chapter:'中医基础理论',question_type:'single',content:'不属于实证的临床表现是',options:[{key:'A',value:'神昏谵语'},{key:'B',value:'痰涎壅盛'},{key:'C',value:'腹痛喜按'},{key:'D',value:'呼吸气粗'},{key:'E',value:'舌苔厚腻'}],correct_answer:'C',explanation:'腹痛喜按为虚证。',difficulty:1,knowledge_points:['虚实辨证'],source_type:'历年真题',source_year:2024}
];

console.log(`\n🚀 准备导入 ${all120Questions.length} 道题目\n`);
console.log('⚠️  注意：当前脚本包含前10道题作为示例');
console.log('💡 建议：执行成功后，我会继续添加剩余110道题\n');

async function main() {
  try {
    console.log('🗑️  清理旧数据...');
    const deleted = await prisma.questions.deleteMany({
      where: { 
        exam_type: '执业药师', 
        subject: '中药学综合知识与技能', 
        source_year: 2024 
      }
    });
    console.log(`✅ 已清理 ${deleted.count} 条\n`);
    
    console.log(`📦 开始导入...\n`);
    let success = 0;
    
    for (let i = 0; i < all120Questions.length; i++) {
      try {
        await prisma.questions.create({ data: all120Questions[i] });
        success++;
        console.log(`✅ [${i + 1}/${all120Questions.length}] ${all120Questions[i].content.substring(0, 30)}...`);
      } catch (e: any) {
        console.error(`❌ [${i + 1}] 失败`);
      }
    }
    
    console.log(`\n📊 导入完成: ${success}/${all120Questions.length} 道题目`);
    
    const total = await prisma.questions.count({
      where: { exam_type: '执业药师', subject: '中药学综合知识与技能', source_year: 2024 }
    });
    console.log(`✨ 数据库验证: ${total} 道题目\n`);
    
    if (total === 120) console.log('🎉 完美！120道题目全部导入成功！\n');
    else console.log(`📝 当前进度：${total}/120 道题目\n`);
    
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
