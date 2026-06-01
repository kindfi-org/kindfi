import { Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/base/card";
import { NFTCollection } from "~/components/sections/gamification/nft-collection";

export function DonorNftsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          NFT Collection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <NFTCollection />
      </CardContent>
    </Card>
  );
}
