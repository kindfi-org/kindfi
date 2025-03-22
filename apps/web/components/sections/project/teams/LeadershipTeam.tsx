import { useState } from "react";
import type { ITeamMember } from "~/components/types/team";
import { mockLeadershipTeamData } from "~/lib/mock-data/project/teams";
import { Card } from "~/components/base/card";

export const LeadershipTeamCard: React.FC<ITeamMember> = () => {
  return (
    <Card className="max-w-sm rounded overflow-hidden shadow-lg bg-white p-6 border border-gray-200">
      <div className="font-bold text-xl mb-2">Michael Chen</div>
      <p className="text-gray-700 text-base">CEO & Co-Founder</p>
      <p className="text-gray-600 text-sm mt-4">
        Former VP of Engineering at Tesla Energy, 15+ years experience in
        renewable energy systems and mechanical engineering.
      </p>
    </Card>
  );
};

export const LeadershipTeam = () => {
  const [teamData] = useState(mockLeadershipTeamData);
  return (
    <div>
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold text-black">Leadership Team</h2>
        <span className="px-3 py-1 text-sm font-medium text-black border border-gray-300 rounded-full">
          {teamData.length} members
        </span>
      </div>

      {/* list */}
      <div className="flex gap-[1rem] flex-wrap">
        {teamData.map((ele) => (
          <LeadershipTeamCard key={`${ele.name}${ele.role}`} {...ele} />
        ))}
      </div>
    </div>
  );
};
