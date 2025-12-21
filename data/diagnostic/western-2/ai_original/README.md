# Diagnostic AI Original Data (western-2)

Put chapter-level JSON files under this directory. Each file should be named with its chapter code (e.g., `C5.json`) and export an array of question objects with the following fields:

```json
[
  {
    "question_type": "单选",
    "chapter_code": "C5",
    "chapter_title": "第五章 骨骼肌肉与康复系统用药",
    "section_code": "C5.1",
    "section_title": "第一节 抗炎与抗风湿",
    "knowledge_point_code": "C5.1.1",
    "knowledge_point_title": "非甾体抗炎药的选择",
    "stem": "真实题干...",
    "options": {
      "A": "A 选项",
      "B": "B 选项",
      "C": "C 选项",
      "D": "D 选项",
      "E": "E 选项"
    },
    "answer": "A",
    "explanation": "标准解析..."
  }
]
```

The seeding scripts enforce `source_type = "ai_original"`, `license = "western"`, and `subject = "western-2"`, so you only need to keep fields that vary across questions.

