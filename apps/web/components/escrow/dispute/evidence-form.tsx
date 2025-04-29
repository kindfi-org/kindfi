'use client'

import { useState } from 'react'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { Textarea } from '~/components/base/textarea'
import { Label } from '~/components/base/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/base/card'
import { AlertCircle, Check, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '~/components/base/alert'
import { addEvidenceValidator } from '~/lib/constants/escrow/dispute.validator'

interface EvidenceFormProps {
    disputeId: string
    submittedBy: string
    onSuccess?: (data: any) => void
    onError?: (error: Error) => void
    onCancel?: () => void
}

export function EvidenceForm({
    disputeId,
    submittedBy,
    onSuccess,
    onError,
    onCancel
}: EvidenceFormProps) {
    const [evidenceUrl, setEvidenceUrl] = useState('')
    const [description, setDescription] = useState('')
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
            const validationResult = addEvidenceValidator.safeParse({
                escrowId: disputeId, // This is just for validation, the actual API uses disputeId
                evidenceUrl,
                description
            })

            if (!validationResult.success) {
                throw new Error(validationResult.error.errors[0]?.message || 'Invalid form data')
            }

            // Submit the evidence
            const response = await fetch(`/api/escrow/dispute/${disputeId}/evidence`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    evidenceUrl,
                    description,
                    submittedBy
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit evidence')
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
                <CardTitle>Add Evidence</CardTitle>
                <CardDescription>
                    Provide additional evidence for the dispute
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="evidenceUrl">Evidence URL</Label>
                        <Input
                            id="evidenceUrl"
                            type="url"
                            placeholder="https://example.com/evidence"
                            value={evidenceUrl}
                            onChange={(e) => setEvidenceUrl(e.target.value)}
                            required
                        />
                        <p className="text-sm text-muted-foreground">
                            URL to the evidence (document, screenshot, etc.)
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe what this evidence shows..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[100px]"
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
                            <AlertDescription>Evidence has been added successfully.</AlertDescription>
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
                    disabled={isSubmitting || !evidenceUrl || !description || success} 
                    className="w-full sm:w-auto"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                        </>
                    ) : 'Add Evidence'}
                </Button>
            </CardFooter>
        </Card>
    )
}
