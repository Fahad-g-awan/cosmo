"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@cosmediate/ui/components/dropdown-menu";
import { Button } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import { RiDeleteBinLine } from "react-icons/ri";
import { MdOutlineEdit } from "react-icons/md";

export const ReviewActionMenu = ({
  handleDelete,
  handleEdit,
  buttonClassName,
}: {
  handleDelete: () => void;
  handleEdit: () => void;
  buttonClassName?: string;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("rounded-full p-3 py-5.5", buttonClassName)}
        >
          <PiDotsThreeVerticalBold className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[100px]" align="end">
        <DropdownMenuItem
          onClick={handleEdit}
          className="cursor-pointer py-2.5 flex items-center justify-start gap-2"
        >
          <MdOutlineEdit />
          <span>Edit</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          className="cursor-pointer py-2.5 flex items-center justify-start gap-2"
        >
          <RiDeleteBinLine />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
