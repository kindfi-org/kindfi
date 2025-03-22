"use client";
import { AdvisoryBoard } from "./AdvisoryBoard";
import { LeadershipTeam } from "./LeadershipTeam";

const TeamsTab = () => {
  return (
    <div className="bg-white">
      <LeadershipTeam />
      <AdvisoryBoard />
    </div>
  );
};

export default TeamsTab;
