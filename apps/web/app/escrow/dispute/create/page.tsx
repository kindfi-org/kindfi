'use client';

import { useState } from 'react';
import { DisputeForm } from '~/components/escrow/dispute';
import { Button } from '~/components/base/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CreateDisputePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // In a real application, these would come from query parameters or user selection
    const contractId = searchParams.get('contractId') || '0x123abc';
    
    // In a real application, this would come from authentication
    const signer = 'user123';

    const handleSuccess = (data: any) => {
        // Navigate to the dispute details page after successful creation
        if (data.dispute?.id) {
            router.push(`/escrow/dispute/${data.dispute.id}`);
        } else {
            // If no ID is returned, go back to the disputes list
            router.push('/escrow/dispute');
        }
    };

    const handleError = (error: Error) => {
        // In a real application, we would show an error notification
        console.error('Error creating dispute:', error);
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
                <h1 className="text-2xl font-bold">File a New Dispute</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Create Dispute</CardTitle>
                    <CardDescription>
                        File a dispute for escrow contract {contractId}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DisputeForm
                        contractId={contractId}
                        signer={signer}
                        onSuccess={handleSuccess}
                        onError={handleError}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
