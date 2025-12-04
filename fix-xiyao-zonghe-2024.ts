import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fix() {
  try {
    console.log('🔧 修复2024年西药药学综合与技能问题...\n');

    // 修复1：补充题13的A和B选项
    console.log('修复1：补充题13的选项...');
    
    const questions = await prisma.questions.findMany({
      where: {
        source_year: 2024,
        subject: '药学综合知识与技能'
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    if (questions.length >= 13) {
      const q13 = questions[12];
      
      // 完整的选项
      const correctOptions = [
        'A.丙泊酚注射液',
        'B.利多卡因注射液',
        'C.艾司唑仑片',
        'D.磷酸可待因片',
        'E.氨酚待因片'
      ];

      await prisma.questions.update({
        where: { id: q13.id },
        data: {
          options: correctOptions
        }
      });

      console.log('✅ 题13选项已更新为5个完整选项');
    }

    // 修复2：为综合分析题添加案例背景提示
    console.log('\n修复2：为综合分析题添加案例说明...');
    
    // 根据题目内容推断案例组
    const comprehensiveQuestions = questions.slice(90, 110);
    
    // 案例1：题91-92（冠心病患者）
    const case1Questions = comprehensiveQuestions.slice(0, 2);
    const case1Prefix = '【案例背景缺失】本题组涉及冠心病患者的药物治疗方案选择。\n\n';
    
    for (const q of case1Questions) {
      if (!q.content.includes('案例') && !q.content.includes('【')) {
        await prisma.questions.update({
          where: { id: q.id },
          data: {
            content: case1Prefix + q.content
          }
        });
      }
    }
    console.log('✅ 已为题91-92添加案例说明');

    // 案例2：题93-96（COPD患者）
    const case2Questions = comprehensiveQuestions.slice(2, 6);
    const case2Prefix = '【案例背景缺失】本题组涉及COPD患者的评估与治疗。\n\n';
    
    for (const q of case2Questions) {
      if (!q.content.includes('案例') && !q.content.includes('【')) {
        await prisma.questions.update({
          where: { id: q.id },
          data: {
            content: case2Prefix + q.content
          }
        });
      }
    }
    console.log('✅ 已为题93-96添加案例说明');

    // 案例3：题97-98（反流性食管炎）
    const case3Questions = comprehensiveQuestions.slice(6, 8);
    const case3Prefix = '【案例背景缺失】本题组涉及反流性食管炎患者的治疗。\n\n';
    
    for (const q of case3Questions) {
      if (!q.content.includes('案例') && !q.content.includes('【')) {
        await prisma.questions.update({
          where: { id: q.id },
          data: {
            content: case3Prefix + q.content
          }
        });
      }
    }
    console.log('✅ 已为题97-98添加案例说明');

    // 案例4：题99-101（儿童肺炎）
    const case4Questions = comprehensiveQuestions.slice(8, 11);
    const case4Prefix = '【案例背景缺失】本题组涉及儿童肺炎的抗感染治疗。\n\n';
    
    for (const q of case4Questions) {
      if (!q.content.includes('案例') && !q.content.includes('【')) {
        await prisma.questions.update({
          where: { id: q.id },
          data: {
            content: case4Prefix + q.content
          }
        });
      }
    }
    console.log('✅ 已为题99-101添加案例说明');

    // 案例5：题102-105（心衰患者）
    const case5Questions = comprehensiveQuestions.slice(11, 15);
    const case5Prefix = '【案例背景缺失】本题组涉及心力衰竭患者的综合治疗。\n\n';
    
    for (const q of case5Questions) {
      if (!q.content.includes('案例') && !q.content.includes('【')) {
        await prisma.questions.update({
          where: { id: q.id },
          data: {
            content: case5Prefix + q.content
          }
        });
      }
    }
    console.log('✅ 已为题102-105添加案例说明');

    // 案例6：题106-110（其他病例）
    const case6Questions = comprehensiveQuestions.slice(15);
    const case6Prefix = '【案例背景缺失】本题组涉及综合病例分析。\n\n';
    
    for (const q of case6Questions) {
      if (!q.content.includes('案例') && !q.content.includes('【')) {
        await prisma.questions.update({
          where: { id: q.id },
          data: {
            content: case6Prefix + q.content
          }
        });
      }
    }
    console.log('✅ 已为题106-110添加案例说明');

    console.log('\n✨ 修复完成！');
    console.log('\n⚠️  注意：');
    console.log('1. 题13的完整选项已补充');
    console.log('2. 综合分析题已添加案例缺失说明');
    console.log('3. JSON源文件本身有问题，建议联系数据提供方获取完整版本');
    console.log('4. 其他选项异常的题目也需要人工核查');

  } catch (error) {
    console.error('❌ 修复失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fix();
