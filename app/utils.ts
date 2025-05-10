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
			"A brief description of the image to be used as alt text. In this description, do not describe or extract text from the image. Example: Lines of code in a text editor."
		),
	text: z
		.string()
		.optional()
		.describe(
			"The text OCR extracted from the image, if any. Include newlines where applicable. Un-obstruct text if there is something covering it, to make it readable. Example: const x = 5; const y = 10; const z = x + y; console.log(z);"
		),
});
