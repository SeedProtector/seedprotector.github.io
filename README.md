# Seed 芥子 — 官方网站

这是 Seed 芥子产品的静态官方网站，支持中英文双语，可直接部署到 GitHub Pages 或任何静态托管服务。

## 目录结构

```
web/
├── index.html              # 主页面
├── css/
│   └── style.css           # 样式文件
├── js/
│   ├── i18n.js             # 国际化模块
│   └── app.js              # 主应用逻辑
├── data/
│   ├── site.json           # 站点全局配置（品牌、SEO、颜色、链接等）
│   └── i18n/
│       ├── zh.json         # 中文语言包
│       └── en.json         # 英文语言包
├── assets/
│   └── icons/
│       └── seed-icon.png   # 产品图标
└── README.md               # 本文件
```

## 本地预览

```bash
# 🚀 本地预览
cd web
python3 -m http.server 8080
# 然后打开浏览器访问 http://localhost:8080

# 📦 部署到 GitHub Pages
将 web/ 内容推送到 gh-pages 分支即可，零构建步骤。
```

或者使用 Node.js：

```bash
npx serve web
```

## 自定义配置

### 修改品牌信息
编辑 `data/site.json` 中的 `brand`、`seo`、`links` 等字段。

### 修改页面文案
- 中文：编辑 `data/i18n/zh.json`
- 英文：编辑 `data/i18n/en.json`

### 修改颜色主题
编辑 `css/style.css` 中 `:root` 下的 CSS 变量，或修改 `data/site.json` 中的 `colors` 字段。

### 添加联系方式
在 `data/site.json` 中的 `links` 字段填入实际的链接地址。

## 部署到 GitHub Pages

项目已配置 GitHub Actions 自动部署（`.github/workflows/deploy-pages.yml`）。

### 1. 配置 GitHub Secrets（敏感信息）

在仓库 **Settings → Secrets and variables → Actions** 中添加以下 Secrets：

| Secret 名称 | 说明 | 必填 |
|---|---|---|
| `SEED_CONTACT_EMAIL` | 联系邮箱地址（如 `your@gmail.com`） | ✅ |
| `SEED_EMAILJS_PUBLIC_KEY` | EmailJS Public Key | 可选 |
| `SEED_EMAILJS_SERVICE_ID` | EmailJS Service ID | 可选 |
| `SEED_EMAILJS_TEMPLATE_ID` | EmailJS Template ID | 可选 |

### 2. 启用 GitHub Pages

1. 进入仓库 **Settings → Pages**
2. **Source** 选择 **GitHub Actions**
3. 推送代码到 `master` 分支（修改 `web/` 下的文件即触发部署）
4. 访问 `https://<username>.github.io/<repo>/`

### 工作原理

部署时 GitHub Actions 会自动：
1. 从 Secrets 读取环境变量
2. 运行 `scripts/tools/inject_env.sh --env-only` 将值注入到 `web/data/site.json`
3. 将 `web/` 目录部署到 GitHub Pages

**这样 `site.json` 在 Git 仓库中不包含真实邮箱和密钥，只在部署时动态注入。**

## 语言切换

- 点击导航栏的 🌐 按钮切换中/英文
- 通过 URL 参数 `?lang=en` 或 `?lang=zh` 指定语言
- 语言偏好会保存在 `localStorage` 中

## 技术栈

- **纯静态 HTML/CSS/JS**，无构建步骤
- **CSS Variables** 实现主题系统
- **Intersection Observer** 实现滚动动画
- **JSON 数据驱动**，内容与展示分离
- **响应式设计**，支持桌面/平板/手机
