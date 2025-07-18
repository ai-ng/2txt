# 2txt

Image to text, fast. Built with the [Vercel AI SDK](https://sdk.vercel.ai), [GPT 4.1-nano](https://platform.openai.com/docs/models/gpt-4.1-nano), and [Next.js](https://nextjs.org).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fai-ng%2F2txt&env=OPENAI_API_KEY&envDescription=Your%20OpenAI%20API%20key%20from%20platform.openai.com&envLink=https%3A%2F%2Fplatform.openai.com%2Fapi-keys&project-name=2txt&repository-name=2txt&demo-title=2txt&demo-description=Image%20to%20text%2C%20fast.&demo-url=https%3A%2F%2F2txt.vercel.app&demo-image=https%3A%2F%2F2txt.vercel.app%2Fopengraph-image.png)

## Developing

- Clone the repository
- Create a `.env.local` file with `AI_GATEWAY_API_KEY=your-api-key` where `your-api-key` is your [Vercel AI Gateway key](https://vercel.com/docs/ai-gateway#create-an-api-key-in-the-vercel-dashboard).
  - You can also authenticate with a Vercel OIDC token by linking to a Vercel project (`vercel link`) and pulling env variables (`vercel env pull`).
- Run `pnpm install` to install dependencies.
- Run `pnpm dev` to start the development server.
