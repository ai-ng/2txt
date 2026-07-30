import { z } from "zod";

type SupportedImageTypes =
	| "image/jpeg"
	| "image/png"
	| "image/gif"
	| "image/webp";

export function isSupportedImageType(
	type: string
): type is SupportedImageTypes {
	return ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(type);
}

export const schema = z.object({
	description: z
		.string()
		.describe(
			"One concrete sentence of 20 words or fewer describing the visual image, without quoting or summarizing its written content."
		),
	text: z
		.string()
		.describe(
			"Complete OCR text from the primary content object, preserving useful line breaks. Return an empty string only when no text is legible."
		),
});
