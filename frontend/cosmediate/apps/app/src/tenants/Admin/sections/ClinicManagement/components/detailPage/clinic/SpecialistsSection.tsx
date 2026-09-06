import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";

import { InfoMessage, Skeleton, Toaster } from "@cosmediate/ui";
import { getManagementSpecialistsApi } from "@cosmediate/api";
import { Specialist } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

import { LuSquareArrowOutUpRight } from "react-icons/lu";
import { LucideBriefcaseMedical } from "lucide-react";
import Link from "next/link";

export const SpecialistsSection = ({ clinicId }: { clinicId: string }) => {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { session } = useAuth();

  const handleFetchSpecialists = useCallback(async () => {
    if (!clinicId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await getManagementSpecialistsApi(
        { filters: { clinicId } },
        session.tokens.accessToken,
      );

      if (response.success && response.items) {
        setSpecialists(response.items);
      } else {
        Toaster("Failed to load specialists data", "error");
      }
    } catch (error) {
      console.error("Error fetching clinic:", error);
      Toaster("An error occurred while loading specialists data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [clinicId, session?.tokens?.accessToken]);

  useEffect(() => {
    handleFetchSpecialists();
  }, [handleFetchSpecialists]);

  return (
    <div className="w-full flex flex-col itemc-center justify-start gap-5">
      <div className="w-full flex items-center justify-start gap-2 pb-3 border-b border-stroke">
        <LucideBriefcaseMedical className="h-4 w-4" />
        Clinic Assoaciated Specialists
      </div>

      {isLoading && specialists.length === 0 && (
        <div className="w-full grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 items-start justify-start gap-3">
          <Skeleton className="w-full h-25 rounded-xl" />
          <Skeleton className="w-full h-25 rounded-xl" />
          <Skeleton className="w-full h-25 rounded-xl" />
        </div>
      )}

      {!isLoading && specialists.length === 0 && (
        <InfoMessage
          title="No specialists found for this clinic"
          message="If you think this is a mistake, please try again or contact support"
          variant="warning"
          size="sm"
        />
      )}

      <div className="w-full grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 items-start justify-start gap-3">
        {specialists?.length > 0 &&
          specialists?.map((specialist) => (
            <ItemCard key={specialist.id} specialist={specialist} />
          ))}
      </div>
    </div>
  );
};

const ItemCard = ({ specialist }: { specialist: Specialist }) => {
  return (
    <div className="relative group w-full flex flex-col items-start justify-start gap-3 p-5 bg-primary-accent/5 rounded-xl">
      <div className="w-[50px] h-[50px] aspect-square rounded-lg overflow-hidden">
        <Image
          src={specialist?.image || "/placeholder.jpg"}
          alt={specialist?.fullName || "clinic-specialist"}
          width={50}
          height={50}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="text-sm text-700 font-medium capitalize">
        {specialist?.fullName}
      </div>

      <Link href={`/specialists/${specialist.id}`} target="_blank">
        <LuSquareArrowOutUpRight className="text-primary-accent/75 hover:text-primary-accent/100 cursor-pointer size-5 absolute top-5 right-5 md:scale-0 md:group-hover:scale-100 transition-all duration-200" />
      </Link>
    </div>
  );
};
