import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
	title: "2txt",
	description: "Image to text, fast.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${GeistSans.variable} ${GeistMono.variable} font-mono bg-gray-50 dark:bg-gray-950 text-black dark:text-white px-3 lg:px-10 py-4 lg:py-10 min-h-dvh flex flex-col`}
			>
				<h1 className="font-semibold text-center text-2xl bg-gradient-to-b dark:from-gray-50 dark:to-gray-200 from-gray-950 to-gray-800 bg-clip-text text-transparent select-none">
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
						Built with{" "}
						<A href="https://sdk.vercel.ai">Vercel AI SDK</A> &{" "}
						<A href="https://claude.ai/">Claude</A>
					</p>
					<p>
						<A href="https://github.com/ai-ng/2txt">source</A> /{" "}
						<A href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fai-ng%2F2txt&env=ANTHROPIC_API_KEY&envDescription=Your%20Anthropic%20API%20key%20from%20https%3A%2F%2Fconsole.anthropic.com&envLink=https%3A%2F%2Fconsole.anthropic.com%2F&project-name=2txt&repository-name=2txt&demo-title=2txt&demo-description=Image%20to%20text%2C%20fast.&demo-url=https%3A%2F%2F2txt.vercel.app&demo-image=https%3A%2F%2F2txt.vercel.app%2Fopengraph-image.png">
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
