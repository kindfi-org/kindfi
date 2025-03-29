import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "../base/input";
import { CategoryFilter } from "./category-filter";
import { FilterButton } from "./filter-button";
import { LevelFilter } from "./level-filter";
import { PopularTopics } from "./popular-topics";
import { ResetButton } from "./reset-button";

export function FiltersSection() {
  const categories = ["All", "Blockchain", "Stella", "Web3", "KindFi"];
  const [selected, setSelected] = useState(0);
  const [showFilters, setShowFilters] = useState(true);
  const filterMenu = () => setShowFilters((prev) => !prev);

  return (
    <div className="flex p-[2%] flex-col z-10 w-full h-auto shadow-lg shadow-gray-300 rounded-md">
      <div className=" w-full h-auto flex md:flex-row flex-col-reverse gap-3 ">
        <div className="relative w-full  h-auto">
          <Input
            type="Search"
            placeholder="Search Modules and Resources ...."
            className="bg-background relative border max-w-lg border-border text-foreground pl-10 placeholder-muted-foreground focus:ring-primary-500 rounded-md"
          />
          <Search className="w-6 h-6 text-gray-600 absolute top-2 left-2" />
        </div>
        <div className="w-full  items-end justify-end flex flex-row">
          <FilterButton
            onFilterClick={filterMenu}
            currentLayout="list"
            onLayoutChange={() => {}}
          />
        </div>
      </div>
      <div
        className={`w-full h-auto transition-all duration-500 ${
          showFilters
            ? "opacity-100 max-h-auto"
            : "opacity-0 max-h-0 overflow-hidden"
        }`}
      >
        <div className="w-full border-t h-auto md:flex-row flex-col items-start justify-between py-6 flex gap-4 mt-8 ">
          <CategoryFilter
            categories={categories}
            selected={selected}
            setSelected={setSelected}
          />
          <LevelFilter />
          <PopularTopics />
        </div>

        <div className="w-full mt-8  flex-col">
          <ResetButton
            onReset={() => {
              setSelected(0);
              setShowFilters(true);
            }}
          />
        </div>
      </div>
    </div>
  );
}
