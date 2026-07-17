'use client'

import {
	IoCheckmarkCircleOutline,
	IoCloseCircleOutline,
	IoFlashOutline,
	IoOpenOutline,
	IoWalletOutline,
} from 'react-icons/io5'
import { Alert, AlertDescription, AlertTitle } from '~/components/base/alert'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/base/tabs'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'
import { MODULES, REPUTATION_EVENTS } from './admin-gamification-triggers/constants'
import { useAdminGamificationTriggerForm } from './admin-gamification-triggers/hooks/use-admin-gamification-trigger-form'
import type { TriggerResponse } from './admin-gamification-triggers/types'

const truncateAddress = (value: string) => `${value.slice(0, 6)}…${value.slice(-6)}`

function TriggerResultBanner({ result }: { result: TriggerResponse | null }) {
	if (!result) return null

	const isSuccess = result.success
	return (
		<Alert variant={isSuccess ? 'default' : 'destructive'} className="mt-4">
			{isSuccess ? (
				<IoCheckmarkCircleOutline className="h-4 w-4" />
			) : (
				<IoCloseCircleOutline className="h-4 w-4" />
			)}
			<AlertTitle className="flex items-center gap-2">
				{isSuccess ? 'Transaction submitted' : 'Trigger failed'}
				{result.module ? (
					<Badge variant="outline" className="font-normal">
						{result.module}/{result.action}
					</Badge>
				) : null}
			</AlertTitle>
			<AlertDescription className="space-y-2">
				{result.error ? <p>{result.error}</p> : null}
				{result.txHash ? (
					<p className="break-all font-mono text-xs">Tx: {result.txHash}</p>
				) : (
					isSuccess && (
						<p className="text-xs text-muted-foreground">
							No transaction hash returned (governance CLI invokes may omit explorer links).
						</p>
					)
				)}
				{result.explorerUrl ? (
					<a
						href={result.explorerUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1 text-sm underline underline-offset-2"
					>
						View on Stellar Expert
						<IoOpenOutline className="h-3.5 w-3.5" />
					</a>
				) : null}
				{result.data && Object.keys(result.data).length > 0 ? (
					<pre className="mt-2 overflow-x-auto rounded-md bg-muted p-2 text-xs">
						{JSON.stringify(result.data, null, 2)}
					</pre>
				) : null}
			</AlertDescription>
		</Alert>
	)
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="space-y-2">
			<Label>{label}</Label>
			{children}
		</div>
	)
}

function ConnectedWalletBanner({
	address,
	walletName,
	isConnected,
	isInitialized,
	onConnect,
	onDisconnect,
}: {
	address: string | null
	walletName: string | null
	isConnected: boolean
	isInitialized: boolean
	onConnect: () => void
	onDisconnect: () => void
}) {
	if (!isInitialized) {
		return (
			<div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
				<IoWalletOutline className="h-4 w-4 shrink-0" />
				Loading wallet…
			</div>
		)
	}

	if (!isConnected || !address) {
		return (
			<div className="flex flex-col gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-start gap-3 text-sm">
					<IoWalletOutline className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
					<div>
						<p className="font-medium">Connect a Stellar wallet</p>
						<p className="text-muted-foreground">
							Triggers run against your connected Stellar Wallets Kit address.
						</p>
					</div>
				</div>
				<Button type="button" size="sm" onClick={onConnect}>
					Connect wallet
				</Button>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-start gap-3 text-sm">
				<IoWalletOutline className="mt-0.5 h-4 w-4 shrink-0" />
				<div className="min-w-0">
					<p className="font-medium">Connected{walletName ? ` · ${walletName}` : ''}</p>
					<p className="truncate font-mono text-xs text-muted-foreground" title={address}>
						{truncateAddress(address)}
					</p>
				</div>
			</div>
			<Button type="button" size="sm" variant="outline" onClick={onDisconnect}>
				Disconnect
			</Button>
		</div>
	)
}

export function AdminGamificationTriggers() {
	const { address, walletName, isConnected, isInitialized, connect, disconnect } = useWallet()
	const form = useAdminGamificationTriggerForm(address)

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<div className="flex items-start gap-3">
						<div className="rounded-md bg-amber-500/10 p-2 text-amber-700 dark:text-amber-400">
							<IoFlashOutline className="h-5 w-5" />
						</div>
						<div className="space-y-1">
							<CardTitle>Contract Triggers</CardTitle>
							<CardDescription>
								Admin-only tools to invoke the same production contract methods (NFT, Reputation,
								Quest, Streak, Referral, Governance) without going through donations. Calls are
								on-chain only and do not update gamification database tables.
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<ConnectedWalletBanner
						address={address}
						walletName={walletName}
						isConnected={isConnected}
						isInitialized={isInitialized}
						onConnect={connect}
						onDisconnect={disconnect}
					/>

					<Tabs value={form.activeModule} onValueChange={form.setActiveModule}>
						<TabsList className="mb-4 flex h-auto flex-wrap gap-1">
							{MODULES.map((m) => (
								<TabsTrigger key={m.id} value={m.id} className="text-xs sm:text-sm">
									{m.label}
								</TabsTrigger>
							))}
						</TabsList>

						<TabsContent value="streak" className="space-y-4">
							<p className="text-sm text-muted-foreground">
								Calls <code className="text-xs">streak.record_donation</code> for your connected
								wallet (awards reputation via CPI when the streak continues).
							</p>
							<Field label="Period">
								<Select
									value={form.period}
									onValueChange={(v) => form.setPeriod(v as 'weekly' | 'monthly')}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="weekly">Weekly</SelectItem>
										<SelectItem value="monthly">Monthly</SelectItem>
									</SelectContent>
								</Select>
							</Field>
							<Button
								disabled={!form.canSubmit}
								onClick={() => {
									if (!address) return
									form.handleSubmit({
										module: 'streak',
										action: 'record_donation',
										userAddress: address,
										period: form.period,
									})
								}}
							>
								{form.isPending ? 'Submitting…' : 'Record streak donation'}
							</Button>
						</TabsContent>

						<TabsContent value="referral" className="space-y-4">
							<p className="text-sm text-muted-foreground">
								Uses your connected wallet as the referred user.{' '}
								<code className="text-xs">create_referral</code> pairs it with the platform recorder
								as referrer.
							</p>
							<Field label="Action">
								<Select
									value={form.referralAction}
									onValueChange={(v) =>
										form.setReferralAction(
											v as 'create_referral' | 'mark_onboarded' | 'record_donation',
										)
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="create_referral">create_referral</SelectItem>
										<SelectItem value="mark_onboarded">mark_onboarded</SelectItem>
										<SelectItem value="record_donation">record_donation</SelectItem>
									</SelectContent>
								</Select>
							</Field>
							<Button
								disabled={!form.canSubmit}
								onClick={() => {
									if (!address) return
									form.handleSubmit({
										module: 'referral',
										action: form.referralAction,
										referredAddress: address,
									})
								}}
							>
								{form.isPending ? 'Submitting…' : `Run ${form.referralAction}`}
							</Button>
						</TabsContent>

						<TabsContent value="quest" className="space-y-4">
							<p className="text-sm text-muted-foreground">
								Calls <code className="text-xs">quest.update_progress</code> for your connected
								wallet. Completing a quest awards reputation via CPI.
							</p>
							<div className="grid gap-4 sm:grid-cols-2">
								<Field label="Quest ID (on-chain)">
									<Input
										type="number"
										min={0}
										value={form.questId}
										onChange={(e) => form.setQuestId(e.target.value)}
									/>
								</Field>
								<Field label="Progress value">
									<Input
										type="number"
										min={0}
										value={form.progressValue}
										onChange={(e) => form.setProgressValue(e.target.value)}
									/>
								</Field>
							</div>
							<Button
								disabled={!form.canSubmit}
								onClick={() => {
									if (!address) return
									form.handleSubmit({
										module: 'quest',
										action: 'update_progress',
										userAddress: address,
										questId: Number(form.questId),
										progressValue: Number(form.progressValue),
									})
								}}
							>
								{form.isPending ? 'Submitting…' : 'Update quest progress'}
							</Button>
						</TabsContent>

						<TabsContent value="nft" className="space-y-4">
							<p className="text-sm text-muted-foreground">
								Mints to your connected wallet, or updates metadata by token ID.
							</p>
							<Field label="Action">
								<Select
									value={form.nftAction}
									onValueChange={(v) => form.setNftAction(v as 'mint' | 'update_metadata')}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="mint">mint</SelectItem>
										<SelectItem value="update_metadata">update_metadata</SelectItem>
									</SelectContent>
								</Select>
							</Field>
							<div className="grid gap-4 sm:grid-cols-2">
								{form.nftAction === 'update_metadata' ? (
									<Field label="Token ID">
										<Input
											type="number"
											min={0}
											value={form.tokenId}
											onChange={(e) => form.setTokenId(e.target.value)}
										/>
									</Field>
								) : null}
								<Field label="Metadata name">
									<Input value={form.nftName} onChange={(e) => form.setNftName(e.target.value)} />
								</Field>
							</div>
							<Button
								disabled={!form.canSubmit}
								onClick={() => {
									if (!address) return
									form.handleSubmit({
										module: 'nft',
										action: form.nftAction,
										toAddress: form.nftAction === 'mint' ? address : undefined,
										tokenId:
											form.nftAction === 'update_metadata' ? Number(form.tokenId) : undefined,
										metadata: {
											name: form.nftName,
											description: 'Manually triggered for contract verification',
											imageUri: 'https://kindfi.org/images/nft-placeholder.png',
											externalUrl: 'https://kindfi.org/profile?section=gamification',
											attributes: [
												{ trait_type: 'Tier', value: 'Bronze' },
												{ trait_type: 'Source', value: 'Admin Trigger' },
											],
										},
									})
								}}
							>
								{form.isPending ? 'Submitting…' : `Run NFT ${form.nftAction}`}
							</Button>
						</TabsContent>

						<TabsContent value="reputation" className="space-y-4">
							<p className="text-sm text-muted-foreground">
								Directly calls <code className="text-xs">reputation.record_event</code> for your
								connected wallet.
							</p>
							<div className="grid gap-4 sm:grid-cols-2">
								<Field label="Event type">
									<Select value={form.eventType} onValueChange={form.setEventType}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{REPUTATION_EVENTS.map((ev) => (
												<SelectItem key={ev.value} value={ev.value}>
													{ev.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
								<Field label="Custom points (optional)">
									<Input
										type="number"
										min={1}
										placeholder="Default for event"
										value={form.customPoints}
										onChange={(e) => form.setCustomPoints(e.target.value)}
									/>
								</Field>
							</div>
							<Button
								disabled={!form.canSubmit}
								onClick={() => {
									if (!address) return
									form.handleSubmit({
										module: 'reputation',
										action: 'record_event',
										userAddress: address,
										eventType: Number(form.eventType),
										points: form.customPoints ? Number(form.customPoints) : undefined,
									})
								}}
							>
								{form.isPending ? 'Submitting…' : 'Record reputation event'}
							</Button>
						</TabsContent>

						<TabsContent value="governance" className="space-y-4">
							<p className="text-sm text-muted-foreground">
								Calls <code className="text-xs">governance.record_vote</code> as your connected
								wallet. Create rounds from the Governance admin page first.
							</p>
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
								<Field label="Round ID (on-chain)">
									<Input
										type="number"
										min={0}
										value={form.roundId}
										onChange={(e) => form.setRoundId(e.target.value)}
									/>
								</Field>
								<Field label="Option ID (on-chain)">
									<Input
										type="number"
										min={0}
										value={form.optionId}
										onChange={(e) => form.setOptionId(e.target.value)}
									/>
								</Field>
								<Field label="Vote type">
									<Select
										value={form.voteType}
										onValueChange={(v) => form.setVoteType(v as 'up' | 'down')}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="up">Up</SelectItem>
											<SelectItem value="down">Down</SelectItem>
										</SelectContent>
									</Select>
								</Field>
								<Field label="NFT tier (weight)">
									<Select
										value={form.tier}
										onValueChange={(v) =>
											form.setTier(v as 'bronze' | 'silver' | 'gold' | 'diamond')
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="bronze">Bronze</SelectItem>
											<SelectItem value="silver">Silver</SelectItem>
											<SelectItem value="gold">Gold</SelectItem>
											<SelectItem value="diamond">Diamond</SelectItem>
										</SelectContent>
									</Select>
								</Field>
							</div>
							<Button
								disabled={!form.canSubmit}
								onClick={() => {
									if (!address) return
									form.handleSubmit({
										module: 'governance',
										action: 'record_vote',
										voterAddress: address,
										roundId: Number(form.roundId),
										optionId: Number(form.optionId),
										voteType: form.voteType,
										tier: form.tier,
									})
								}}
							>
								{form.isPending ? 'Submitting…' : 'Record governance vote'}
							</Button>
						</TabsContent>
					</Tabs>

					<TriggerResultBanner result={form.lastResult} />
				</CardContent>
			</Card>
		</div>
	)
}
