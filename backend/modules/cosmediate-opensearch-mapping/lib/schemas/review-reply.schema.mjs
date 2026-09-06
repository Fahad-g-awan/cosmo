import { kw, kwNorm, textAC, Integer } from "../types.mjs";
import { indexSettings } from "../settings.mjs";

export const buildReviewReplyMapping = (baseProps) => ({
  settings: indexSettings(),
  mappings: {
    dynamic: "strict",
    properties: {
      ...baseProps,
      reviewId: kw(),
      targetEntityType: kw(),
      targetEntityId: kw(),
      targetName: textAC(),
      targetEmail: kwNorm(),
      targetImage: kw(),
      targetCompleteAddress: textAC(),
      authorId: kw(),
      authorRole: kw(),
      authorName: textAC(),
      authorEmail: kwNorm(),
      authorImage: kw(),
      authorCompleteAddress: textAC(),
      comment: textAC(),
      status: kw(),
    },
  },
});
