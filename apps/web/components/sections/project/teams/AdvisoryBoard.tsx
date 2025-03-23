import { Users } from "lucide-react";
import { useState } from "react";
import { Card } from "~/components/base/card";
import type { ITeamMember } from "~/components/types/team";

export const AdvisoryBoardCard: React.FC<ITeamMember> = ({
  name,
  role,
  shortBio,
}) => {
  return (
    <Card className="max-w-xs rounded overflow-hidden shadow-lg bg-white p-6 border border-gray-200 flex flex-col justify-center items-center">
      <div className="w-16 h-16 bg-gray-200 rounded-full" />
      <div className="font-bold text-black text-lg mb-2 text-center">
        {name}
      </div>
      <p className="text-center text-blue-600 font-medium">{role}</p>
      <p className="text-gray-600 text-sm mt-4 text-center">{shortBio}</p>
    </Card>
  );
};

export interface ITeamData {
  data: ITeamMember[];
}
export const AdvisoryBoard: React.FC<ITeamData> = ({ data }) => {
  const [isViewAllClicked, setIsViewAllClicked] = useState(false);
  const visibleData = isViewAllClicked ? data : data.slice(0, 4);
  return (
    <section aria-labelledby="advisory-team-heading" className="mt-[1.5rem]">
      <h2 className="text-2xl font-bold text-black">Advisory Board</h2>
      {/* list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-[1.5rem]">
        {visibleData.map((ele) => (
          <AdvisoryBoardCard key={`${ele.name}${ele.role}`} {...ele} />
        ))}
      </div>
      <div className="w-full flex justify-center items-center mt-[2rem]">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-white text-black border border-gray-200 rounded-lg shadow-md hover:bg-gray-100"
          type="button"
          onClick={() => setIsViewAllClicked(!isViewAllClicked)}
        >
          <Users className="w-5 h-5" />
          <p className="text-sm">
            {isViewAllClicked ? "Show Less" : "View All Team Members"}
          </p>
        </button>
      </div>
    </section>
  );
};
