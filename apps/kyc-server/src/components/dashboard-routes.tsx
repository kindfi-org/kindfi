import { renderToString } from 'react-dom/server'
import { corsConfig } from '../config/cors'
import { withCORS } from '../middleware/cors'
import {
	DashboardAnalytics,
	DashboardCustomers,
	DashboardOverview,
	DashboardProducts,
	DashboardSettings,
} from './dashboard-page'
import { DashboardLayout } from './dashboard-skeleton'

const withConfiguredCORS = (
	handler: (req: Request) => Response | Promise<Response>,
) => withCORS(handler, corsConfig)

// Mock user for development (replace with real auth)
function getMockUser() {
	return {
		name: 'John Doe',
		email: 'john@kindfi.com',
	}
}

function DashboardApp({
	children,
	currentPath,
	title,
}: {
	children: React.ReactNode
	currentPath: string
	title: string
}) {
	const user = getMockUser()

	return (
		<html lang="en">
			<head>
				<title>{title} - Kindfi KYC</title>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="description" content="Kindfi KYC Dashboard" />

				<style>
					{`
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            html, body {
              height: 100%;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #0f0f23;
              color: #e2e8f0;
            }
            
            #root {
              min-height: 100vh;
            }
            
            /* Focus styles for accessibility */
            button:focus-visible, 
            input:focus-visible, 
            a:focus-visible {
              outline: 2px solid #8b5cf6;
              outline-offset: 2px;
            }
          `}
				</style>
			</head>
			<body>
				<div id="root">
					<DashboardLayout currentPath={currentPath} user={user}>
						{children}
					</DashboardLayout>
				</div>
			</body>
		</html>
	)
}

function createDashboardRoute(
	path: string,
	component: React.ReactElement,
	title: string,
) {
	return {
		async GET(req: Request) {
			return withConfiguredCORS(async () => {
				const html = renderToString(
					<DashboardApp currentPath={path} title={title}>
						{component}
					</DashboardApp>,
				)

				return new Response(`<!DOCTYPE html>${html}`, {
					headers: {
						'Content-Type': 'text/html; charset=utf-8',
						'Cache-Control': 'no-cache, private',
					},
				})
			})(req)
		},
		OPTIONS: withConfiguredCORS(() => new Response(null)),
	}
}

export const dashboardRoutes = {
	'/dashboard': createDashboardRoute(
		'/dashboard',
		<DashboardOverview />,
		'Dashboard Overview',
	),

	'/dashboard/customers': createDashboardRoute(
		'/dashboard/customers',
		<DashboardCustomers />,
		'KYC Customers',
	),

	'/dashboard/products': createDashboardRoute(
		'/dashboard/products',
		<DashboardProducts />,
		'KYC Products',
	),

	'/dashboard/analytics': createDashboardRoute(
		'/dashboard/analytics',
		<DashboardAnalytics />,
		'KYC Analytics',
	),

	'/dashboard/settings': createDashboardRoute(
		'/dashboard/settings',
		<DashboardSettings />,
		'KYC Settings',
	),
}
