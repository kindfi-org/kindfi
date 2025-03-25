export const investmentDetailsData = {
  title: "Investment Details",
  sections: [
    {
      id: "valuation",
      title: "Valuation",
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Pre-money valuation</span>
            <span className="font-medium">$12M</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Post-money valuation</span>
            <span className="font-medium">$13.5M</span>
          </div>
        </div>
      ),
    },
    {
      id: "minimum-investment",
      title: "Minimum Investment",
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">
              Minimum investment amount
            </span>
            <span className="font-medium">$10,000</span>
          </div>
        </div>
      ),
    },
    {
      id: "security-type",
      title: "Security Type",
      content: (
        <p>
          SAFE (Simple Agreement for Future Equity) with a valuation cap of $12M
          and no discount.
        </p>
      ),
    },
    {
      id: "investor-perks",
      title: "Investor Perks",
      content: (
        <ul className="list-disc pl-5 space-y-2">
          <li>Quarterly investor updates</li>
          <li>Early access to product demos</li>
          <li>Invitation to annual investor summit</li>
        </ul>
      ),
    },
  ],
};
