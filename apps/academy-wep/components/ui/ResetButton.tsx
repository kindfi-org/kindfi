import { X } from "lucide-react";
import { Button } from "./button";

interface ResetButtonProps {
  onReset: () => void;
}
function ResetButton({ onReset }: ResetButtonProps) {
  return (
    <div className="flex flex-col items-start gap-4 w-full justify-normal">
      <div className="flex w-full justify-end">
        <Button
          onClick={onReset}
          className="bg-transparent text-black hover:text-white border  hover:border-none group hover:bg-primary-500"
        >
          <X className="text-black  group-hover:text-white" /> Reset Filters
        </Button>
      </div>
    </div>
  );
}

export default ResetButton;
