'use client'

import { useState } from 'react'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { Textarea } from '~/components/base/textarea'
import { Label } from '~/components/base/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/base/card'
import { AlertCircle, Check, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '~/components/base/alert'
import { startDisputeValidator } from '~/lib/constants/escrow/dispute.validator'

interface DisputeFormProps {
    contractId: string
    signer: string
    onSuccess?: (data: any) => void
    onError?: (error: Error) => void
}

export function DisputeForm({
    contractId,
    signer,
    onSuccess,
    onError
}: DisputeFormProps) {
    const [reason, setReason] = useState('')
    const [evidenceUrl, setEvidenceUrl] = useState('')
    const [evidenceUrls, setEvidenceUrls] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleAddEvidence = () => {
        if (evidenceUrl && !evidenceUrls.includes(evidenceUrl)) {
            setEvidenceUrls([...evidenceUrls, evidenceUrl])
            setEvidenceUrl('')
        }
    }

    const handleRemoveEvidence = (url: string) => {
        setEvidenceUrls(evidenceUrls.filter(item => item !== url))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        setSuccess(false)

        try {
            // Validate the form data
            const validationResult = startDisputeValidator.safeParse({
                contractId,
                signer,
                reason,
                evidenceUrls
            })

            if (!validationResult.success) {
                throw new Error(validationResult.error.errors[0]?.message || 'Invalid form data')
            }

            // Submit the dispute
            const response = await fetch('/api/escrow/dispute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contractId,
                    signer,
                    reason,
                    evidenceUrls
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit dispute')
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
                <CardTitle>File a Dispute</CardTitle>
                <CardDescription>
                    Submit a dispute for the escrow contract. Provide a clear reason and any supporting evidence.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Dispute</Label>
                        <Textarea
                            id="reason"
                            placeholder="Explain why you are filing this dispute..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="min-h-[120px]"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="evidence">Evidence (Optional)</Label>
                        <div className="flex space-x-2">
                            <Input
                                id="evidence"
                                type="url"
                                placeholder="https://example.com/evidence"
                                value={evidenceUrl}
                                onChange={(e) => setEvidenceUrl(e.target.value)}
                                className="flex-1"
                            />
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handleAddEvidence}
                                disabled={!evidenceUrl}
                            >
                                Add
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Add URLs to any supporting evidence (documents, screenshots, etc.)
                        </p>
                    </div>

                    {evidenceUrls.length > 0 && (
                        <div className="space-y-2">
                            <Label>Added Evidence</Label>
                            <ul className="space-y-2">
                                {evidenceUrls.map((url, index) => (
                                    <li key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                        <a 
                                            href={url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-sm text-blue-600 hover:underline truncate"
                                        >
                                            {url}
                                        </a>
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleRemoveEvidence(url)}
                                        >
                                            Remove
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

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
                            <AlertDescription>Your dispute has been filed successfully.</AlertDescription>
                        </Alert>
                    )}
                </form>
            </CardContent>
            <CardFooter>
                <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || !reason || success} 
                    className="w-full"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Filing Dispute...
                        </>
                    ) : 'File Dispute'}
                </Button>
            </CardFooter>
        </Card>
    )
}
