import type { NextRequest } from "next/server";

const blockedCountries = process.env.BLOCKED_COUNTRIES?.split(" ");

export function middleware(req: NextRequest) {
	if (!req.geo || !blockedCountries) return;
	const country = req.geo.country || "US";

	if (blockedCountries.includes(country)) {
		return new Response("Blocked", { status: 403 });
	}
}
