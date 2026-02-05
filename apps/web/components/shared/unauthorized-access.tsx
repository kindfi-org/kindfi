import { AlertCircle, ArrowLeft, Shield } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'

interface UnauthorizedAccessProps {
	userRole?: string | null
}

export function UnauthorizedAccess({ userRole }: UnauthorizedAccessProps) {
	return (
		<div className="container mx-auto px-4 py-16">
			<div className="max-w-2xl mx-auto">
				<Card className="border-destructive/50">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
							<Shield className="h-8 w-8 text-destructive" />
						</div>
						<CardTitle className="text-2xl">Access Restricted</CardTitle>
						<CardDescription className="text-base">
							You don't have permission to access this page
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="rounded-lg bg-muted p-4">
							<div className="flex items-start gap-3">
								<AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
								<div className="space-y-2">
									<p className="text-sm font-medium">
										This page is only available to project creators and
										administrators.
									</p>
									{userRole && (
										<p className="text-xs text-muted-foreground">
											Your current role:{' '}
											<span className="font-medium capitalize">{userRole}</span>
										</p>
									)}
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<p className="text-sm text-muted-foreground">
								To create projects on KindFi, you need to have a{' '}
								<span className="font-medium text-foreground">Creator</span> or{' '}
								<span className="font-medium text-foreground">Admin</span> role.
							</p>

							<div className="flex flex-col sm:flex-row gap-3">
								<Button asChild variant="default" className="flex-1">
									<Link href="/profile">Update Role</Link>
								</Button>
								<Button asChild variant="outline" className="flex-1">
									<Link href="/projects">
										<ArrowLeft className="mr-2 h-4 w-4" />
										Browse Projects
									</Link>
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
