/** @type {import('next').NextConfig} */
const nextConfig = {
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "Content-Security-Policy",
						value: "frame-ancestors 'none'",
					},
				],
			},
		];
	},
};

export default nextConfig;
