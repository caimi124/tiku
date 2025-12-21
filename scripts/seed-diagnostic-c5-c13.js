const { seedWestern2AiOriginal } = require("./seed-diagnostic-western-2-ai-original");

seedWestern2AiOriginal({
  chapters: ["C5", "C6", "C7", "C8", "C9", "C10", "C11", "C12", "C13"],
}).catch((error) => {
  console.error("C5–C13 诊断题导入失败：", error);
  process.exit(1);
});

