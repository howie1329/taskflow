import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const FilterDropdownCard = ({ filterStatuses, onFilterChange }) => {
  const filterOptions = [
    {
      label: "All",
      value: "all",
    },
    {
      label: "To Do",
      value: "todo",
    },
    {
      label: "In Progress",
      value: "inProgress",
    },
    {
      label: "Done",
      value: "done",
    },
    {
      label: "Overdue",
      value: "overdue",
    },
  ];

  return (
    <Card className="absolute top-full right-0 mt-1 z-70 w-30 p-3 shadow-2xl border bg-[#fafafa]">
      <div className="flex flex-col gap-2">
        {filterOptions.map((option) => (
          <div
            key={option.value}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <Checkbox
              checked={filterStatuses.includes(option.value)}
              onCheckedChange={() => onFilterChange(option.value)}
            />
            <Label className="cursor-pointer text-xs font-medium">
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </Card>
  );
};
