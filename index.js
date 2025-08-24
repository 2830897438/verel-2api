export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 处理 CORS 预检请求
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // 处理 /v1/models 请求
    if (url.pathname === "/v1/models" && request.method === "GET") {
      // 鉴权验证
      if (env.TOKEN) {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || authHeader !== `Bearer ${env.TOKEN}`) {
          return new Response("Unauthorized", { 
            status: 401,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
      }

      // 构建模型列表（使用您提供的23个模型）
      const modelIds = [
        "deepseek-ai/DeepSeek-V3.1",
        "openai/gpt-oss-120b",
        "Qwen/Qwen3-Coder-480B-A35B-Instruct-Turbo",
        "zai-org/GLM-4.5",
        "moonshotai/Kimi-K2-Instruct",
        "allenai/olmOCR-7B-0725-FP8",
        "Qwen/Qwen3-235B-A22B-Thinking-2507",
        "Qwen/Qwen3-Coder-480B-A35B-Instruct",
        "zai-org/GLM-4.5-Air",
        "mistralai/Voxtral-Small-24B-2507",
        "mistralai/Voxtral-Mini-3B-2507",
        "deepseek-ai/DeepSeek-R1-0528-Turbo",
        "Qwen/Qwen3-235B-A22B-Instruct-2507",
        "Qwen/Qwen3-30B-A3B",
        "Qwen/Qwen3-32B",
        "Qwen/Qwen3-14B",
        "deepseek-ai/DeepSeek-V3-0324-Turbo",
        "bigcode/starcoder2-15b",
        "Phind/Phind-CodeLlama-34B-v2",
        "Gryphe/MythoMax-L2-13b",
        "openchat/openchat_3.5",
        "openai/whisper-tiny",
        "meta-llama/Llama-3.3-70B-Instruct"
      ];

      const baseTimestamp = 1624980000;
      const models = {
        object: "list",
        data: modelIds.map((id, index) => {
          // 提取所有者：取第一个'/'之前的部分
          const owner = id.split('/')[0];
          return {
            id: id,
            object: "model",
            created: baseTimestamp + index * 1000000,
            owned_by: owner
          };
        })
      };

      return new Response(JSON.stringify(models), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // 处理其他 POST 请求
    if (request.method !== "POST") {
      return new Response("Method not allowed", { 
        status: 405,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // 验证鉴权头
    const authHeader = request.headers.get("Authorization");
    if (env.TOKEN) {
      if (!authHeader || authHeader !== `Bearer ${env.TOKEN}`) {
        return new Response("Unauthorized", { 
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }

    try {
      // 原始请求处理逻辑
      const body = await request.json();
      const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
        "Accept": "text/event-stream",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Content-Type": "application/json",
        "sec-ch-ua-platform": "Windows",
        "X-Deepinfra-Source": "web-page",
        "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Microsoft Edge\";v=\"133\", \"Chromium\";v=\"133\"",
        "sec-ch-ua-mobile": "?0",
        "Origin": "https://deepinfra.com",
        "Sec-Fetch-Site": "same-site",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Referer": "https://deepinfra.com/"
      };

      const response = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body)
      });

      return new Response(response.body, {
        status: response.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": response.headers.get("Content-Type")
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
};
