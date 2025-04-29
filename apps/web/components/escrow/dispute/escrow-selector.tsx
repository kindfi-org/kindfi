import { Button } from '~/components/base/button';
import { demoEscrowIds } from '~/lib/constants/demo-ids';

type Escrow = {
    id: string;
    label: string;
};

interface EscrowSelectorProps {
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export function EscrowSelector({ 
    selectedId, 
    onSelect 
}: EscrowSelectorProps) {
    // Only show escrows with non-empty IDs (which will be empty in production)
    const escrows: Escrow[] = [
        ...(demoEscrowIds.escrow1 ? [{ id: demoEscrowIds.escrow1, label: 'Escrow #1' }] : []),
        ...(demoEscrowIds.escrow2 ? [{ id: demoEscrowIds.escrow2, label: 'Escrow #2' }] : []),
        ...(demoEscrowIds.escrow3 ? [{ id: demoEscrowIds.escrow3, label: 'Escrow #3' }] : []),
    ];
    
    return (
        <div className="flex items-center gap-4 mb-8">
            {escrows.map(escrow => (
                <Button 
                    key={escrow.id}
                    onClick={() => onSelect(escrow.id)}
                    variant={selectedId === escrow.id ? 'default' : 'outline'}
                >
                    {escrow.label}
                </Button>
            ))}
        </div>
    );
}
