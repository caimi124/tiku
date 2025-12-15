#!/usr/bin/env node
/**
 * 诊断级题库清洗脚本
 *
 * 功能
 * 1. 基于题干+选项+答案生成稳定 question_id
 * 2. 完全重复去重
 * 3. 标记无效题（题干空 / 选项带多题编号 / 答案空）
 * 4. 可分批运行并支持断点续跑
 * 5. 输出 clean_questions.json、invalid_questions.json、dedup_report.json 以及 cleaning.log
 *
 * 使用示例：
 *   node clean-diagnostic-question-bank.js --input "./shuju/执业药师西药二1200题.json" --batch-size 200 --resume
 *
 * 可选参数：
 *   --input <path>        输入 JSON 文件路径，默认为 ./shuju/执业药师西药二1200题.json
 *   --output-dir <path>   输出目录，默认为输入文件所在目录
 *   --batch-size <num>    每次处理的题量，默认 200
 *   --resume              继续上次未完成的清洗
 *   --reset               清除已生成的中间文件，从头开始清洗
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_INPUT = path.join('shuju', '执业药师西药二1200题.json');
const DEFAULT_BATCH_SIZE = 200;
const STATE_FILE_NAME = '.diagnostic_clean_state.json';
const CLEAN_FILE_NAME = 'clean_questions.json';
const INVALID_FILE_NAME = 'invalid_questions.json';
const REPORT_FILE_NAME = 'dedup_report.json';
const LOG_FILE_NAME = 'cleaning.log';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const [key, value] = token.replace(/^--/, '').split('=');
    if (value !== undefined) {
      args[key] = value;
      continue;
    }
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      i -= 1;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function readJsonIfExists(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`无法读取 ${filePath}，使用默认值。`, err);
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function appendLog(logFilePath, message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFilePath, `[${timestamp}] ${message}\n`, 'utf-8');
}

function normalizeText(value) {
  return (value ?? '').toString().trim();
}

function normalizeOptions(rawOptions) {
  if (!rawOptions) return [];
  if (Array.isArray(rawOptions)) {
    return rawOptions.map((value, idx) => ({
      key: String.fromCharCode(65 + idx),
      value: normalizeText(
        typeof value === 'string' ? value : value?.value ?? '',
      ),
    }));
  }
  if (typeof rawOptions === 'object') {
    return Object.keys(rawOptions)
      .sort()
      .map((key) => ({
        key,
        value: normalizeText(rawOptions[key]),
      }));
  }
  return [];
}

function computeSignature(stem, normalizedOptions, answer) {
  const payload = JSON.stringify({
    stem: normalizeText(stem),
    options: normalizedOptions.map((opt) => `${opt.key}::${opt.value}`),
    answer: normalizeText(answer),
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

function detectInvalidReasons(question, normalizedOptions) {
  const reasons = [];
  if (!normalizeText(question.stem)) {
    reasons.push('empty_stem');
  }
  const optionsText = normalizedOptions.map((opt) => opt.value).join(' || ');
  if (/\b\d{2,3}\./.test(optionsText)) {
    reasons.push('options_contain_question_number');
  }
  if (!normalizeText(question.answer)) {
    reasons.push('empty_answer');
  }
  return reasons;
}

function buildCleanedQuestion(rawQuestion, meta) {
  return {
    ...rawQuestion,
    question_id: meta.questionId,
    cleaning_meta: {
      signature: meta.signature,
      original_index: meta.originalIndex,
      is_invalid: meta.isInvalid,
      invalid_reasons: meta.invalidReasons,
      processed_at: meta.processedAt,
    },
  };
}

function loadExistingOutput(pathToFile, shouldLoad) {
  if (!shouldLoad) return [];
  return readJsonIfExists(pathToFile, []);
}

function rebuildSignatureMap(questions) {
  const map = new Map();
  for (const item of questions) {
    const signature = item?.cleaning_meta?.signature;
    if (signature) {
      map.set(signature, item.question_id);
    }
  }
  return map;
}

function main() {
  const argv = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(argv.input || DEFAULT_INPUT);
  const inputDir = path.dirname(inputPath);
  const outputDir = path.resolve(argv['output-dir'] || inputDir);
  const batchSize = Number(argv['batch-size'] || DEFAULT_BATCH_SIZE);
  const shouldResume = Boolean(argv.resume);
  const shouldReset = Boolean(argv.reset);

  const cleanFilePath = path.join(outputDir, CLEAN_FILE_NAME);
  const invalidFilePath = path.join(outputDir, INVALID_FILE_NAME);
  const reportFilePath = path.join(outputDir, REPORT_FILE_NAME);
  const stateFilePath = path.join(outputDir, STATE_FILE_NAME);
  const logFilePath = path.join(outputDir, LOG_FILE_NAME);

  ensureDir(outputDir);

  if (shouldReset) {
    [cleanFilePath, invalidFilePath, reportFilePath, stateFilePath, logFilePath]
      .filter((file) => fs.existsSync(file))
      .forEach((file) => fs.unlinkSync(file));
    console.log('已清空历史输出，准备重新开始。');
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`输入文件不存在：${inputPath}`);
    process.exit(1);
  }

  const rawQuestions = readJsonIfExists(inputPath, []);
  if (!Array.isArray(rawQuestions)) {
    console.error('输入文件不是题目数组，无法清洗。');
    process.exit(1);
  }

  const state = shouldResume ? readJsonIfExists(stateFilePath, null) : null;
  const hasState = Boolean(state);
  const startIndex = shouldResume && state ? state.nextIndex ?? 0 : 0;
  const cleanQuestions = loadExistingOutput(cleanFilePath, shouldResume);
  const invalidQuestions = loadExistingOutput(invalidFilePath, shouldResume);
  const signatureMap = rebuildSignatureMap([
    ...cleanQuestions,
    ...invalidQuestions,
  ]);

  if (!shouldResume) {
    if (fs.existsSync(stateFilePath) || fs.existsSync(cleanFilePath)) {
      console.warn(
        '检测到历史输出，但未指定 --resume，将覆盖旧的数据。使用 --resume 可继续增量处理。',
      );
    }
  }

  if (!shouldResume) {
    cleanQuestions.length = 0;
    invalidQuestions.length = 0;
    signatureMap.clear();
  } else if (!hasState) {
    console.warn(
      '未找到状态文件，但指定了 --resume，将从头开始处理。',
    );
  }

  if (startIndex >= rawQuestions.length) {
    console.log('所有题目已处理，无需再次运行。');
    appendLog(logFilePath, '跳过执行：无剩余题目。');
    return;
  }

  const batchEnd = Math.min(startIndex + batchSize, rawQuestions.length);
  let validAdded = 0;
  let invalidAdded = 0;
  let duplicatesDetected = 0;

  for (let idx = startIndex; idx < batchEnd; idx += 1) {
    const question = rawQuestions[idx] ?? {};
    const normalizedOptions = normalizeOptions(question.options);
    const signature = computeSignature(
      question.stem,
      normalizedOptions,
      question.answer,
    );

    if (signatureMap.has(signature)) {
      duplicatesDetected += 1;
      continue;
    }

    const invalidReasons = detectInvalidReasons(question, normalizedOptions);
    const questionId = signature;
    const processedAt = new Date().toISOString();
    const cleanedQuestion = buildCleanedQuestion(question, {
      questionId,
      signature,
      originalIndex: idx,
      isInvalid: invalidReasons.length > 0,
      invalidReasons,
      processedAt,
    });

    signatureMap.set(signature, questionId);

    if (invalidReasons.length > 0) {
      invalidQuestions.push(cleanedQuestion);
      invalidAdded += 1;
    } else {
      cleanQuestions.push(cleanedQuestion);
      validAdded += 1;
    }
  }

  writeJson(cleanFilePath, cleanQuestions);
  writeJson(invalidFilePath, invalidQuestions);

  const processedRecords = batchEnd;
  const uniqueRecords = cleanQuestions.length + invalidQuestions.length;
  const duplicatesRemoved = processedRecords - uniqueRecords;
  const report = readJsonIfExists(reportFilePath, {
    runs: [],
  });

  report.input_file = path.relative(process.cwd(), inputPath);
  report.output_dir = path.relative(process.cwd(), outputDir);
  report.total_input_records = rawQuestions.length;
  report.processed_records = processedRecords;
  report.unique_records = uniqueRecords;
  report.duplicates_removed = Math.max(duplicatesRemoved, 0);
  report.valid_records = cleanQuestions.length;
  report.invalid_records = invalidQuestions.length;
  report.completed = batchEnd >= rawQuestions.length;
  report.last_run = new Date().toISOString();
  report.runs = report.runs || [];
  report.runs.push({
    start_index: startIndex,
    end_index: batchEnd,
    batch_size: batchSize,
    valid_added: validAdded,
    invalid_added: invalidAdded,
    duplicates_detected: duplicatesDetected,
    timestamp: report.last_run,
  });

  writeJson(reportFilePath, report);

  if (batchEnd < rawQuestions.length) {
    writeJson(stateFilePath, {
      nextIndex: batchEnd,
      totalRecords: rawQuestions.length,
      batchSize,
      lastRun: report.last_run,
    });
    appendLog(
      logFilePath,
      `已处理 ${startIndex}-${batchEnd - 1}，新增有效 ${validAdded} 道，无效 ${invalidAdded} 道，重复 ${duplicatesDetected} 道。`,
    );
    console.log(
      `批次完成：${startIndex}-${batchEnd - 1}。剩余 ${
        rawQuestions.length - batchEnd
      } 道题（使用 --resume 继续）。`,
    );
  } else {
    if (fs.existsSync(stateFilePath)) {
      fs.unlinkSync(stateFilePath);
    }
    appendLog(
      logFilePath,
      `清洗完成，共写入有效 ${cleanQuestions.length} 道，无效 ${invalidQuestions.length} 道。`,
    );
    console.log(
      `全部完成！有效题 ${cleanQuestions.length} 道，无效题 ${invalidQuestions.length} 道，输出位于 ${outputDir}`,
    );
  }
}

main();
