# FUXC.TEAM

AI Native showcase site for Agents, browser extensions, and skills.

这是一个可直接部署到 Vercel 的静态展示站，包含：
- 前台整屏滚动首页
- 应用卡片详情弹窗
- 后台登录页与管理页
- Vercel Functions 真后台
- Vercel Blob 内容存储与截图上传

## One-Click Update

[![一键更新](https://img.shields.io/badge/Vercel-%E4%B8%80%E9%94%AE%E6%9B%B4%E6%96%B0-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/new/clone?repository-url=https://github.com/Seth360/fuxc.team&project-name=fuxc-team&repository-name=fuxc.team&env=ADMIN_PASSWORD,SESSION_SECRET,BLOB_READ_WRITE_TOKEN&envDescription=Admin%20password%2C%20session%20secret%2C%20and%20Vercel%20Blob%20token)

说明：这个按钮会跳转到 Vercel 导入/部署流程，适合快速基于当前仓库创建或重新接入项目。

## Stack

- Static HTML, CSS, JavaScript
- Vercel Functions
- Vercel Blob

## Features

- 首屏视频背景与整屏滚动交互
- 第二屏应用卡片列表与详情弹窗
- 左右结构后台管理界面
- 服务端登录鉴权
- 服务端内容读写
- 服务端图片上传

## Project Structure

```txt
.
├── index.html
├── login.html
├── admin.html
├── styles.css
├── admin.css
├── content.js
├── script.js
├── login.js
├── admin.js
├── api
│   ├── content.mjs
│   ├── upload.mjs
│   ├── auth
│   │   ├── login.mjs
│   │   ├── logout.mjs
│   │   └── me.mjs
│   └── _lib
│       ├── auth.mjs
│       └── site-data.mjs
└── topbg.mp4
```

## Environment Variables

Copy `.env.example` and configure the following values in Vercel:

- `ADMIN_PASSWORD`
  后台登录密码
- `SESSION_SECRET`
  用于签发后台登录 Cookie，建议使用长随机字符串
- `BLOB_READ_WRITE_TOKEN`
  Vercel Blob 读写令牌

## Deploy on Vercel

### 1. Import the repository

Import this GitHub repository into Vercel.

### 2. Create a Blob store

In Vercel:

- Storage
- Create Database
- Choose `Blob`
- Create a store

Then copy the Blob read/write token into your project environment variables as `BLOB_READ_WRITE_TOKEN`.

Reference:
- https://vercel.com/docs/storage/vercel-blob

### 3. Configure environment variables

In `Project -> Settings -> Environment Variables`, add:

```bash
ADMIN_PASSWORD=your-admin-password
SESSION_SECRET=your-long-random-secret
BLOB_READ_WRITE_TOKEN=your-blob-read-write-token
```

### 4. Redeploy

After environment variables are set, redeploy the project once.

## Local Development

Install dependencies:

```bash
npm install
```

Run local development with Vercel CLI:

```bash
vercel dev
```

## Admin

- Login page: `/login.html`
- Admin page: `/admin.html`

The admin supports:

- 编辑首屏文案
- 编辑第二屏标题区
- 新建、编辑、删除应用卡片
- 上传卡片截图

## Notes

- `topbg.mp4` is committed as a local asset and served directly.
- The admin is now server-backed, not `localStorage`-backed.
- If `BLOB_READ_WRITE_TOKEN` is missing, uploads and content persistence will fail.
