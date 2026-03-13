# Vercel Environment Variables Setup Guide

为了确保项目在 Vercel 上正常运行，你需要配置以下环境变量。

## 1. Pinterest Conversion API
用于服务端追踪 Pinterest 广告转化事件。

| Variable Name | Description | Value (Example/Source) |
| :--- | :--- | :--- |
| `PINTEREST_AD_ACCOUNT_ID` | Pinterest 广告账户 ID | `549764816116` (从代码中提取) |
| `PINTEREST_ACCESS_TOKEN` | Pinterest API 访问令牌 | `pina_...` (你的真实 Token) |

## 2. Stripe Payments (Live Mode)
用于处理真实的 Stripe 支付和订阅。

| Variable Name | Description | Value (Example/Source) |
| :--- | :--- | :--- |
| `STRIPE_SECRET_KEY` | Stripe Secret Key (Live) | `sk_live_...` |
| `STRIPE_PRICE_ID` | Stripe Price ID (Live) | `price_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Secret | `whsec_...` |

## 3. Expo & Frontend Configuration
用于前端构建和 API 连接。

| Variable Name | Description | Value (Example/Source) |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_API_BASE_URL` | 后端 API 地址 | 你的 Vercel 域名 (例如 `https://your-project.vercel.app`) |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase URL | 从 Supabase 面板获取 |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | 从 Supabase 面板获取 |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Publishable Key | `pk_live_...` (注意是 pk 开头) |
| `EXPO_PUBLIC_MIXPANEL_TOKEN` | Mixpanel Project Token | 从 Mixpanel 面板获取 |

## 4. Google Gemini AI (Backend)
如果后端使用 Google Gemini 生成内容。

| Variable Name | Description | Value (Example/Source) |
| :--- | :--- | :--- |
| `GOOGLE_GEMINI_API_KEY` | Google AI Studio Key | 你的 Gemini API Key |

---

### 如何在 Vercel 添加这些变量：

1.  进入 [Vercel Dashboard](https://vercel.com/dashboard)。
2.  选择你的项目 **casa-ai-assistant**。
3.  点击顶部的 **Settings** -> **Environment Variables**。
4.  逐个添加上述变量：
    *   **Key:** 填入表格中的 `Variable Name`。
    *   **Value:** 填入你的真实密钥。
    *   **Environment:** 勾选 Production, Preview, Development (建议全选)。
5.  添加完成后，**必须重新部署 (Redeploy)** 才能生效。
