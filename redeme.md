
# OpenAI API 代理服务 (DeepInfra)

这是一个基于 Cloudflare Workers 的 OpenAI API 兼容代理服务，专门用于访问 DeepInfra 平台上的各种大语言模型。该服务提供与 OpenAI API 兼容的接口，支持模型列表查询和聊天补全功能。

## 功能特点

- 🚀 **高性能代理**：基于 Cloudflare Workers 全球边缘网络，低延迟高可用
- 🔐 **可选鉴权**：支持通过 TOKEN 环境变量设置访问密钥
- 🌐 **CORS 支持**：完全支持跨域请求，方便前端应用集成
- 📋 **模型列表**：提供 23 种热门大语言模型的访问能力
- 🔄 **流式响应**：完整支持流式输出（SSE）和非流式响应
- 🛡️ **错误处理**：完善的错误处理和状态码返回

## 支持的模型

本服务支持以下 23 种模型，涵盖通用大模型、代码专用模型、多模态模型和高效小型模型：

### 通用大模型
- `deepseek-ai/DeepSeek-V3.1`
- `deepseek-ai/DeepSeek-R1-0528-Turbo`
- `deepseek-ai/DeepSeek-V3-0324-Turbo`
- `openai/gpt-oss-120b`
- `zai-org/GLM-4.5`
- `zai-org/GLM-4.5-Air`
- `moonshotai/Kimi-K2-Instruct`
- `meta-llama/Llama-3.3-70B-Instruct`

### 代码专用模型
- `Qwen/Qwen3-Coder-480B-A35B-Instruct-Turbo`
- `Qwen/Qwen3-Coder-480B-A35B-Instruct`
- `bigcode/starcoder2-15b`
- `Phind/Phind-CodeLlama-34B-v2`

### 多模态/特殊能力模型
- `allenai/olmOCR-7B-0725-FP8` (光学字符识别)
- `openai/whisper-tiny` (语音转文本)
- `mistralai/Voxtral-Small-24B-2507` (多模态)
- `mistralai/Voxtral-Mini-3B-2507` (多模态)

### 高效小型模型
- `Qwen/Qwen3-235B-A22B-Thinking-2507`
- `Qwen/Qwen3-235B-A22B-Instruct-2507`
- `Qwen/Qwen3-30B-A3B`
- `Qwen/Qwen3-32B`
- `Qwen/Qwen3-14B`
- `Gryphe/MythoMax-L2-13b`
- `openchat/openchat_3.5`

## 部署步骤

### 1. 安装 Wrangler CLI
```bash
npm install -g wrangler
```

### 2. 创建 Worker 项目
```bash
wrangler init openai-proxy
cd openai-proxy
```

### 3. 替换 Worker 代码
将 `wrangler.toml` 配置为：
```toml
name = "openai-proxy"
main = "src/index.js"
compatibility_date = "2024-05-29"

[env.production.vars]
# 可选：设置访问令牌
TOKEN = "your-secret-token"
```

将提供的代码保存到 `src/index.js`。

### 4. 部署到 Cloudflare
```bash
wrangler deploy
```

## 环境变量

| 变量名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| `TOKEN` | 字符串 | 可选 | API 访问令牌，如果设置则所有请求需要携带此令牌 |

## 使用示例

### 1. 获取模型列表

```bash
curl -X GET https://openai-proxy.<your-worker-subdomain>.workers.dev/v1/models \
  -H "Authorization: Bearer your-secret-token" \
  -H "Content-Type: application/json"
```

响应示例：
```json
{
  "object": "list",
  "data": [
    {
      "id": "deepseek-ai/DeepSeek-V3.1",
      "object": "model",
      "created": 1624980000,
      "owned_by": "deepseek-ai"
    },
    {
      "id": "openai/gpt-oss-120b",
      "object": "model",
      "created": 1625980000,
      "owned_by": "openai"
    },
    // ... 其他模型
  ]
}
```

### 2. 聊天补全请求

```bash
curl -X POST https://openai-proxy.<your-worker-subdomain>.workers.dev/v1/chat/completions \
  -H "Authorization: Bearer your-secret-token" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-ai/DeepSeek-V3.1",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Explain quantum computing in simple terms."}
    ],
    "stream": true
  }'
```

### 3. 在 JavaScript 中使用

```javascript
const response = await fetch('https://openai-proxy.<your-worker-subdomain>.workers.dev/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-secret-token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'deepseek-ai/DeepSeek-V3.1',
    messages: [
      { role: 'user', content: 'Hello, how are you?' }
    ],
    stream: false
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

## 注意事项

1. **鉴权设置**：如果设置了 `TOKEN` 环境变量，所有请求必须在 `Authorization` 头中携带有效的 Bearer Token
2. **CORS 限制**：虽然服务允许所有来源的跨域请求，但生产环境建议配置具体的允许域名
3. **模型限制**：实际可用模型取决于 DeepInfra 平台的当前状态，部分模型可能有使用限制
4. **费用说明**：本代理服务本身免费，但通过 DeepInfra API 的使用可能产生费用，请参考 DeepInfra 的定价
5. **速率限制**：Cloudflare Workers 有自己的请求限制（免费版每日 100,000 次请求），请根据需要升级计划
6. **错误处理**：当上游服务不可用时，代理会返回相应的错误信息和状态码

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 更新日志

### v1.0.0
- 初始版本发布
- 支持 23 种流行大语言模型
- 实现完整的 OpenAI API 兼容接口
- 添加 CORS 支持和可选鉴权功能
