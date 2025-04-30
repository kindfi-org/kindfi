"use client";

import { Clock, ExternalLink, Heart, Link2, Share, Shield } from "lucide-react";
import { useMemo } from "react";
import { RiStarFill } from "react-icons/ri";
import ProjectVideo from "~/components/ProjectVideo";
import { Button } from "~/components/base/button";
import { Image } from "~/components/base/image";
import { Input } from "~/components/base/input";
import { Separator } from "~/components/base/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/base/tabs";
import { Technology } from "~/components/sections/projects/Technology";
import { BusinessModel } from "~/components/sections/projects/business-model";
import { CompetitiveAdvantages } from "~/components/sections/projects/competitive-advantages";
import { InvestmentDetails } from "~/components/sections/projects/investment-details";
import { MarketOpportunity } from "~/components/sections/projects/market-opportunity";
import { ProjectDocuments } from "~/components/sections/projects/project-documents";
import { ProjectOverview } from "~/components/sections/projects/project-overview";
import { TractionMilestones } from "~/components/sections/projects/traction-milestones";
import { businessModelData } from "~/lib/mock-data/mock-business-model";
import { competitiveAdvantagesData } from "~/lib/mock-data/mock-competitive-adventage";
import { investmentDetailsData } from "~/lib/mock-data/mock-investment-details";
import { marketOpportunityData } from "~/lib/mock-data/mock-market-opportunity";
import { technologyData } from "~/lib/mock-data/mock-technology";
import { tractionMilestonesData } from "~/lib/mock-data/mock-traction-milestones";
import { projectDocumentsData } from "~/lib/mock-data/project/project-documents.mock";
import { projectData } from "~/lib/mock-data/project/project-overview.mock";
import type { Project, Tag } from "~/lib/types";
import ProjectMilestone from "./project-milestone";
import SimilarProjects from "./similar-projects";
import { ProjectUpdatesTabSection } from "~/components/sections/project/update/update-tab-section";
interface ProjectDetailProp {
  project: Project;
}
const tagColors = [
  { textColor: "#5C86FF", backgroundColor: "#E3ECFF" },
  { textColor: "#A1A1A1", backgroundColor: "#E8E8E8" },
  { textColor: "#D4915D", backgroundColor: "#FDEAD7" },
  { textColor: "#4D9A5E", backgroundColor: "#E3F4E7" },
  { textColor: "#B56CD2", backgroundColor: "#F3E8FD" },
];

const formatNumber = (number: number) => {
  return number.toLocaleString();
};
const ProjectDetail = ({ project }: ProjectDetailProp) => {
  const renderedTags = useMemo(() => {
    return (project.tags as Tag[]).map(({ text, id }: Tag) => (
      <div key={id} className="w-auto py-1 px-4 rounded-lg bg-slate-200  ">
        <p className="font-bold text-[9px] capitalize">
          {text?.toLocaleLowerCase()}
        </p>
      </div>
    ));
  }, [project.tags]);
  return (
    <>
      <div className="w-full min-h-screen py-10 px-6 flex ">
        <div className="w-full block lg:flex items-start justify-between gap-24 ">
          <div className="  w-full lg:w-3/5">
            <div className="w-full flex items-center justify-start gap-3">
              <p className=" text-[10px] uppercase text-slate-400 font-medium font-sans lg:text-sm">
                Invest in
              </p>
              <div className="w-auto px-2 py-[0.8px] border-gray-400 rounded-full   border-[0.5px]">
                <p className=" text-black text-[10px] uppercase font-bold font-sans text-center">
                  {project.categories?.[0]}
                </p>
              </div>
            </div>

            <div className="w-full mt-6">
              <p className="font-bold text-xl font-sans lg:text-4xl">
                {project.title}
              </p>
            </div>
            <div className="w-full mt-4">
              <div className=" w-full flex items-center gap-3 justify-start">
                {(project.tags as Tag[])?.map(({ id, text }, index) => {
                  const color = tagColors[index % tagColors.length];
                  return (
                    <div
                      key={id}
                      className="w-auto py-1 px-3 rounded-full"
                      style={{ backgroundColor: color.backgroundColor }}
                    >
                      <p
                        className="text-center text-[10px] capitalize font-bold"
                        style={{ color: color.textColor }}
                      >
                        {text.toLocaleLowerCase()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="w-full h-auto mt-4 relative aspect-video md:aspect-[16/9] lg:aspect-[16/9]">
              <ProjectVideo
                url={
                  project?.video_url ||
                  "https://res.cloudinary.com/daqjecxhy/video/upload/v1743092835/424799153-62d97d91-9461-4f6f-8760-cc463496a220_qjftva.mov"
                }
                fallbackImage={project.image_url}
                width="100%"
                height="100%"
                className="w-full h-full"
              />

              <div className=" bg-purple-700 shadow-black rounded-full flex items-center justify-center gap-1 absolute top-6 right-4 w-[50px] py-1 px-2">
                <RiStarFill color="#fff" size={12} />
                <p className="text-xs text-white font-semibold">
                  {project?.rating || "4.7"}
                </p>
              </div>
            </div>

            <div className="w-full mt-6">
              <div className=" w-full py-8">
                <Tabs defaultValue="about" className="w-full ">
                  <TabsList
                    aria-label="Project sections"
                    className="mb-8 w-full overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide"
                  >
                    <TabsTrigger value="about">Overview</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="tam">Team</TabsTrigger>
                    <TabsTrigger value="updates">Updates</TabsTrigger>
                    <TabsTrigger value="comments">Comments</TabsTrigger>
                    <TabsTrigger value="q&a">Q&A</TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="about"
                    className="bg-white rounded-lg p-6 border border-gray-100"
                  >
                    <h2 className=" text-xl lg:text-2xl font-bold mb-4">
                      About This Project
                    </h2>

                    <div className="prose max-w-none">
                      <p className="mb-4">{project.description}</p>

                      <p className="mb-4">
                        This project aims to create a sustainable and impactful
                        solution for our community. With your support, we can
                        achieve our goals and make a real difference.
                      </p>

                      <h3 className="text-xl font-bold mt-6 mb-3">
                        Our Mission
                      </h3>
                      <p className="mb-4">
                        We're dedicated to providing innovative solutions that
                        address key challenges in our field. Our team brings
                        together expertise and passion to ensure successful
                        outcomes.
                      </p>

                      <h3 className="text-xl font-bold mt-6 mb-3">
                        How Funds Will Be Used
                      </h3>
                      <ul className="list-disc pl-6 mb-6">
                        <li className="mb-2">
                          40% - Direct project implementation
                        </li>
                        <li className="mb-2">
                          25% - Community outreach and education
                        </li>
                        <li className="mb-2">20% - Materials and equipment</li>
                        <li className="mb-2">10% - Administrative expenses</li>
                        <li className="mb-2">5% - Contingency fund</li>
                      </ul>

                      {project.milestones && (
                        <>
                          <h3 className="text-xl font-bold mt-6 mb-3">
                            Project Milestones
                          </h3>
                          <div className="space-y-4">
                            {Array.from({ length: project.milestones }).map(
                              (_, index) => (
                                <ProjectMilestone
                                  key={`milestone-${index}-${project.id}`}
                                  index={index}
                                  projectId={project.id}
                                  completedMilestones={
                                    project.completed_milestones
                                  }
                                />
                              )
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="details"
                    className="bg-white rounded-lg p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">
                        Detailed Project Information
                      </h2>
                    </div>

                    {/* Project Overview */}
                    <section className="mb-12">
                      <ProjectOverview {...projectData} />
                    </section>

                    <Separator className="my-12" />

                    {/* Business Model */}
                    <section className="mb-12">
                      <BusinessModel {...businessModelData} />
                    </section>

                    <Separator className="my-12" />

                    {/* Market Opportunity */}
                    <section className="mb-12">
                      <MarketOpportunity {...marketOpportunityData} />
                    </section>

                    <Separator className="my-12" />

                    {/* Technology and Competitive Advantages - Side by Side on larger screens */}
                    <section className="mb-12">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <Technology {...technologyData} />
                        </div>
                        <div>
                          <CompetitiveAdvantages
                            {...competitiveAdvantagesData}
                          />
                        </div>
                      </div>
                    </section>

                    <Separator className="my-12" />

                    {/* Traction & Milestones */}
                    <section className="mb-12">
                      <TractionMilestones {...tractionMilestonesData} />
                    </section>

                    <Separator className="my-12" />

                    {/* Investment Details and Documents - Side by Side on larger screens */}
                    <section className="mb-12">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <InvestmentDetails {...investmentDetailsData} />
                        </div>
                        <div className="lg:mt-16">
                          <ProjectDocuments {...projectDocumentsData} />
                        </div>
                      </div>
                    </section>
                  </TabsContent>

                  <TabsContent
                    value="updates"
                    className="bg-white rounded-lg p-6 border border-gray-100"
                  >
                    <ProjectUpdatesTabSection />
                  </TabsContent>

                  <TabsContent
                    value="donors"
                    className="bg-white rounded-lg p-6 border border-gray-100"
                  >
                    <h2 className="text-2xl font-bold mb-4">Donors</h2>
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((donor) => (
                        <div
                          key={donor}
                          className="flex items-center p-4 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="relative h-10 w-10 rounded-full overflow-hidden mr-4">
                            <Image
                              // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
                              src={`/api/placeholder/40/40`}
                              alt="Donor avatar"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium">Anonymous Donor</h3>
                            <p className="text-sm text-gray-500">
                              Donated $50 • 3 days ago
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="comments"
                    className="bg-white rounded-lg p-6 border border-gray-100"
                  >
                    <h2 className="text-2xl font-bold mb-4">Comments</h2>
                    <p className="text-gray-500 mb-4">
                      Be the first to comment on this project.
                    </p>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium mb-2">Add a comment</h3>
                      <textarea
                        className="w-full border border-gray-300 rounded-md p-2 mb-3"
                        rows={3}
                        placeholder="Write your comment here..."
                      />
                      <Button>Post Comment</Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          <div className=" w-full lg:w-2/5">
            <div className="w-full">
              <div className="w-full bg-white shadow-black rounded-lg py-6 px-6 border-blue-300 border">
                <div className="w-full flex items-center justify-start gap-2 ">
                  <p className="font-bold text-xl font-sans lg:text-4xl">
                    ${formatNumber(project.current_amount)}
                  </p>

                  <div className="w-auto py-1 px-2 rounded-full bg-[#E3ECFF] min-w-10">
                    <p className="text-[#5C86FF] text-center font-bold text-xs lg:text-base">
                      {project.percentage_complete}%
                    </p>
                  </div>
                </div>

                <div className="w-full mt-2 md:mt-4">
                  <p className=" text-sm lg:text-base font-normal">
                    of ${formatNumber(project.target_amount)} goal
                  </p>
                </div>

                <div className="w-full mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 rounded-full h-full"
                      style={{ width: `${project.percentage_complete}%` }}
                    />
                  </div>
                </div>

                <div className="w-full mt-6">
                  <div className="w-full flex items-center justify-between">
                    <div className="w-1/2">
                      <p className=" font-normal text-sm  lg:text-base capitalize ">
                        Investors
                      </p>
                      <p className="font-bold text-[15px] lg:text-base">
                        {project.investors_count}
                      </p>
                    </div>
                    <div className="w-1/2">
                      <p className=" font-normal text-sm  lg:text-base capitalize ">
                        Min. Investment
                      </p>
                      <p className="font-bold text-[15px] lg:text-base">
                        ${formatNumber(project.min_investment)}
                      </p>
                    </div>
                  </div>
                  <div className="w-full flex items-center justify-between my-4">
                    <div className="w-1/2">
                      <p className=" font-normal text-sm  lg:text-base capitalize ">
                        Closing date
                      </p>
                      <div className="w-full flex items-center justify-start gap-2">
                        <Clock color="orange" size={14} />
                        <p className="font-bold text-[15px] lg:text-base">
                          14 days
                        </p>
                      </div>
                    </div>
                    <div className="w-1/2">
                      <p className=" font-normal text-sm  lg:text-base">Type</p>
                      <p className="font-bold text-[15px] lg:text-base uppercase">
                        Safe
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full mt-6">
                  <div className="w-full">
                    <Input
                      id="investment-amount"
                      placeholder="Enter investment amount"
                      aria-label="Investment amount"
                      pattern="^\$\d+(\.\d{2})?$"
                      value={"$"}
                      className="  border-slate-500 border-1 rounded-md p-4 outline-slate-400 "
                    />
                    <Button className=" bg-[#86a5ea] w-full rounded-sm text-white mt-4 py-7">
                      Invest
                    </Button>
                    <Button className=" bg-white border border-gray-300 w-full rounded-sm text-black mt-4 py-4">
                      {" "}
                      <Heart color="#000" size={12} /> Follow this project
                    </Button>
                  </div>
                </div>
                <hr className="w-full my-6" />

                <div className="w-full">
                  <div>
                    <p className="text-base font-bold ">Future Equity</p>
                    <div className="w-full flex items-center justify-between my-2">
                      <p className="text-sm  font-normal ">20 M $</p>
                      <p className="text-sm  font-normal ">Valuation cap</p>
                    </div>

                    <div className="w-full flex items-center justify-start gap-1">
                      <Shield color="#5C86FF" size={16} />
                      <p className="text-base text-[#3963e1] font-medium ">
                        Investors Advantages:
                      </p>
                    </div>

                    <p className="text-sm  font-normal mt-3 ">2mil $-10mil $</p>
                  </div>
                </div>
              </div>

              <div className="w-full bg-white shadow-gray-200 shadow-md rounded-lg py-6 px-6 my-5">
                <p className=" font-bold text-lg">Share this opportunity </p>
                <p className=" font-normal text-sm text-gray-400">
                  Help spread the word about this project{" "}
                </p>

                <div className="w-full flex items-center md:justify-start justify-between mt-3 gap-2">
                  <div className="w-[40px] h-[40px] rounded-full flex items-center justify-center border border-x-gray-200">
                    <Link2 size={14} color="#000" />
                  </div>
                  <div className="w-[40px] h-[40px] rounded-full flex items-center justify-center border border-x-gray-200">
                    <ExternalLink size={14} color="#000" />
                  </div>

                  <div className="flex flex-1 md:flex-[0.3] lg:flex-1 border border-gray-200 rounded-sm py-2 items-center justify-center gap-3 ">
                    <Share size={14} color="#000" />
                    <p>Share</p>
                  </div>
                </div>
              </div>

              <div className="w-full bg-white shadow-gray-200 shadow-md rounded-lg py-6 px-6 my-5">
                <p className=" font-bold text-lg">Company Tags </p>

                <div className="w-full flex items-center justify-start gap-2 flex-wrap mt-2">
                  {renderedTags}
                </div>
              </div>
              <SimilarProjects
                projects={project?.relatedProjects || []}
                onViewMoreClick={() =>
                  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
                  (window.location.href =
                    // biome-ignore lint/style/useTemplate: <explanation>
                    "/projects?category=" + project.categories?.[0])
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetail;
