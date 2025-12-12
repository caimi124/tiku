#!/bin/bash
cd /e/tiku || exit 1
git commit -m "$(cat <<'EOF'
feat: 更新首页诊断CTA体验

同步中文CTA文案，强化首页各分屏文案及按钮跳转到/diagnostic，并补全诊断占位页。
EOF
)"
