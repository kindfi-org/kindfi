'use client';

import { useState } from 'react';
import { DisputeList, EscrowSelector } from '~/components/escrow/dispute';
import { Button } from '~/components/base/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card';
import { useRouter } from 'next/navigation';
import { demoEscrowIds } from '~/lib/constants/demo-ids';

export default function DisputePage() {
    const [selectedEscrowId, setSelectedEscrowId] = useState<string | null>(null);
    const router = useRouter();

    const handleViewDispute = (disputeId: string) => {
        router.push(`/escrow/dispute/${disputeId}`);
    };

    const handleCreateDispute = () => {
        router.push('/escrow/dispute/create');
    };

    // In a real application, this would come from a query parameter or user selection
    // We only use a fallback in development mode
    const escrowId = selectedEscrowId || (process.env.NODE_ENV === 'development' ? demoEscrowIds.defaultEscrow : '');

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
                    
                    {/* Reusable escrow selector component */}
                    <EscrowSelector
                        selectedId={selectedEscrowId}
                        onSelect={setSelectedEscrowId}
                    />
                    
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
