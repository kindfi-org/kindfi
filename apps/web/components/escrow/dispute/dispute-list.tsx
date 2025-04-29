'use client'

import { useState, useEffect } from 'react'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import { Badge } from '~/components/base/badge'
import { AlertCircle, Loader2, PlusCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '~/components/base/alert'
import type { Dispute } from '~/lib/types/escrow/dispute.types'
import { formatDistanceToNow } from 'date-fns'
import type { CreatedAt } from '~/lib/types/date.types'

interface DisputeListProps {
    escrowId: string
    onViewDispute: (disputeId: string) => void
    onCreateDispute: () => void
}

export function DisputeList({
    escrowId,
    onViewDispute,
    onCreateDispute
}: DisputeListProps) {
    const [disputes, setDisputes] = useState<Dispute[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchDisputes = async () => {
            try {
                setLoading(true)
                setError(null)
                
                const response = await fetch(`/api/escrow/dispute?escrowId=${escrowId}`)
                const data = await response.json()
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch disputes')
                }
                
                setDisputes(data.disputes || [])
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
                setError(errorMessage)
            } finally {
                setLoading(false)
            }
        }
        
        fetchDisputes()
    }, [escrowId])

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

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Disputes</CardTitle>
                    <CardDescription>
                        {disputes.length === 0 
                            ? 'No disputes have been filed for this escrow.' 
                            : `${disputes.length} dispute${disputes.length === 1 ? '' : 's'} found for this escrow.`
                        }
                    </CardDescription>
                </div>
                <Button 
                    onClick={onCreateDispute} 
                    variant="outline" 
                    size="sm"
                    className="flex items-center"
                >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    File Dispute
                </Button>
            </CardHeader>
            <CardContent>
                {disputes.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                        No disputes found
                    </div>
                ) : (
                    <div className="space-y-4">
                        {disputes.map((dispute) => (
                            <div 
                                key={dispute.id} 
                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-muted rounded-md hover:bg-muted/80 cursor-pointer"
                                onClick={() => onViewDispute(dispute.id)}
                            >
                                <div className="space-y-1 mb-2 sm:mb-0">
                                    <h3 className="font-medium">Dispute #{dispute.id.substring(0, 8)}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                        {dispute.reason}
                                    </p>
                                    <div className="text-xs text-muted-foreground">
                                        Filed {formatDistanceToNow(new Date((dispute.createdAt as CreatedAt).seconds * 1000), { addSuffix: true })}
                                    </div>
                                </div>
                                <Badge className={getStatusColor(dispute.status)}>
                                    {dispute.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
