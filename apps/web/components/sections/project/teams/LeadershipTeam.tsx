import { useState } from "react";
import type { ITeamMember } from "~/components/types/team";
import { mockLeadershipTeamData } from "~/lib/mock-data/project/teams";
import { Card } from "~/components/base/card";
import { FaExternalLinkAlt, FaLink } from "react-icons/fa";

export const LeadershipTeamCard: React.FC<ITeamMember> = ({
  name,
  role,
  shortBio,
}) => {
  return (
    <Card className="max-w-sm rounded overflow-hidden shadow-lg bg-white p-6 border border-gray-200">
      {/* <div className="font-bold text-xl mb-2">{name}</div>
      <p className="text-gray-700 text-base">{role}</p>
      <p className="text-gray-600 text-sm mt-4">{shortBio}</p> */}
      <div className="flex items-start space-x-4">
        <div className="w-32 h-16 bg-gray-200 rounded-lg"></div>

        <div>
          <h2 className="text-lg font-bold text-black">{name}</h2>
          <a href="#" className="text-blue-600 font-medium">
            {role}
          </a>
          <p className="text-gray-600 text-sm mt-2">{shortBio}</p>
          <div className="mt-3 flex space-x-3 text-gray-500">
            <div className="p-2 rounded-full hover:bg-gray-200 transition">
              <FaLink className="cursor-pointer" />
            </div>
            <div className="p-2 rounded-full hover:bg-gray-200 transition">
              <FaExternalLinkAlt className="cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
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
      <div className="flex gap-[1rem] flex-wrap mt-[1.5rem]">
        {teamData.map((ele) => (
          <LeadershipTeamCard key={`${ele.name}${ele.role}`} {...ele} />
        ))}
      </div>
    </div>
  );
};
