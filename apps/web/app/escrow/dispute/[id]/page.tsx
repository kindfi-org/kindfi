'use client';

import { useState } from 'react';
import { DisputeDetails, EvidenceForm, ResolveForm } from '~/components/escrow/dispute';
import { Button } from '~/components/base/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DisputeDetailsPage({ params }: { params: { id: string } }) {
    const [showEvidenceForm, setShowEvidenceForm] = useState(false);
    const [showResolveForm, setShowResolveForm] = useState(false);
    const { id } = params;

    // In a real application, these would come from authentication and the dispute data
    const currentUser = 'user123';
    const contractId = '0x123abc';
    const disputeResolver = 'resolver456';

    const handleAddEvidence = () => {
        setShowEvidenceForm(true);
        setShowResolveForm(false);
    };

    const handleResolve = () => {
        setShowResolveForm(true);
        setShowEvidenceForm(false);
    };

    const handleEvidenceSuccess = () => {
        setShowEvidenceForm(false);
        // In a real application, we would refresh the dispute data here
    };

    const handleResolveSuccess = () => {
        setShowResolveForm(false);
        // In a real application, we would refresh the dispute data here
    };

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex items-center mb-6">
                <Link href="/escrow/dispute" className="mr-4">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Disputes
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Dispute Details</h1>
            </div>

            <DisputeDetails
                disputeId={id}
                onResolve={handleResolve}
                onAddEvidence={handleAddEvidence}
            />

            {showEvidenceForm && (
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Add Evidence</CardTitle>
                        <CardDescription>
                            Provide additional evidence for this dispute
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EvidenceForm
                            disputeId={id}
                            submittedBy={currentUser}
                            onSuccess={handleEvidenceSuccess}
                            onCancel={() => setShowEvidenceForm(false)}
                        />
                    </CardContent>
                </Card>
            )}

            {showResolveForm && (
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Resolve Dispute</CardTitle>
                        <CardDescription>
                            Provide a resolution for this dispute
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResolveForm
                            disputeId={id}
                            contractId={contractId}
                            disputeResolver={disputeResolver}
                            onSuccess={handleResolveSuccess}
                            onCancel={() => setShowResolveForm(false)}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
