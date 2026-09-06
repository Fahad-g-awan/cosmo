import Image from "next/image";
import React from "react";

import { Clinic } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";
import { Badge } from "@cosmediate/ui";

import { CrudProfileActions } from "@app/components/profile/CrudProfileActions";

import { FaRegComments } from "react-icons/fa6";
import { Star } from "lucide-react";

export const HeaderSection = ({
  clinic,
  handleDelete,
  perms = [],
}: {
  clinic: Clinic;
  handleDelete: () => void;
  perms?: string[];
}) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "BLOCKED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center gap-5 bg-gradient-lite-violet px-6 py-8">
      <div className="w-full grid grid-cols-4 items-center justify-center max-sm:grid-cols-1 gap-5 max-sm:gap-10">
        <div className="w-full col-span-3 flex items-center justify-start max-sm:flex-col max-sm:items-center gap-5">
          <div className="w-[150px] shrink-0 aspect-square flex items-center justify-center rounded-full p-1 bg-white border-2 border-primary-accent overflow-hidden">
            <Image
              src={clinic?.logo || "/placeholder.jpg"}
              height={500}
              width={500}
              alt={clinic.name || "clinic logo"}
              className="w-full object-cover rounded-full"
            />
          </div>

          <div className="w-full flex flex-col items-start justify-start max-sm:items-center gap-4">
            {/* Name, status, Address */}
            <div className="w-full flex flex-col items-start justify-start max-sm:items-center gap-1">
              <div
                className={cn(
                  "w-full flex items-center justify-start gap-1",
                  "max-xl:flex-col max-xl:items-start",
                  "max-lg:flex-row max-lg:items-center",
                  "max-sm:flex-col max-sm:items-center max-sm:justify-center",
                )}
              >
                <h1 className="text-2xl font-bold capitalize text-800 break-all max-sm:text-center">
                  {clinic.name}
                </h1>

                <div className="flex flex-wrap items-center justify-start gap-2">
                  {clinic.status && (
                    <Badge
                      className={cn(getStatusColor(clinic.status), "text-xs")}
                    >
                      {clinic.status}
                    </Badge>
                  )}
                  {clinic.available !== undefined && (
                    <Badge
                      variant={clinic.available ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {clinic.available ? "Available" : "Unavailable"}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-600 max-sm:text-center break-all">
                {clinic.completeAddress}
              </p>
            </div>

            <Badge className={cn("text-xs bg-yellow-300")}>
              {clinic.clinicType}
            </Badge>

            {/* Ratings */}
            <div className={cn("w-fit flex items-center justify-start gap-6")}>
              <div className={cn("flex items-center justify-center gap-1")}>
                <Star size={20} className={cn("text-blue-500 opacity-70")} />
                <span
                  className={cn(
                    "text-[14px] leading-[21px] font-medium text-500",
                  )}
                >
                  {Number((clinic.avgRating || 0).toFixed(1))}
                </span>
              </div>

              <div className={cn("flex items-center justify-center gap-1")}>
                <FaRegComments
                  size={20}
                  className={cn("text-yellow-500 opacity-70")}
                />
                <span
                  className={cn(
                    "text-[14px] leading-[21px] font-medium text-500",
                  )}
                >
                  {clinic.reviewCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        <CrudProfileActions
          perms={perms}
          resource="clinic"
          editHref={`/clinic-management/update/${clinic.id}`}
          onDelete={handleDelete}
          className="w-full col-span-1 flex self-start items-start justify-end max-sm:justify-start max-sm:w-full gap-3"
        />
      </div>

      <span className={"w-full text-sm text-700 leading-6"}>
        {clinic.overview}
      </span>
    </div>
  );
};
