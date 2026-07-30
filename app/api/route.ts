import { streamObject } from "ai";
import { isSupportedImageType, schema } from "@/app/utils";

const systemPrompt = `Analyze this image for a fast alt-text and OCR utility.
DESCRIPTION: Write one concrete sentence of at most 30 words. Describe what the image is; do not quote or summarize its written content.
OCR: First identify the single primary content object. Transcribe every legible word and number inside that object, preserving useful line breaks. If the image is a screenshot, exclude app or browser chrome outside the primary post, email, document, code pane, card, or chart: status bars, navigation, sidebars, controls, recommendations, engagement counts, and unrelated panels. If there is no distinct focal object, transcribe all legible text. Never replace visible text with a summary.`;

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

	const { mediaType, image } = decodeBase64Image(base64);

	if (!mediaType || !image)
		return new Response("Invalid image data", { status: 400 });

	if (!isSupportedImageType(mediaType)) {
		return new Response(
			"Unsupported format. Only JPEG, PNG, GIF, and WEBP files are supported.",
			{ status: 400 }
		);
	}

	const result = streamObject({
		model: "openai/gpt-5-nano",
		maxOutputTokens: 800,
		providerOptions: {
			openai: {
				reasoningEffort: "minimal",
				textVerbosity: "low",
			},
		},
		schema,
		system: systemPrompt,
		messages: [
			{
				role: "user",
				content: [
					{
						type: "image",
						image,
						mediaType,
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
		mediaType: matches?.[1],
		image: matches?.[2],
	};
}
