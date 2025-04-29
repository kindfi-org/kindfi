'use client';

import { useState } from 'react';
import { DisputeList } from '~/components/escrow/dispute';
import { Button } from '~/components/base/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card';
import { useRouter } from 'next/navigation';

export default function DisputePage() {
    const [selectedEscrowId, setSelectedEscrowId] = useState<string | null>(null);
    const router = useRouter();

    const handleViewDispute = (disputeId: string) => {
        router.push(`/escrow/dispute/${disputeId}`);
    };

    const handleCreateDispute = () => {
        router.push('/escrow/dispute/create');
    };

    // For demo purposes, we'll use a hardcoded escrow ID
    // In a real application, this would come from a query parameter or user selection
    const escrowId = selectedEscrowId || '123e4567-e89b-12d3-a456-426614174000';

    return (
        <div className="container mx-auto py-8 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Escrow Dispute Management</CardTitle>
                    <CardDescription>
                        View and manage disputes for escrow contracts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">
                        This page allows you to view all disputes for an escrow contract and create new disputes
                        if necessary. Select an escrow contract to view its disputes.
                    </p>
                    
                    {/* In a real application, this would be a dropdown or search to select an escrow */}
                    <div className="flex items-center gap-4 mb-8">
                        <Button 
                            onClick={() => setSelectedEscrowId('123e4567-e89b-12d3-a456-426614174000')}
                            variant={selectedEscrowId === '123e4567-e89b-12d3-a456-426614174000' ? 'default' : 'outline'}
                        >
                            Escrow #1
                        </Button>
                        <Button 
                            onClick={() => setSelectedEscrowId('223e4567-e89b-12d3-a456-426614174001')}
                            variant={selectedEscrowId === '223e4567-e89b-12d3-a456-426614174001' ? 'default' : 'outline'}
                        >
                            Escrow #2
                        </Button>
                        <Button 
                            onClick={() => setSelectedEscrowId('323e4567-e89b-12d3-a456-426614174002')}
                            variant={selectedEscrowId === '323e4567-e89b-12d3-a456-426614174002' ? 'default' : 'outline'}
                        >
                            Escrow #3
                        </Button>
                    </div>
                    
                    <DisputeList 
                        escrowId={escrowId}
                        onViewDispute={handleViewDispute}
                        onCreateDispute={handleCreateDispute}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
