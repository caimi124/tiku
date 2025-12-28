import { NextResponse } from "next/server"

interface DatabaseErrorResponsePayload {
  code: string
  message: string
  details?: string
}

export function buildDatabaseErrorResponse(error: unknown, context: string = "数据库查询") {
  const err = error as { code?: string; message?: string }
  const isMissingColumn = err.code === "42703"

  const responsePayload: {
    success: boolean
    error: DatabaseErrorResponsePayload
  } = {
    success: false,
    error: {
      code: isMissingColumn ? "MISSING_COLUMN" : "INTERNAL_ERROR",
      message: isMissingColumn
        ? `数据库字段缺失（${context}），请执行 migrations/005-knowledge-mode-tags.sql`
        : "服务器内部错误",
      details: isMissingColumn ? err.message ?? undefined : undefined,
    },
  }

  return NextResponse.json(responsePayload, { status: 500 })
}

