"use server";

import Anthropic from "@anthropic-ai/sdk";
import { AnthropicStream, StreamingTextResponse } from "ai";

const anthropic = new Anthropic();

const supportedImageTypes = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
];

export async function POST(req: Request) {
	const { prompt } = await req.json();
	const { type, data } = decodeBase64Image(prompt);
	// return console.log(prompt);

	// if (!image) return "No image provided";
	// if (!supportedImageTypes.includes(image.type))
	// 	return "Unsupported image format";
	// if (image.size > 5 * 1024 * 1024) return "Image too large";

	// const imageBase64 = await getBase64(image);

	// return console.log(image);

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
							media_type: type as
								| "image/jpeg"
								| "image/png"
								| "image/gif"
								| "image/webp",
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
	if (matches?.length !== 3) {
		throw new Error("Invalid input string");
	}

	return {
		type: matches[1],
		data: matches[2],
	};
}
