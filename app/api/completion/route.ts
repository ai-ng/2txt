import Anthropic from "@anthropic-ai/sdk";
import { AnthropicStream, StreamingTextResponse } from "ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const anthropic = new Anthropic();

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
	if (prompt.length > 7_000_000) {
		return new Response("Image too large, maximum file size is 4.5MB.", {
			status: 400,
		});
	}

	const { type, data } = decodeBase64Image(prompt);

	if (!type || !data)
		return new Response("Invalid image data", { status: 400 });

	if (!isSupportedImageType(type)) {
		return new Response(
			"Unsupported format. Only JPEG, PNG, GIF, and WEBP files are supported.",
			{ status: 400 }
		);
	}

	const response = await anthropic.messages.create({
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
						source: {
							type: "base64",
							media_type: type,
							data,
						},
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
		model: "claude-3-haiku-20240307",
		stream: true,
		max_tokens: 300,
	});

	const stream = AnthropicStream(response);
	return new StreamingTextResponse(stream);
}

function decodeBase64Image(dataString: string) {
	const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

	return {
		type: matches?.[1],
		data: matches?.[2],
	};
}

type SupportedImageTypes =
	| "image/jpeg"
	| "image/png"
	| "image/gif"
	| "image/webp";

export function isSupportedImageType(
	type: string
): type is SupportedImageTypes {
	return ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
		type
	);
}
