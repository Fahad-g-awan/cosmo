import React from "react";

import SubHeader from "@web/layout/SubHeader";
import type { HeaderConfig } from "../types";

export const DetailsPageHeader = ({ header }: { header: HeaderConfig }) => {
  switch (header.type) {
    case "entity": {
      const { entity: entityData, entityType } = header;

      return (
        <SubHeader.HeaderContentContainer>
          <SubHeader.EntityImage
            src={entityData.image || "/placeholder.jpg"}
            alt={entityData.name}
            containerClassName={
              entityType === "specialist"
                ? "size-33.75 rounded-full overflow-hidden max-lg:size-25"
                : "size-33.75 rounded-xl overflow-hidden max-lg:size-25"
            }
            imageClassName="rounded-xl"
          />
          <div className="flex flex-col items-start justify-center gap-2 max-lg:items-center">
            <SubHeader.EntityName name={entityData.name} className="" />
            <div className="w-full flex items-start justify-start gap-3 max-lg:flex-col max-lg:items-center max-lg:text-center">
              {entityData.rating && entityData.reviewCount && (
                <SubHeader.EntityRating
                  rating={Number(entityData.rating).toFixed(1)}
                  reviewCount={entityData.reviewCount}
                />
              )}
              {entityData.address && entityType === "clinic" && (
                <SubHeader.ClinicAddress address={entityData.address} />
              )}
              {entityData.address && entityType === "specialist" && (
                <SubHeader.SpecialistAddress address={entityData.address} />
              )}
            </div>
          </div>
        </SubHeader.HeaderContentContainer>
      );
    }
    case "title":
      return <SubHeader.Title>{header.title}</SubHeader.Title>;
    case "custom":
      return <>{header.content}</>;
    default:
      return null;
  }
};
