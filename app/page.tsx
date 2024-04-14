"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { IconCopy, IconLoader2, IconPhotoUp } from "@tabler/icons-react";
import { useCompletion } from "ai/react";
import { toast } from "sonner";
import Image from "next/image";
import { isSupportedImageType } from "@/app/utils";

export default function Home() {
	const [isDraggingOver, setIsDraggingOver] = useState(false);
	const [blobURL, setBlobURL] = useState<string | null>(null);
	const [finished, setFinished] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const { complete, completion, isLoading } = useCompletion({
		onError: (e) => {
			toast.error(e.message);
			setBlobURL(null);
		},
		onFinish: () => setFinished(true),
	});

	async function submit(file?: File | Blob) {
		if (!file) return;

		if (!isSupportedImageType(file.type)) {
			return toast.error(
				"Unsupported format. Only JPEG, PNG, GIF, and WEBP files are supported."
			);
		}

		if (file.size > 4.5 * 1024 * 1024) {
			return toast.error("Image too large, maximum file size is 4.5MB.");
		}

		const base64 = await toBase64(file);

		// roughly 4.5MB in base64
		if (base64.length > 6_464_471) {
			return toast.error("Image too large, maximum file size is 4.5MB.");
		}

		setBlobURL(URL.createObjectURL(file));
		setFinished(false);
		complete(base64);
	}

	function handleDragLeave() {
		setIsDraggingOver(false);
	}

	function handleDragOver(e: DragEvent) {
		setIsDraggingOver(true);
		e.preventDefault();
		e.stopPropagation();
		if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
	}

	async function handleDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		setIsDraggingOver(false);

		const file = e.dataTransfer?.files?.[0];
		submit(file);
	}

	useEffect(() => {
		addEventListener("paste", handlePaste);
		addEventListener("drop", handleDrop);
		addEventListener("dragover", handleDragOver);
		addEventListener("dragleave", handleDragLeave);

		return () => {
			removeEventListener("paste", handlePaste);
			removeEventListener("drop", handleDrop);
			removeEventListener("dragover", handleDragOver);
			removeEventListener("dragleave", handleDragLeave);
		};
	});

	async function handlePaste(e: ClipboardEvent) {
		const file = e.clipboardData?.files?.[0];
		submit(file);
	}

	async function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		submit(file);
	}

	const [description, text] = completion.split("▲");

	function copyBoth() {
		navigator.clipboard.writeText([description, text].join("\n"));
		toast.success("Copied to clipboard");
	}

	return (
		<>
			<div
				className={clsx(
					"rounded-lg border-4 drop-shadow-sm text-gray-700 dark:text-gray-300 cursor-pointer border-dashed transition-colors ease-in-out bg-gray-100 dark:bg-gray-900 relative group select-none grow pointer-events-none lg:pointer-events-auto",
					{
						"border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700":
							!isDraggingOver,
						"border-blue-300 dark:border-blue-700": isDraggingOver,
					}
				)}
				onClick={() => inputRef.current?.click()}
			>
				{blobURL && (
					<Image
						src={blobURL}
						unoptimized
						fill
						className="object-contain"
						alt="Uploaded image"
					/>
				)}

				<div
					className={clsx(
						"flex flex-col w-full h-full p-3 items-center justify-center text-center absolute bg-gray-100/70 dark:bg-gray-900/70 text-lg",
						{
							"opacity-0 group-hover:opacity-100 transition ease-in-out":
								completion,
						}
					)}
				>
					<p className="font-bold mb-4">Image to text, fast.</p>
					<p className="hidden lg:block">
						Drop or paste anywhere, or click to upload.
					</p>

					<div className="w-56 space-y-4 lg:hidden pointer-events-auto">
						<button className="rounded-full w-full py-3 bg-black dark:bg-white text-white dark:text-black">
							Tap to upload
						</button>

						<input
							type="text"
							readOnly
							placeholder="Hold to paste"
							onClick={(e) => e.stopPropagation()}
							className="text-center w-full rounded-full py-3 bg-gray-200 dark:bg-gray-800 placeholder-black dark:placeholder-white focus:bg-white dark:focus:bg-black focus:placeholder-gray-700 dark:focus:placeholder-gray-300 transition-colors ease-in-out focus:outline-none border-2 focus:border-blue-300 dark:focus:border-blue-700 border-transparent"
						/>
					</div>
				</div>

				<input
					type="file"
					className="hidden"
					ref={inputRef}
					onChange={handleInputChange}
					accept="image/jpeg, image/png, image/gif, image/webp"
				/>
			</div>

			{(isLoading || completion) && (
				<div className="space-y-3 basis-1/2 p-3 rounded-md bg-gray-100 dark:bg-gray-900 w-full drop-shadow-sm">
					<Section finished={finished} content={description}>
						Description
					</Section>
					<Section finished={finished} content={text}>
						Text
					</Section>
					{finished && text && (
						<button
							onClick={copyBoth}
							className="w-full lg:w-auto rounded-md bg-blue-200 dark:bg-blue-800 px-3 py-2"
						>
							Copy Both
						</button>
					)}
				</div>
			)}
		</>
	);
}

const Or = () => (
	<span className="text-gray-600 dark:text-gray-400 font-mono">or</span>
);

function toBase64(file: File | Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			if (typeof reader.result !== "string") return;
			resolve(reader.result);
		};
		reader.onerror = (error) => reject(error);
	});
}

function Section({
	children,
	content,
	finished,
}: {
	children: string;
	content?: string;
	finished: boolean;
}) {
	function copy() {
		navigator.clipboard.writeText(content || "");
		toast.success("Copied to clipboard");
	}

	const loading = !content && !finished;

	return (
		<div>
			{content && (
				<button
					className="float-right rounded-md p-1 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ease-in-out"
					onClick={copy}
					aria-label="Copy to clipboard"
				>
					<IconCopy />
				</button>
			)}
			<h2 className="text-xl font-semibold">{children}</h2>

			{loading && (
				<div className="bg-gray-200 dark:bg-gray-800 animate-pulse rounded w-full h-6" />
			)}
			{content && <p className="whitespace-pre-line">{content.trim()}</p>}
			{finished && !content && (
				<p className="text-gray-700 dark:text-gray-300">
					No text was found in that image.
				</p>
			)}
		</div>
	);
}
