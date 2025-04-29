'use client'

import dynamic from 'next/dynamic'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/base/card'
import { Badge } from '~/components/base/badge'
import { Separator } from '~/components/base/separator'
import { Alert, AlertDescription, AlertTitle } from '~/components/base/alert'
import type { DisputeEvidence } from '~/lib/types/escrow/dispute.types'
import { formatDistanceToNow } from 'date-fns'
import type { CreatedAt } from '~/lib/types/date.types'
import { useDispute } from '~/hooks/use-dispute'
import { getDisputeStatusColor } from '~/lib/utils/status-colors'

// Dynamically import Lucide icons to reduce initial bundle size
const AlertCircle = dynamic(() => import('lucide-react').then(mod => mod.AlertCircle))
const Check = dynamic(() => import('lucide-react').then(mod => mod.Check))
const Clock = dynamic(() => import('lucide-react').then(mod => mod.Clock))
const FileText = dynamic(() => import('lucide-react').then(mod => mod.FileText))
const Loader2 = dynamic(() => import('lucide-react').then(mod => mod.Loader2))
const User = dynamic(() => import('lucide-react').then(mod => mod.User))

/**
 * Format a timestamp consistently, handling different date formats
 * @param timestamp - CreatedAt object, string date, or undefined
 * @returns Formatted date string or 'Unknown date' if timestamp is undefined
 */
function formatTimestamp(timestamp: CreatedAt | string | undefined): string {
  if (!timestamp) return 'Unknown date';
  
  const date = typeof timestamp === 'string' 
    ? new Date(timestamp) 
    : new Date((timestamp as CreatedAt).seconds * 1000);
    
  return formatDistanceToNow(date, { addSuffix: true });
}

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
    // Use the custom hook to fetch dispute data
    const { dispute, loading, error } = useDispute(disputeId)

    // Status color mapping is now handled by the imported utility function

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
                    <Badge className={getDisputeStatusColor(dispute.status)}>
                        {dispute.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                </div>
                <CardDescription>
                    Filed {formatTimestamp(dispute.createdAt)}
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
                                            {formatTimestamp(evidence.createdAt)}
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
                                Resolved {formatTimestamp(dispute.resolvedAt)}
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
