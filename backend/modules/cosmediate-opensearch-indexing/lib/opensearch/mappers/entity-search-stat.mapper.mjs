import { joinText } from "../documents.mjs";

export const mapEntitySearchStatSearchDocument = (baseDoc, data) => {
  const doc = {
    ...baseDoc,
    targetEntityType: data?.targetEntityType,
    targetEntityId: data?.targetEntityId,
    searchClicks: data?.searchClicks ?? 0,
  };
  doc.searchableText = joinText([doc.targetEntityType, doc.targetEntityId]);
  return doc;
};
