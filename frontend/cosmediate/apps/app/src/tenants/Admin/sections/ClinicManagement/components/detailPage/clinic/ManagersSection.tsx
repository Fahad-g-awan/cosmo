import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";

import { ClinicManager } from "@cosmediate/type-utils";

import { InfoMessage, Skeleton, Toaster } from "@cosmediate/ui/index";
import { getClinicManagersApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

import { LuSquareArrowOutUpRight } from "react-icons/lu";
import { GrUserAdmin } from "react-icons/gr";
import Link from "next/link";

export const ManagersSection = ({ clinicId }: { clinicId: string }) => {
  const [managers, setManagers] = useState<ClinicManager[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { session } = useAuth();

  const handleFetchManagers = useCallback(async () => {
    if (!session?.tokens?.accessToken || !session) {
      Toaster(
        "Unauthorized Access",
        "error",
        "Please signin again or contact support"
      );
      return { items: [], total: 0 };
    }

    try {
      setIsLoading(true);

      const res = await getClinicManagersApi(
        {
          filters: { clinicId },
        },
        session.tokens.accessToken
      );

      if (res.success) {
        setManagers(res.items);
      } else {
        Toaster(
          "Managers data not found",
          "error",
          "Please try again or contact support"
        );
      }
    } catch (error) {
      console.error("Error fetching manager records:", error);
      Toaster(
        "Something went wrong",
        "error",
        "Please try again or contact support"
      );
    } finally {
      setIsLoading(false);
    }
  }, [session, clinicId]);

  useEffect(() => {
    handleFetchManagers();
  }, [handleFetchManagers]);

  return (
    <div className="w-full flex flex-col itemc-center justify-start gap-5">
      <div className="w-full flex items-center justify-start gap-2 pb-3 border-b border-stroke">
        <GrUserAdmin className="h-4 w-4" />
        Associated Managers
      </div>

      {isLoading && managers.length === 0 && (
        <div className="w-full grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 items-start justify-start gap-3">
          <Skeleton className="w-full h-25 rounded-xl" />
          <Skeleton className="w-full h-25 rounded-xl" />
          <Skeleton className="w-full h-25 rounded-xl" />
        </div>
      )}

      {!isLoading && managers.length === 0 && (
        <InfoMessage
          title="No managers found for this clinic"
          message="If you think this is a mistake, please try again or contact support"
          variant="warning"
          size="sm"
        />
      )}

      {managers?.length > 0 && !isLoading && (
        <div className="w-full grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 items-start justify-start gap-3">
          {managers?.map((manager) => (
            <ItemCard key={manager.id} manager={manager} />
          ))}
        </div>
      )}
    </div>
  );
};

const ItemCard = ({ manager }: { manager: ClinicManager }) => {
  return (
    <div className="relative group w-full flex flex-col items-start justify-start gap-3 p-5 bg-primary-accent/5 rounded-xl">
      <div className="w-[50px] h-[50px] aspect-square rounded-lg overflow-hidden">
        <Image
          src={manager?.image || "/placeholder.jpg"}
          alt={manager?.fullName || "clinic-manager"}
          width={50}
          height={50}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="text-sm text-700 font-medium capitalize">
        {manager?.fullName}
      </div>

      <Link href={`/clinic-management/managers/${manager.id}`} target="_blank">
        <LuSquareArrowOutUpRight className="text-primary-accent/75 hover:text-primary-accent/100 cursor-pointer size-5 absolute top-5 right-5 md:scale-0 md:group-hover:scale-100 transition-all duration-200" />
      </Link>
    </div>
  );
};
