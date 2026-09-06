import { joinText } from "../documents.mjs";

export const mapReviewReplySearchDocument = (baseDoc, data) => {
  const doc = {
    ...baseDoc,
    reviewId: data?.reviewId,
    targetEntityType: data?.targetEntityType,
    targetEntityId: data?.targetEntityId,
    targetName: data?.targetName,
    targetEmail: data?.targetEmail,
    targetImage: data?.targetImage ?? "",
    targetCompleteAddress: data?.targetCompleteAddress ?? "",
    authorId: data?.authorId,
    authorRole: data?.authorRole,
    authorName: data?.authorName,
    authorEmail: data?.authorEmail,
    authorImage: data?.authorImage ?? "",
    authorCompleteAddress: data?.authorCompleteAddress ?? "",
    comment: data?.comment ?? "",
    status: data?.status,
  };

  doc.searchableText = joinText([
    doc.comment,
    doc.targetName,
    doc.targetEmail,
    doc.authorName,
    doc.authorEmail,
    doc.targetCompleteAddress,
  ]);

  return doc;
};
