/**
 * 推荐系统日志工具
 * 使用环境变量 RECO_DEBUG_LOG=true 控制日志输出
 * 默认生产环境不打印
 */

const DEBUG_ENABLED = process.env.RECO_DEBUG_LOG === "true";

export const recoLogger = {
  /**
   * 开发环境或 RECO_DEBUG_LOG=true 时输出日志
   */
  debug: (...args: unknown[]) => {
    if (DEBUG_ENABLED || process.env.NODE_ENV === "development") {
      console.log("[推荐系统]", ...args);
    }
  },

  /**
   * 始终输出错误日志
   */
  error: (...args: unknown[]) => {
    console.error("[推荐系统]", ...args);
  },

  /**
   * 监控统计日志（仅在 RECO_DEBUG_LOG=true 时输出）
   */
  stats: (label: string, data: Record<string, unknown>) => {
    if (DEBUG_ENABLED) {
      console.log(`[推荐系统-统计] ${label}:`, data);
    }
  },
};

