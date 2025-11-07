import { zodResolver } from '@hookform/resolvers/zod'
import {
	CheckCircle2,
	Clock,
	ExternalLink, // add this import
	FileText,
	Monitor,
	ShieldCheck,
	XCircle,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Badge } from '~/components/base/badge'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from '~/components/base/form'
import { Label } from '~/components/base/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import { STATUS_OPTIONS } from '~/lib/constants/dashboard'
import type { KycDetailsFormData } from '~/lib/types/dashboard'

// Schema for the KYC details form - matches KycDetailsFormData
const kycDetailsFormSchema = z.object({
	userId: z.string(),
	email: z.string().nullable(),
	displayName: z.string().nullable(),
	status: z.enum(['pending', 'approved', 'rejected', 'verified']),
	verificationLevel: z.enum(['basic', 'enhanced']),
	notes: z.string().nullable().optional(),
	createdAt: z.string(),
	updatedAt: z.string(),
	kycId: z.string().optional(),
})

type KycDetailsFormSchema = z.infer<typeof kycDetailsFormSchema>

interface KycDetailsFormProps {
	data: KycDetailsFormData
}

function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 Bytes'
	const k = 1024
	const sizes = ['Bytes', 'KB', 'MB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
}

function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

function formatDateTime(dateString: string): string {
	return new Date(dateString).toLocaleString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

export function KycDetailsForm({ data }: KycDetailsFormProps) {
	const form = useForm<KycDetailsFormSchema>({
		resolver: zodResolver(kycDetailsFormSchema),
		defaultValues: {
			userId: data.userId,
			email: data.email,
			displayName: data.displayName,
			status: data.status,
			verificationLevel: data.verificationLevel,
			notes: data.notes || '',
			createdAt: data.createdAt,
			updatedAt: data.updatedAt,
			kycId: data.kycId,
		},
	})

	const statusConfig = STATUS_OPTIONS[data.status]
	const StatusIcon = statusConfig.icon

	return (
		<Form {...form}>
			<form className="flex flex-col gap-6">
				{/* User Information Section */}
				<section className="space-y-3">
					<h3 className="text-sm font-semibold text-foreground">
						User Information
					</h3>

					<div className="space-y-2">
						{/* Email and Display Name */}
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<div className="space-y-1.5">
								<Label className="text-xs font-medium text-muted-foreground">
									Email
								</Label>
								<p className="text-sm font-medium text-foreground">
									{data.email || 'N/A'}
								</p>
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-medium text-muted-foreground">
									Full Name
								</Label>
								<p className="text-sm font-medium text-foreground">
									{data.displayName || 'N/A'}
								</p>
							</div>
						</div>

						{/* User ID */}
						<div className="space-y-1.5">
							<Label className="text-xs font-medium text-muted-foreground">
								User ID
							</Label>
							<p className="text-xs font-mono text-muted-foreground break-all">
								{data.userId}
							</p>
						</div>
					</div>
				</section>

				{/* Device Information Section */}
				{data.devices.count > 0 && (
					<section className="space-y-3">
						<div className="flex items-center gap-2">
							<Monitor className="h-4 w-4 text-muted-foreground" />
							<h3 className="text-sm font-semibold text-foreground">
								Registered Devices ({data.devices.count})
							</h3>
						</div>

						<div className="space-y-2">
							{data.devices.devices.slice(0, 3).map((device) => {
								// Rename "Unnamed Device" to "Main Device"
								const deviceDisplayName =
									device.deviceName?.toLowerCase() === 'unnamed device' ||
									!device.deviceName
										? 'Main Device'
										: device.deviceName

								return (
									<div
										key={device.id}
										className="rounded-lg border border-border bg-muted/30 p-3 space-y-2"
									>
										{/* Device Name and Badges */}
										<div className="flex items-start justify-between">
											<div className="flex-1 space-y-2">
												<p className="text-sm font-medium text-foreground">
													{deviceDisplayName}
												</p>
												<div className="flex flex-wrap gap-2">
													<Badge variant="outline" className="text-xs">
														{device.deviceType === 'multi_device'
															? 'Multi-Device'
															: 'Single Device'}
													</Badge>
													<Badge
														variant={
															device.backupState === 'backed_up'
																? 'default'
																: 'secondary'
														}
														className="text-xs"
													>
														{device.backupState === 'backed_up'
															? 'Backed Up'
															: 'Not Backed Up'}
													</Badge>
												</div>
											</div>
											<div className="text-right flex-shrink-0 ml-2">
												<p className="text-xs text-muted-foreground">
													{device.lastUsedAt
														? `Used ${formatDate(device.lastUsedAt)}`
														: 'Never used'}
												</p>
											</div>
										</div>

										{/* Stellar Data */}
										<div className="space-y-2">
											<div className="flex flex-col gap-1">
												<Label className="text-xs font-medium text-muted-foreground">
													Stellar Smart Wallet
												</Label>
												<a
													href={`https://stellar.expert/explorer/testnet/contract/${device.address}`}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-1 text-base font-mono text-foreground whitespace-pre-line break-all bg-background/50 rounded px-2 py-1 border border-border/50 mb-0 hover:text-blue-600 transition-colors group"
												>
													{device.address}
													<ExternalLink
														className="h-3.5 w-3.5 text-muted-foreground group-hover:text-blue-600 transition-colors"
														aria-label="Open in Stellar Expert"
													/>
												</a>
											</div>
											<div className="flex flex-col gap-1">
												<Label className="text-xs font-medium text-muted-foreground">
													Public Key
												</Label>
												<p className="text-xs font-mono text-foreground whitespace-pre-line break-all bg-background/50 rounded px-2 py-1 border border-border/50 mb-0">
													{device.publicKey}
												</p>
											</div>
										</div>
									</div>
								)
							})}
							{data.devices.count > 3 && (
								<p className="text-xs text-muted-foreground text-center pt-1">
									+{data.devices.count - 3} more device
									{data.devices.count - 3 > 1 ? 's' : ''}
								</p>
							)}
						</div>
					</section>
				)}

				{/* KYC Status Section */}
				<section className="space-y-3">
					<h3 className="text-sm font-semibold text-foreground">KYC Status</h3>

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						{/* Status - Read Only with Icon */}
						<FormField
							control={form.control}
							name="status"
							render={() => (
								<FormItem>
									<FormLabel className="text-xs font-medium text-muted-foreground">
										Current Status
									</FormLabel>
									<div
										className={`flex items-center gap-2 rounded-md border ${statusConfig.borderColor} ${statusConfig.bgColor} px-3 py-2`}
									>
										<StatusIcon
											className={`h-4 w-4 ${statusConfig.color}`}
											aria-hidden="true"
										/>
										<span
											className={`text-sm font-medium ${statusConfig.color}`}
										>
											{statusConfig.label}
										</span>
									</div>
								</FormItem>
							)}
						/>

						{/* Verification Level */}
						<FormField
							control={form.control}
							name="verificationLevel"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs font-medium text-muted-foreground">
										Verification Level
									</FormLabel>
									<Select value={field.value} disabled>
										<FormControl>
											<SelectTrigger
												aria-label="Verification level"
												className="bg-muted/30"
											>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="basic">Basic</SelectItem>
											<SelectItem value="enhanced">Enhanced</SelectItem>
										</SelectContent>
									</Select>
								</FormItem>
							)}
						/>
					</div>

					{/* // TODO: Implement right timestamps. These should be with profile creation and update dates */}
					{/* Timestamps */}
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<Label className="text-xs font-medium text-muted-foreground">
								Created
							</Label>
							<p className="text-xs text-foreground">
								{formatDateTime(data.createdAt)}
							</p>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs font-medium text-muted-foreground">
								Last Updated
							</Label>
							<p className="text-xs text-foreground">
								{formatDateTime(data.updatedAt)}
							</p>
						</div>
					</div>
				</section>

				{/* Documents Section */}
				<section className="space-y-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<FileText className="h-4 w-4 text-muted-foreground" />
							<h3 className="text-sm font-semibold text-foreground">
								KYC Documents
							</h3>
						</div>
						{data.documents.hasDocuments && (
							<Badge variant="secondary" className="text-xs">
								{data.documents.documentCount} file
								{data.documents.documentCount !== 1 ? 's' : ''}
							</Badge>
						)}
					</div>

					{data.documents.hasDocuments ? (
						<div className="space-y-2">
							{data.documents.documents.map((doc, index) => (
								<div
									key={`${doc.name}-${index}`}
									className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
								>
									<div className="flex items-center gap-2 flex-1 min-w-0">
										<FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
										<div className="min-w-0 flex-1">
											<p className="text-sm font-medium text-foreground truncate">
												{doc.name}
											</p>
											<p className="text-xs text-muted-foreground">
												{formatBytes(doc.size)}
											</p>
										</div>
									</div>
									<div className="text-right flex-shrink-0 ml-2">
										<p className="text-xs text-muted-foreground">
											{formatDate(doc.updatedAt)}
										</p>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
							<FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
							<p className="text-sm text-muted-foreground">
								No documents uploaded
							</p>
							<p className="text-xs text-muted-foreground mt-1">
								User hasn't submitted KYC documents yet
							</p>
						</div>
					)}
				</section>

				{/* Verification Summary */}
				<section className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
					<h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">
						Verification Checklist
					</h4>
					<div className="space-y-1.5">
						<div className="flex items-center justify-between">
							<span className="text-xs text-muted-foreground">
								Profile Created
							</span>
							<CheckCircle2
								className={`h-4 w-4 ${data.verification.hasProfile ? 'text-green-600' : 'text-gray-300'}`}
							/>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-xs text-muted-foreground">
								KYC Record Exists
							</span>
							{data.verification.hasKycRecord ? (
								<CheckCircle2 className="h-4 w-4 text-green-600" />
							) : (
								<XCircle className="h-4 w-4 text-gray-300" />
							)}
						</div>
						<div className="flex items-center justify-between">
							<span className="text-xs text-muted-foreground">
								Documents Uploaded
							</span>
							{data.verification.hasDocuments ? (
								<CheckCircle2 className="h-4 w-4 text-green-600" />
							) : (
								<XCircle className="h-4 w-4 text-gray-300" />
							)}
						</div>
						<div className="flex items-center justify-between pt-1 border-t border-border">
							<span className="text-xs font-medium text-foreground">
								Verification Complete
							</span>
							{data.verification.isComplete ? (
								<CheckCircle2 className="h-4 w-4 text-green-600" />
							) : (
								<Clock className="h-4 w-4 text-yellow-600" />
							)}
						</div>
					</div>
				</section>
			</form>
		</Form>
	)
}
