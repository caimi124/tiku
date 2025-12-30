-- Migration for user_point_completion table
CREATE TABLE IF NOT EXISTS public.user_point_completion (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  point_id TEXT NOT NULL,
  chapter_code TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, point_id)
);
CREATE INDEX IF NOT EXISTS idx_user_point_completion_user ON public.user_point_completion (user_id);

