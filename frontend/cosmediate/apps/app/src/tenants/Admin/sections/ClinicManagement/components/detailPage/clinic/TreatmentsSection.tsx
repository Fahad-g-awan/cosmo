import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";

import { listManagementClinicSpecialistTreatmentsApi } from "@cosmediate/api";
import { InfoMessage, Skeleton, Toaster } from "@cosmediate/ui";
import { useAuth } from "@cosmediate/auth";

import { LuSquareArrowOutUpRight } from "react-icons/lu";
import { LucideBriefcaseMedical } from "lucide-react";
import Link from "next/link";

import {
  dedupeProfileTreatments,
  mapAssignmentToProfileCard,
  ProfileTreatmentCard,
} from "@app/clinic/sections/Settings/types/treatment.types";

export const TreatmentsSection = ({ clinicId }: { clinicId: string }) => {
  const [treatments, setTreatments] = useState<ProfileTreatmentCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  const handleFetchTreatments = useCallback(async () => {
    if (!clinicId || !accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await listManagementClinicSpecialistTreatmentsApi(
        { filters: { clinicId } },
        accessToken,
      );

      if (response.success && response.items) {
        setTreatments(
          dedupeProfileTreatments(
            response.items.map(mapAssignmentToProfileCard),
          ),
        );
      } else {
        Toaster("Failed to load treatments data", "error");
      }
    } catch (error) {
      console.error("Error fetching clinic treatments:", error);
      Toaster("An error occurred while loading treatments data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [clinicId, accessToken]);

  useEffect(() => {
    void handleFetchTreatments();
  }, [handleFetchTreatments]);

  return (
    <div className="w-full flex flex-col itemc-center justify-start gap-5">
      <div className="w-full flex items-center justify-start gap-2 pb-3 border-b border-stroke">
        <LucideBriefcaseMedical className="h-4 w-4" />
        Clinic Selected Treatments
      </div>

      {isLoading && treatments.length === 0 && (
        <div className="w-full grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 items-start justify-start gap-3">
          <Skeleton className="w-full h-25 rounded-xl" />
          <Skeleton className="w-full h-25 rounded-xl" />
          <Skeleton className="w-full h-25 rounded-xl" />
        </div>
      )}

      {!isLoading && treatments.length === 0 && (
        <InfoMessage
          title="No treatments found for this clinic"
          message="If you think this is a mistake, please try again or contact support"
          variant="warning"
          size="sm"
        />
      )}

      <div className="w-full grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 items-start justify-start gap-3">
        {treatments.map((treatment) => (
          <ItemCard key={treatment.clinicTreatmentId} treatment={treatment} />
        ))}
      </div>
    </div>
  );
};

const ItemCard = ({ treatment }: { treatment: ProfileTreatmentCard }) => {
  return (
    <div className="relative w-full flex flex-col items-start justify-start gap-3 p-5 bg-primary-accent/5 rounded-xl group">
      <div className="w-[50px] h-[50px] aspect-square rounded-lg overflow-hidden">
        <Image
          src={treatment.image || "/placeholder.jpg"}
          alt={treatment.name || "clinic-treatment"}
          width={50}
          height={50}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="text-sm text-700 font-medium capitalize">
        {treatment.name}
      </div>

      <Link href={`/treatments/${treatment.treatmentId}`} target="_blank">
        <LuSquareArrowOutUpRight className="text-primary-accent/75 hover:text-primary-accent/100 cursor-pointer size-5 absolute top-5 right-5 md:scale-0 md:group-hover:scale-100 transition-all duration-200" />
      </Link>
    </div>
  );
};
