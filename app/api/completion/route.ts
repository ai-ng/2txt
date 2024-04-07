"use server";

import Anthropic from "@anthropic-ai/sdk";
import { AnthropicStream, StreamingTextResponse } from "ai";

const anthropic = new Anthropic();

export async function POST(req: Request) {
	const { prompt } = await req.json();
	const { type, data } = decodeBase64Image(prompt);

	if (!type || !data)
		return new Response("Invalid image data", { status: 400 });

	if (!isSupportedImageType(type)) {
		return new Response(
			"Unsupported image format. Only JPEG, PNG, GIF, and WEBP files are supported.",
			{ status: 400 }
		);
	}

	// roughly 5MB in base64
	if (data.length > 7_182_745) {
		return new Response("Image too large, maximum file size is 5MB.", {
			status: 400,
		});
	}

	const response = await anthropic.messages.create({
		messages: [
			{
				role: "user",
				content: [
					{
						type: "text",
						text: "Respond with a JSON object with two keys: `description`, a description of the image to be used as alt text, and `text`, containing the text extracted from the image. If there is no text, set `text` to an empty string.",
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
				content: "{",
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
