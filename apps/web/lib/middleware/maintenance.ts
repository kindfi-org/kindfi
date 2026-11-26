import { type NextRequest, NextResponse } from 'next/server'

const maintenancePage = `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="theme-color" content="#f5f8ee">
	<title>KindFi is under maintenance</title>
	<link rel="icon" href="/favicon.ico">
	<style>
		* { box-sizing: border-box; }
		body {
			min-height: 100vh;
			min-height: 100svh;
			margin: 0;
			padding: clamp(2rem, 6vw, 5rem);
			display: grid;
			grid-template-rows: auto 1fr;
			color: #001241;
			background: #f5f8ee;
			font-family: system-ui, sans-serif;
		}
		header, main { width: min(100%, 64rem); margin-inline: auto; }
		header img { display: block; width: 9rem; height: auto; }
		main { align-self: center; padding-block: 3rem; }
		main::before {
			content: "";
			display: block;
			width: 3rem;
			height: 0.25rem;
			margin-bottom: 1.5rem;
			background: #7cc635;
		}
		h1 {
			max-width: 15ch;
			margin: 0;
			font-size: clamp(2.5rem, 7.5vw, 6rem);
			font-weight: 740;
			letter-spacing: -0.06em;
			line-height: 1.05;
		}
		p {
			max-width: 35ch;
			margin: 1.5rem 0 0;
			color: #43534a;
			font-size: clamp(1.0625rem, 2.2vw, 1.375rem);
			line-height: 1.6;
		}
	</style>
</head>
<body>
	<header><img src="/icons/logo-org.svg" alt="KindFi" width="724" height="202"></header>
	<main>
		<h1>KindFi is under maintenance</h1>
		<p>Updates will be shared soon. All past activity remains protected.</p>
	</main>
</body>
</html>`

export function getMaintenanceResponse(request: NextRequest): NextResponse | undefined {
	const mode = process.env.MAINTENANCE_MODE
	const enabled = mode === 'true' || (mode !== 'false' && process.env.VERCEL_ENV === 'production')
	const { pathname } = request.nextUrl
	if (!enabled || pathname.startsWith('/api/') || pathname === '/notification-worker.js') {
		return
	}

	return new NextResponse(request.method === 'HEAD' ? null : maintenancePage, {
		status: 503,
		headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
	})
}
