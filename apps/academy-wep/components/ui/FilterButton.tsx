import { Filter, LayoutGrid, Menu, X } from "lucide-react";
import { Button } from "./button";

interface FilterButtonProps {
  onFilterClick: () => void;
  onLayoutChange: (layout: "grid" | "list") => void;
  currentLayout?: "grid" | "list";
}
function FilterButton({
  onFilterClick,
  onLayoutChange,
  currentLayout = "grid",
}: FilterButtonProps) {
  return (
    <div className="flex flex-row gap-4 justify-between md:w-auto w-full ">
      <Button
        onClick={onFilterClick}
        className="bg-primary-500 hover:bg-primary-600 transition-all rounded-md shadow-lg hover:shadow-xl"
      >
        <Filter /> Filter <X />
      </Button>
      <div className="bg-white  rounded-md shadow-md flex-row flex px-4 py-2 h-10 items-center gap-3 shadow-gray-100">
        <button
          onClick={() => onLayoutChange("grid")}
          className={`focus:outline-none ${currentLayout === "grid" ? "text-primary-600" : "text-gray-400"}`}
        >
          <LayoutGrid />
        </button>
        <button
          onClick={() => onLayoutChange("list")}
          className={`focus:outline-none ${currentLayout === "list" ? "text-primary-600" : "text-gray-400"}`}
        >
          <Menu />
        </button>
      
      </div>
    </div>
  );
}

export default FilterButton;
