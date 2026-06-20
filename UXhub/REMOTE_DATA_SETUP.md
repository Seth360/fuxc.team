# ShareAgent UX Hub 线上共享数据配置

当前静态页支持两种数据模式：

- 未配置 API：使用浏览器 `localStorage`，只在当前浏览器保存。
- 配置 API：使用 Cloudflare Worker + KV，所有访问同一静态页的人共享同一份数据。

## 1. 创建 Cloudflare KV

```bash
npx wrangler kv namespace create UXHUB_KV
```

把命令输出里的 `id` 填到 `wrangler.example.toml`，然后复制为 `wrangler.toml`：

```bash
cp wrangler.example.toml wrangler.toml
```

## 2. 设置写入密钥

建议设置写入密钥，避免任何人都能改数据：

```bash
npx wrangler secret put WRITE_TOKEN
```

输入一个足够长的随机字符串。

## 3. 部署 Worker

```bash
npx wrangler deploy --config wrangler.toml
```

部署后会得到一个类似下面的地址：

```text
https://shareagent-uxhub-api.<your-subdomain>.workers.dev
```

## 4. 配置静态页

编辑 `config.js`：

```js
window.UXHUB_CONFIG = {
  apiBaseUrl: "https://shareagent-uxhub-api.<your-subdomain>.workers.dev",
  writeToken: "你在第 2 步设置的 WRITE_TOKEN",
};
```

然后把 `UXhub/` 目录里的静态文件重新发布到线上。

## 数据说明

Worker 使用一个 KV key 保存完整数据：

```json
{
  "cards": {
    "links": [],
    "rivals": [],
    "members": []
  },
  "reports": [],
  "updatedAt": "2026-06-20T00:00:00.000Z"
}
```

前端仍会保留本地缓存：如果 API 临时不可用，页面还能读本地数据；网络恢复后，新的保存会继续写回远程。
