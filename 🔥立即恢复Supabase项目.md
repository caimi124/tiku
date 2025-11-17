# 🔥 立即恢复 Supabase 项目

## ❌ 当前状态

**数据库连接失败** - 无法到达 `db.rekdretiemtoofrvcils.supabase.co:5432`

这表明你的 Supabase 项目已**暂停（Paused）**，需要手动恢复。

---

## ✅ 立即恢复项目（2分钟）

### 步骤 1: 登录 Supabase Dashboard

**访问链接：**
```
https://supabase.com/dashboard/project/mjyfiryzawngzadfxfoe
```

或者访问总览：
```
https://supabase.com/dashboard
```

**登录信息：**
- 项目名称：caimi124's Project  
- 密码：chupingzeng123.

### 步骤 2: 检查项目状态

登录后，你应该看到项目状态。如果显示：
- 🔴 **"Paused"** 或 **"暂停"** 
- 🔴 **"Inactive"** 或 **"未激活"**

这就是为什么无法连接的原因。

### 步骤 3: 恢复项目

1. 找到项目卡片或详情页
2. 点击 **"Resume Project"** 或 **"Restore Project"** 按钮
3. 等待 **1-2 分钟**，直到状态变为：
   - 🟢 **"Active"** 或 **"运行中"**
   - 🟢 绿色状态指示器

### 步骤 4: 验证连接字符串

在项目恢复后，确认连接字符串：

1. 点击左侧 **"Project Settings"**（齿轮图标⚙️）
2. 选择 **"Database"** 选项卡
3. 找到 **"Connection string"** 部分
4. 选择 **"URI"** 格式
5. 确认显示的连接字符串

**你的新连接字符串应该是：**
```
postgresql://postgres:HR1d0WehCi5RILq7@db.rekdretiemtoofrvcils.supabase.co:5432/postgres
```

---

## 🧪 恢复后测试连接

项目恢复后（状态变为绿色Active），立即运行测试：

```powershell
npx tsx test-new-db-connection.ts
```

**预期成功输出：**
```
✅ 数据库连接成功！
📊 数据库版本: PostgreSQL 15.x ...
📋 现有数据表: ...
```

---

## 📝 更新配置文件

项目恢复成功后，更新你的 `.env.local` 文件：

```env
# 新的数据库连接（密码已更新）
DATABASE_URL="postgresql://postgres:HR1d0WehCi5RILq7@db.rekdretiemtoofrvcils.supabase.co:5432/postgres"

# NextAuth 配置
NEXTAUTH_SECRET="your-secret-key-123456"
NEXTAUTH_URL="http://localhost:3000"

# 环境标识
NODE_ENV="development"
```

---

## 🚀 恢复后的完整流程

### 1️⃣ 确认项目恢复（必须先做）
```
访问 https://supabase.com/dashboard/project/mjyfiryzawngzadfxfoe
点击 "Resume Project"
等待变为绿色 "Active"
```

### 2️⃣ 更新配置文件
创建或更新 `.env.local`，使用新密码

### 3️⃣ 测试连接
```powershell
npx tsx test-new-db-connection.ts
```

### 4️⃣ 同步数据库结构
```powershell
npx prisma db push
npx prisma generate
```

### 5️⃣ 导入2024年真题（如果数据库为空）
```powershell
npx tsx setup-db-2024.ts
```

### 6️⃣ 应用前端修复
```powershell
.\应用前端修复.bat
```

### 7️⃣ 启动开发服务器
```powershell
npm run dev
```

---

## ⚠️ 为什么 Supabase 项目会暂停？

**免费项目自动暂停条件：**
- 超过 **7 天未使用**
- 数据库长时间闲置
- 没有活跃连接

**恢复后如何避免再次暂停：**
1. 定期访问项目 Dashboard
2. 定期运行应用程序连接数据库
3. 考虑升级到付费计划（不会自动暂停）

---

## 🎯 快速检查清单

- [ ] 已访问 Supabase Dashboard
- [ ] 项目状态显示 🟢 "Active"
- [ ] 已更新 `.env.local` 文件（新密码）
- [ ] 运行 `npx tsx test-new-db-connection.ts` 成功
- [ ] 显示数据库版本和表信息
- [ ] 可以查询到题目数量

---

## 📞 如果仍然无法连接

### 检查项 1: 网络连接
```powershell
# 测试主机连通性
Test-NetConnection -ComputerName db.rekdretiemtoofrvcils.supabase.co -Port 5432
```

### 检查项 2: 防火墙设置
确保防火墙没有阻止 5432 端口的出站连接

### 检查项 3: 项目是否被删除
在 Dashboard 中确认项目 `mjyfiryzawngzadfxfoe` 仍然存在

### 检查项 4: 密码是否正确
在 Supabase Dashboard 中重置数据库密码并获取新的连接字符串

---

## 💡 温馨提示

**项目恢复需要时间！**
- 点击 "Resume Project" 后
- 状态可能显示 "Restoring..." 或 "恢复中..."
- 通常需要 **1-2 分钟**
- 不要频繁刷新，耐心等待

**成功标志：**
- ✅ 项目状态显示绿色 "Active"
- ✅ 可以访问 Database 设置页面
- ✅ Connection Info 显示连接详情
- ✅ 运行测试脚本成功连接

---

## 🎉 下一步

项目恢复并连接成功后：

1. **查看数据库状态**
   - 是否有 questions 表？
   - 是否有题目数据？
   - 是否有2024年真题？

2. **如果数据库为空**
   - 运行 `npx prisma db push` 创建表
   - 运行 `npx tsx setup-db-2024.ts` 导入数据

3. **测试前端**
   - 启动开发服务器
   - 访问练习页面
   - 选择科目查看题目

---

**立即行动：**
👉 [点击这里访问 Supabase Dashboard](https://supabase.com/dashboard/project/mjyfiryzawngzadfxfoe)

恢复项目后，回来运行：
```powershell
npx tsx test-new-db-connection.ts
```

看到 ✅ 成功提示后，继续下一步！
