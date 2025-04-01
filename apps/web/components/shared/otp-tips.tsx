import { AlertTriangle, CheckCircle, Clock, Info, Mail } from 'lucide-react'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'

export function OTPTips() {
	return (
		<Card aria-labelledby="otp-tips-title">
			<CardHeader className="pb-2">
				<CardTitle
					id="otp-tips-title"
					className="flex items-center gap-2 text-base font-medium"
				>
					<Info className="h-4 w-4 text-blue-500" aria-hidden="true" />
					Quick Tips
				</CardTitle>
			</CardHeader>
			<CardContent className="pb-4 pt-0 text-sm">
				<ul className="space-y-3 list-none">
					<li className="flex gap-2">
						<Clock
							className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground"
							aria-hidden="true"
						/>
						<p>
							<span
								className="font-medium text-blue-500"
								aria-label="What is an OTP?"
							>
								What is an OTP?
							</span>
							<span>
								{' '}
								A one-time password is a 6-digit code sent to verify your
								identity.
							</span>
						</p>
					</li>

					<li className="flex gap-2">
						<Mail
							className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground"
							aria-hidden="true"
						/>
						<p>
							<span
								className="font-medium text-green-500"
								aria-label="Check your inbox:"
							>
								Check your inbox
							</span>
							<span>
								{' '}
								- The code should arrive within 1 minute. Check your spam folder
								if you don't see it.
							</span>
						</p>
					</li>

					<li className="flex gap-2">
						<AlertTriangle
							className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground"
							aria-hidden="true"
						/>
						<p>
							<span
								className="font-medium text-red-500"
								aria-label="Important security warning:"
							>
								Never share your OTP
							</span>
							<span>
								{' '}
								- Our team will never ask for your OTP via phone or email.
							</span>
						</p>
					</li>

					<li className="flex gap-2">
						<CheckCircle
							className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground"
							aria-hidden="true"
						/>
						<p>
							<span className="font-medium">Enter all digits</span>
							<span>
								{' '}
								- Make sure to enter all 6 digits to proceed with verification.
							</span>
						</p>
					</li>
				</ul>
			</CardContent>
		</Card>
	)
}
