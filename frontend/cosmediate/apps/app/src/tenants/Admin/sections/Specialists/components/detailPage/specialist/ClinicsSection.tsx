import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";

import { InfoMessage, Skeleton, Toaster } from "@cosmediate/ui";
import { getManagementClinicsApi } from "@cosmediate/api";
import { Clinic } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

import { LuSquareArrowOutUpRight } from "react-icons/lu";
import { LucideBriefcaseMedical } from "lucide-react";
import Link from "next/link";

export const ClinicsSection = ({ specialistId }: { specialistId: string }) => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { session } = useAuth();

  const handleFetchClinics = useCallback(async () => {
    if (!specialistId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await getManagementClinicsApi(
        { filters: { specialistId } },
        session.tokens.accessToken,
      );

      if (response.success && response.items) {
        setClinics(response.items);
      } else {
        Toaster("Failed to load treatments data", "error");
      }
    } catch (error) {
      console.error("Error fetching clinic:", error);
      Toaster("An error occurred while loading treatments data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [specialistId, session?.tokens?.accessToken]);

  useEffect(() => {
    handleFetchClinics();
  }, [handleFetchClinics]);

  return (
    <div className="w-full flex flex-col itemc-center justify-start gap-5">
      <div className="w-full flex items-center justify-start gap-2 pb-3 border-b border-stroke">
        <LucideBriefcaseMedical className="h-4 w-4" />
        Associated Clinics
      </div>

      {isLoading && clinics.length === 0 && (
        <div className="w-full grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 items-start justify-start gap-3">
          <Skeleton className="w-full h-25 rounded-xl" />
          <Skeleton className="w-full h-25 rounded-xl" />
          <Skeleton className="w-full h-25 rounded-xl" />
        </div>
      )}

      {!isLoading && clinics.length === 0 && (
        <InfoMessage
          title="Associated clinics not found for this specialist"
          message="If you think this is a mistake, please try again or contact support"
          variant="warning"
          size="sm"
        />
      )}

      <div className="w-full grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 items-start justify-start gap-3">
        {clinics?.length > 0 &&
          clinics?.map((clinic) => (
            <ItemCard key={clinic.id} clinic={clinic} />
          ))}
      </div>
    </div>
  );
};

const ItemCard = ({ clinic }: { clinic: Clinic }) => {
  return (
    <div className="relative w-full flex flex-col items-start justify-start gap-3 p-5 bg-primary-accent/5 rounded-xl group">
      <div className="w-[50px] h-[50px] aspect-square rounded-lg overflow-hidden">
        <Image
          src={clinic?.logo || "/placeholder.jpg"}
          alt={clinic?.name || "clinic"}
          width={50}
          height={50}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="text-sm text-700 font-medium capitalize">
        {clinic?.name}
      </div>

      <Link href={`/clinic-management/${clinic.id}`} target="_blank">
        <LuSquareArrowOutUpRight className="text-primary-accent/75 hover:text-primary-accent/100 cursor-pointer size-5 absolute top-5 right-5 md:scale-0 md:group-hover:scale-100 transition-all duration-200" />
      </Link>
    </div>
  );
};
