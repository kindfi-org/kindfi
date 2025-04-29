'use client'

import { useState } from 'react'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { Textarea } from '~/components/base/textarea'
import { Label } from '~/components/base/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/base/card'
import { AlertCircle, Check, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '~/components/base/alert'
import { resolveDisputeValidator } from '~/lib/constants/escrow/dispute.validator'

interface ResolveFormProps {
    disputeId: string
    contractId: string
    disputeResolver: string
    onSuccess?: (data: any) => void
    onError?: (error: Error) => void
    onCancel?: () => void
}

export function ResolveForm({
    disputeId,
    contractId,
    disputeResolver,
    onSuccess,
    onError,
    onCancel
}: ResolveFormProps) {
    const [approverFunds, setApproverFunds] = useState('')
    const [serviceProviderFunds, setServiceProviderFunds] = useState('')
    const [resolution, setResolution] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        setSuccess(false)

        try {
            // Validate the form data
            const validationResult = resolveDisputeValidator.safeParse({
                contractId,
                disputeResolver,
                approverFunds,
                serviceProviderFunds,
                resolution
            })

            if (!validationResult.success) {
                throw new Error(validationResult.error.errors[0]?.message || 'Invalid form data')
            }

            // Submit the resolution
            const response = await fetch(`/api/escrow/dispute/${disputeId}/resolve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contractId,
                    disputeResolver,
                    approverFunds,
                    serviceProviderFunds,
                    resolution
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to resolve dispute')
            }

            setSuccess(true)
            if (onSuccess) {
                onSuccess(data)
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
            setError(errorMessage)
            if (onError) {
                onError(err instanceof Error ? err : new Error(errorMessage))
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Resolve Dispute</CardTitle>
                <CardDescription>
                    Provide a resolution for the dispute and allocate funds between parties
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="approverFunds">Approver Funds</Label>
                            <Input
                                id="approverFunds"
                                type="text"
                                placeholder="0.00"
                                value={approverFunds}
                                onChange={(e) => setApproverFunds(e.target.value)}
                                required
                            />
                            <p className="text-sm text-muted-foreground">
                                Amount to be allocated to the approver
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="serviceProviderFunds">Service Provider Funds</Label>
                            <Input
                                id="serviceProviderFunds"
                                type="text"
                                placeholder="0.00"
                                value={serviceProviderFunds}
                                onChange={(e) => setServiceProviderFunds(e.target.value)}
                                required
                            />
                            <p className="text-sm text-muted-foreground">
                                Amount to be allocated to the service provider
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="resolution">Resolution</Label>
                        <Textarea
                            id="resolution"
                            placeholder="Provide a detailed explanation of the resolution..."
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            className="min-h-[150px]"
                            required
                        />
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="bg-green-50 text-green-800 border-green-200">
                            <Check className="h-4 w-4" />
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>Dispute has been resolved successfully.</AlertDescription>
                        </Alert>
                    )}
                </form>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
                <Button 
                    type="button"
                    variant="outline" 
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || !approverFunds || !serviceProviderFunds || !resolution || success} 
                    className="w-full sm:w-auto"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Resolving...
                        </>
                    ) : 'Resolve Dispute'}
                </Button>
            </CardFooter>
        </Card>
    )
}
