"use client";
import { useState } from "react";
import {
  mockAdvisoryBoardData,
  mockLeadershipTeamData,
} from "~/lib/mock-data/project/teams";
import { AdvisoryBoard } from "./advisory-board";
import { LeadershipTeam } from "./leadership-team";

export function TeamsTab() {
  const [leadershipTeamData] = useState(mockLeadershipTeamData);
  const [advisoryTeamData] = useState(mockAdvisoryBoardData);
  return (
    <div className="bg-white">
      <LeadershipTeam
        data={leadershipTeamData}
        totalCount={advisoryTeamData.length + leadershipTeamData.length}
      />
      <AdvisoryBoard data={advisoryTeamData} />
    </div>
  );
}
