import { Button } from "@cosmediate/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@cosmediate/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@cosmediate/ui/components/popover";
import { cn } from "@cosmediate/ui/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

type Option = {
  label: string;
  value: string;
};

interface FilterSelectProps {
  options: Option[];
  placeholder?: string;
  selected?: string;
  onChange: (value: string | boolean | number) => void;
}

export const FiltersSelect = ({
  options,
  placeholder,
  selected,
  onChange,
}: FilterSelectProps) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(selected ?? "");

  const displayedValue = selected
    ? options.filter((o) => o.value === selected)[0]?.label
    : placeholder;

  console.log("displayedValue", displayedValue);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full flex items-center justify-between bg-white text-500 text-xs"
        >
          {displayedValue ?? "Select"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search`} className="h-9" />
          <CommandList className="overflowY">
            <CommandEmpty>Not found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    onChange(currentValue);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === option.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
