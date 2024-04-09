"use server";

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

	// roughly 5MB in base64
	if (prompt.length > 7_182_745) {
		return new Response("Image too large, maximum file size is 5MB.", {
			status: 400,
		});
	}

	const { type, data } = decodeBase64Image(prompt);

	if (!type || !data)
		return new Response("Invalid image data", { status: 400 });

	if (!isSupportedImageType(type)) {
		return new Response(
			"Unsupported image format. Only JPEG, PNG, GIF, and WEBP files are supported.",
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
						text: "Only respond with the following: a description of the image to be used as alt text, and the text extracted from the image. Begin each one with a triangle symbol (▲ U+25B2). If there is no text, only respond with the description. Do not include any other information.",
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

function isSupportedImageType(type: string): type is SupportedImageTypes {
	return ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
		type
	);
}
