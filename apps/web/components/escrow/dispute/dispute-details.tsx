'use client'

import { useState, useEffect } from 'react'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/base/card'
import { Badge } from '~/components/base/badge'
import { Separator } from '~/components/base/separator'
import { AlertCircle, Check, Clock, FileText, Loader2, User } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '~/components/base/alert'
import type { Dispute, DisputeEvidence } from '~/lib/types/escrow/dispute.types'
import { formatDistanceToNow } from 'date-fns'
import type { CreatedAt } from '~/lib/types/date.types'

interface DisputeDetailsProps {
    disputeId: string
    onResolve?: () => void
    onAddEvidence?: () => void
}

export function DisputeDetails({
    disputeId,
    onResolve,
    onAddEvidence
}: DisputeDetailsProps) {
    const [dispute, setDispute] = useState<Dispute | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchDispute = async () => {
            try {
                setLoading(true)
                setError(null)
                
                const response = await fetch(`/api/escrow/dispute/${disputeId}`)
                const data = await response.json()
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch dispute details')
                }
                
                setDispute(data.dispute)
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
                setError(errorMessage)
            } finally {
                setLoading(false)
            }
        }
        
        fetchDispute()
    }, [disputeId])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'in_review':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'resolved':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    if (!dispute) {
        return (
            <Alert className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Not Found</AlertTitle>
                <AlertDescription>The dispute could not be found.</AlertDescription>
            </Alert>
        )
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Dispute #{dispute.id.substring(0, 8)}</CardTitle>
                    <Badge className={getStatusColor(dispute.status)}>
                        {dispute.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                </div>
                <CardDescription>
                    Filed {formatDistanceToNow(new Date((dispute.createdAt as CreatedAt).seconds * 1000), { addSuffix: true })}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Initiator
                    </h3>
                    <p className="text-sm">{dispute.initiator}</p>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Reason for Dispute
                    </h3>
                    <div className="bg-muted p-4 rounded-md">
                        <p className="text-sm whitespace-pre-wrap">{dispute.reason}</p>
                    </div>
                </div>

                {dispute.mediator && (
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Mediator</h3>
                        <p className="text-sm">{dispute.mediator}</p>
                    </div>
                )}

                {dispute.evidences && dispute.evidences.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Evidence</h3>
                        <ul className="space-y-2">
                            {dispute.evidences.map((evidence: DisputeEvidence) => (
                                <li key={evidence.id} className="bg-muted p-3 rounded-md">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs text-muted-foreground">
                                            Submitted by {evidence.submittedBy.substring(0, 8)}...
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date((evidence.createdAt as CreatedAt).seconds * 1000), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm mb-2">{evidence.description}</p>
                                    <a 
                                        href={evidence.evidenceUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-sm text-blue-600 hover:underline break-all"
                                    >
                                        {evidence.evidenceUrl}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {dispute.resolution && (
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Resolution</h3>
                        <div className="bg-muted p-4 rounded-md">
                            <p className="text-sm whitespace-pre-wrap">{dispute.resolution}</p>
                        </div>
                        {dispute.resolvedAt && (
                            <div className="mt-2 flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                Resolved {formatDistanceToNow(new Date(typeof dispute.resolvedAt === 'string' ? dispute.resolvedAt : (dispute.resolvedAt as CreatedAt).seconds * 1000), { addSuffix: true })}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
                {dispute.status !== 'resolved' && dispute.status !== 'rejected' && (
                    <>
                        <Button 
                            onClick={onAddEvidence} 
                            variant="outline" 
                            className="w-full sm:w-auto"
                        >
                            Add Evidence
                        </Button>
                        
                        {dispute.status === 'in_review' && dispute.mediator && (
                            <Button 
                                onClick={onResolve} 
                                className="w-full sm:w-auto"
                            >
                                Resolve Dispute
                            </Button>
                        )}
                    </>
                )}
            </CardFooter>
        </Card>
    )
}
