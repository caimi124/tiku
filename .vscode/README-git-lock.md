# 关于 index.lock 与 Git 设置

## 问题

在终端执行 `git add` / `git commit` / `git push` 时，有时会提示：

```
fatal: Unable to create 'E:/tiku/.git/index.lock': File exists.
Another git process seems to be running in this repository...
```

原因是：**编辑器后台的 Git（源控制面板、状态刷新）和你在终端里执行的 Git 命令同时访问仓库**，都会写 `.git/index`，所以产生锁冲突。

## 本仓库的缓解方案

在 **工作区设置**（`.vscode/settings.json`）里已开启：

- **`git.autorefresh": false`**：不在后台自动刷新源控制状态，减少和终端里 `git` 的并发。
- **`git.refreshOnWindowFocus": false`**：窗口重新获得焦点时不自动跑 Git，进一步减少冲突。

这样在**本仓库**里，由 Cursor/VS Code 触发的 Git 会少很多，终端里 `git add/commit/push` 时就不容易再遇到 `index.lock`。

## 你需要做的

1. **重新加载窗口**：修改设置后，建议用 `Ctrl+Shift+P` → 运行 **“Developer: Reload Window”**，让设置生效。
2. **以后推代码**：
   - 在终端里执行：`git add ... && git commit -m "..." && git push`，或
   - 使用项目根目录的 `deploy-push.bat`（若有）。
3. 若仍偶尔出现 `index.lock`：先关掉源控制面板，删掉 `E:\tiku\.git\index.lock`，再立刻在终端执行你的 `git` 命令。

## 若想恢复自动刷新

若你更习惯源控制面板自动刷新，可在 `.vscode/settings.json` 里改回或删掉这两项：

```json
"git.autorefresh": true,
"git.refreshOnWindowFocus": true
```

或把这两行删掉，恢复为编辑器默认行为。
