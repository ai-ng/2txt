import { streamObject } from "ai";
import { isSupportedImageType, schema } from "@/app/utils";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
	const base64 = await req.json();
	if (typeof base64 !== "string")
		return new Response("Invalid image data", { status: 400 });

	// roughly 4.5MB in base64
	if (base64.length > 6_464_471) {
		return new Response("Image too large, maximum file size is 4.5MB.", {
			status: 400,
		});
	}

	const { mimeType, image } = decodeBase64Image(base64);

	if (!mimeType || !image)
		return new Response("Invalid image data", { status: 400 });

	if (!isSupportedImageType(mimeType)) {
		return new Response(
			"Unsupported format. Only JPEG, PNG, GIF, and WEBP files are supported.",
			{ status: 400 }
		);
	}

	const result = streamObject({
		model: openai("gpt-4o-mini"),
		maxTokens: 300,
		schema,
		messages: [
			{
				role: "user",
				content: [
					{
						type: "image",
						image,
						mimeType,
					},
				],
			},
		],
	});

	return result.toTextStreamResponse();
}

function decodeBase64Image(dataString: string) {
	const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

	return {
		mimeType: matches?.[1],
		image: matches?.[2],
	};
}
