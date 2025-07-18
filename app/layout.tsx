import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import clsx from "clsx";

export const metadata: Metadata = {
	title: "2txt",
	description: "Image to text, fast.",
};

const geistMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={clsx(
					geistMono.variable,
					"font-mono bg-gray-50 dark:bg-gray-950 text-black dark:text-white px-3 lg:px-10 py-4 lg:py-10 min-h-dvh flex flex-col"
				)}
			>
				<h1 className="font-semibold text-center text-2xl bg-linear-to-b dark:from-gray-50 dark:to-gray-200 from-gray-950 to-gray-800 bg-clip-text text-transparent select-none">
					2txt
				</h1>

				<main className="grow flex flex-col lg:flex-row gap-6 py-4 lg:py-10">
					{children}
				</main>

				<footer className="lg:flex flex-row justify-between text-center text-sm dark:text-gray-400 text-gray-600 select-none">
					<p>
						<A href="https://github.com/ai-ng">ai-ng</A> /{" "}
						<A href="https://nickoates.com">nick oates</A>
					</p>
					<p>
						Built with <A href="https://sdk.vercel.ai">Vercel AI SDK</A> &{" "}
						<A href="https://platform.openai.com/docs/models/gpt-4.1-nano">
							GPT 4.1-nano
						</A>
					</p>
					<p>
						<A href="https://github.com/ai-ng/2txt">source</A> /{" "}
						<A href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fai-ng%2F2txt&env=OPENAI_API_KEY&envDescription=Your%20OpenAI%20API%20key%20from%20platform.openai.com&envLink=https%3A%2F%2Fplatform.openai.com%2Fapi-keys&project-name=2txt&repository-name=2txt&demo-title=2txt&demo-description=Image%20to%20text%2C%20fast.&demo-url=https%3A%2F%2F2txt.vercel.app&demo-image=https%3A%2F%2F2txt.vercel.app%2Fopengraph-image.png">
							deploy
						</A>
					</p>
				</footer>

				<Toaster richColors theme="system" />
				<Analytics />
			</body>
		</html>
	);
}

function A(props: any) {
	return (
		<a {...props} className="text-black dark:text-white hover:underline" />
	);
}
