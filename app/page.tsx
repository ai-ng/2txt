import { Dropzone } from "@/app/components/Dropzone";

export default function Home() {
	return (
		<>
			<h1 className="font-semibold text-center text-xl bg-gradient-to-b dark:from-gray-50 dark:to-gray-200 from-gray-950 to-gray-800 bg-clip-text text-transparent">
				2txt
			</h1>
			<div className="grow items-center flex justify-center">
				<Dropzone />
			</div>
		</>
	);
}
