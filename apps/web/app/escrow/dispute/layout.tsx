import React from 'react';

export default function DisputeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <div className="flex-1">
                <div className="border-b">
                    <div className="container flex h-16 items-center px-4">
                        <h1 className="text-lg font-semibold">Escrow Dispute System</h1>
                    </div>
                </div>
                <div className="container pb-16 pt-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
