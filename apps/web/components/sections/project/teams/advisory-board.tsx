import { Users } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Card } from "~/components/base/card";
import type { ITeamMember } from "~/lib/types/project/team";

export function AdvisoryBoardCard({ name, role, shortBio }: ITeamMember) {
  return (
    <Card className="max-w-xs rounded overflow-hidden shadow-lg bg-white p-6 border border-gray-200 flex flex-col justify-center items-center">
      <Image
        src="/images/placeholder.png"
        alt={name}
        width={80}
        height={80}
        className="rounded-full bg-gray-200 object-cover"
      />
      <div className="font-bold text-black text-lg mb-2 text-center">
        {name}
      </div>
      <p className="text-center text-blue-600 font-medium">{role}</p>
      <p className="text-gray-600 text-sm mt-4 text-center">{shortBio}</p>
    </Card>
  );
}

export interface ITeamData {
  data: ITeamMember[];
}
export function AdvisoryBoard({ data }: ITeamData) {
  const [isViewAllClicked, setIsViewAllClicked] = useState(false);
  const visibleData = isViewAllClicked ? data : data.slice(0, 4);
  return (
    <section aria-labelledby="advisory-team-heading" className="mt-[1.5rem]">
      <h2 className="text-2xl font-bold text-black">Advisory Board</h2>
      {/* list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-[1.5rem]"
      id="advisory-board-members"
      >
        {data && data.length > 0 ? (
          visibleData.map((ele) => (
            <AdvisoryBoardCard
              key={`advisory-${ele.name}${ele.role}`}
              {...ele}
            />
          ))
        ) : (
          <p className="col-span-full text-gray-500">
            No Advisory team members to display.
          </p>
        )}
      </div>
      <div className="w-full flex justify-center items-center mt-[2rem]">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-white text-black border border-gray-200 rounded-lg shadow-md hover:bg-gray-100"
          type="button"
          onClick={() => setIsViewAllClicked(!isViewAllClicked)}
          aria-expanded={isViewAllClicked}
          aria-controls="advisory-board-members"
        >
          <Users className="w-5 h-5" />
          <p className="text-sm">
            {isViewAllClicked ? "Show Less" : "View All Team Members"}
          </p>
        </button>
      </div>
    </section>
  );
}
