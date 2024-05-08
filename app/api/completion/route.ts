import { streamText, StreamingTextResponse } from "ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { isSupportedImageType } from "@/app/utils";
import { anthropic } from "@ai-sdk/anthropic";

const ratelimit =
	process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
		? new Ratelimit({
				redis: new Redis({
					url: process.env.KV_REST_API_URL,
					token: process.env.KV_REST_API_TOKEN,
				}),
				limiter: Ratelimit.slidingWindow(5, "30 m"),
				analytics: true,
		  })
		: false;

export async function POST(req: Request) {
	if (ratelimit) {
		const ip = req.headers.get("x-real-ip") ?? "local";
		const rl = await ratelimit.limit(ip);

		if (!rl.success) {
			return new Response("Rate limit exceeded", { status: 429 });
		}
	}

	const { prompt } = await req.json();

	// roughly 4.5MB in base64
	if (prompt.length > 6_464_471) {
		return new Response("Image too large, maximum file size is 4.5MB.", {
			status: 400,
		});
	}

	const { mimeType, image } = decodeBase64Image(prompt);

	if (!mimeType || !image)
		return new Response("Invalid image data", { status: 400 });

	if (!isSupportedImageType(mimeType)) {
		return new Response(
			"Unsupported format. Only JPEG, PNG, GIF, and WEBP files are supported.",
			{ status: 400 }
		);
	}

	const result = await streamText({
		messages: [
			{
				role: "user",
				content: [
					{
						type: "text",
						text: "Begin each of the following with a triangle symbol (▲ U+25B2): First, a brief description of the image to be used as alt text. Do not describe or extract text in the description. Second, the text extracted from the image, with newlines where applicable. Un-obstruct text if it is covered by something, to make it readable. If there is no text in the image, only respond with the description. Do not include any other information. Example: ▲ Lines of code in a text editor.▲ const x = 5; const y = 10; const z = x + y; console.log(z);",
					},
					{
						type: "image",
						image,
						mimeType,
					},
				],
			},
			{
				role: "assistant",
				content: [
					{
						type: "text",
						text: "▲",
					},
				],
			},
		],
		model: anthropic("claude-3-haiku-20240307"),
		maxTokens: 300,
	});

	return new StreamingTextResponse(result.toAIStream());
}

function decodeBase64Image(dataString: string) {
	const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

	return {
		mimeType: matches?.[1],
		image: matches?.[2],
	};
}
