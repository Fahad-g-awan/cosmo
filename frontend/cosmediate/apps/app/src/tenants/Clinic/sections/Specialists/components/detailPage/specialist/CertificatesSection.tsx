import Image from "next/image";
import React from "react";

import { Certificates } from "@cosmediate/type-utils";

import { cn } from "@cosmediate/ui/lib/utils";
import { InfoMessage } from "@cosmediate/ui";

import { FileText } from "lucide-react";

export const CertificatesSection = ({
  certificates,
}: {
  certificates: Certificates[];
}) => {
  return (
    <div className="w-full flex flex-col itemc-center justify-start gap-5">
      <div className="w-full flex items-center justify-start gap-2 pb-3 border-b border-stroke">
        <FileText className="h-4 w-4" />
        Clinic Certificates
      </div>

      {(!certificates || certificates?.length === 0) && (
        <InfoMessage
          title="Clinic certificates not found"
          message="If you think this is a misstake, please try again or contact support"
          className="w-full"
          size="sm"
        />
      )}

      {(certificates || []).length > 0 && (
        <div className="w-full flex items-start justify-start gap-6 overflow-x-auto overflow-lite p-2">
          {(certificates || []).map((item, index: number) => {
            return <CertificateCard key={index} item={item} />;
          })}
        </div>
      )}
    </div>
  );
};

const CertificateCard = ({ item }: { item: Certificates }) => {
  return (
    <div
      className={cn(
        "relative w-[150px] h-[110px] shrink-0 flex items-center justify-center bg-ghost-blue border border-stroke rounded-lg"
      )}
    >
      <Image
        src={item.certificateImage || "/placeholder.jpg"}
        alt={`certificate image ${item.name}`}
        height={200}
        width={200}
        className="w-full h-full absolute -top-2 left-2 rounded-lg object-cover shadow border border-stroke"
      />
      <div className="w-full h-full bg-ghost-blue-2/70 absolute -top-2 left-2 rounded-lg"></div>
      <div
        className={cn(
          "absolute w-[90%] h-[80px] bottom-3.5 left-3.5 flex items-end justify-start text-sm text-wrap text-700 font-bold leading-[17px] overflow-y-auto overflow-lite uppercase"
        )}
      >
        {item.name}
      </div>
    </div>
  );
};
