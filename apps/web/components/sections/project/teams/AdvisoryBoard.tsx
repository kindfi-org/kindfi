import { useState } from "react";
import { Card, CardContent } from "~/components/base/card";
import type { ITeamMember } from "~/components/types/team";
import { mockAdvisoryBoardData } from "~/lib/mock-data/project/teams";

export const AdvisoryBoardCard: React.FC<ITeamMember> = ({name, role, shortBio, links}) => {
  return (
    <Card className="max-w-sm rounded overflow-hidden shadow-lg bg-white p-6 border border-gray-200">
      <div className="font-bold text-xl mb-2">{name}</div>
      <p className="text-gray-700 text-base">{role}</p>
      <p className="text-gray-600 text-sm mt-4">{shortBio}</p>
    </Card>
  );
};

export const AdvisoryBoard = () => {
  const [teamData] = useState(mockAdvisoryBoardData);
  return (
    <div className="mt-[1.5rem]">
	  <h2 className="text-2xl font-bold text-black">Advisory Board</h2>
      {/* list */}
      <div className="flex gap-[1rem] flex-wrap mt-[1.5rem]">
        {teamData.map((ele) => (
          <AdvisoryBoardCard key={`${ele.name}${ele.role}`} {...ele} />
        ))}
      </div>
    </div>
  );
};
