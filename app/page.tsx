"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { IconCopy, IconLoader2, IconPhotoUp } from "@tabler/icons-react";
import { useCompletion } from "ai/react";
import { toast } from "sonner";
import Image from "next/image";

export default function Home() {
	const [isDraggingOver, setIsDraggingOver] = useState(false);
	const [blobURL, setBlobURL] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const { complete, completion, isLoading } = useCompletion({
		onError: (e) => toast.error(e.message),
	});

	async function submit(file?: File) {
		if (!file) return;
		setBlobURL(URL.createObjectURL(file));
		const base64 = await toBase64(file);
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

	return (
		<main className="grow flex items-center justify-center py-6">
			<div className="flex flex-col lg:flex-row gap-3 w-full justify-center">
				<div
					className={clsx(
						"h-72 md:h-96 lg:max-w-xl rounded-lg border-4 drop-shadow-sm text-gray-700 dark:text-gray-300 cursor-pointer border-dashed transition-colors ease-in-out bg-gray-100 dark:bg-gray-900 relative w-full group",
						{
							"border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700":
								!isDraggingOver,
							"border-blue-300 dark:border-blue-700":
								isDraggingOver,
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
							"pointer-events-none flex flex-col w-full h-full p-3 gap-4 items-center justify-center text-center absolute",
							{
								"opacity-0 group-hover:opacity-100 transition ease-in-out bg-gray-100/50 dark:bg-gray-900/50":
									blobURL,
							}
						)}
					>
						{isLoading ? (
							<IconLoader2 className="size-12 pointer-events-none animate-spin" />
						) : (
							<IconPhotoUp className="size-12 pointer-events-none" />
						)}
						<p>
							drop <Or /> paste <Or /> click to upload
						</p>
					</div>

					<input
						type="file"
						className="hidden"
						ref={inputRef}
						onChange={handleInputChange}
					/>
				</div>

				{(isLoading || completion) && (
					<div className="space-y-3 w-full lg:max-w-96">
						<Section content={description}>Description</Section>
						<Section content={text}>Text</Section>
					</div>
				)}
			</div>
		</main>
	);
}

const Or = () => (
	<span className="text-gray-600 dark:text-gray-400 font-mono">or</span>
);

function toBase64(file: File): Promise<string> {
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
}: {
	children: string;
	content?: string;
}) {
	function copy() {
		navigator.clipboard.writeText(content || "");
		toast.success("Copied to clipboard");
	}

	return (
		<div className="p-3 rounded-md bg-gray-100 dark:bg-gray-900 w-full drop-shadow-sm">
			<button
				className="float-right rounded-md p-1 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ease-in-out"
				onClick={copy}
				aria-label="Copy to clipboard"
			>
				<IconCopy />
			</button>
			<h2 className="text-xl font-semibold">{children}</h2>
			<p className="whitespace-pre-line">
				{content?.trim() || "No text found"}
			</p>
		</div>
	);
}
