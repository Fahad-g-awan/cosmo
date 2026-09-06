import type { Clinic, Review, Specialist } from "@cosmediate/type-utils";
import type { ReviewsApiScope } from "@cosmediate/api";
import type { UserRole } from "@cosmediate/type-utils";

export type ReviewsSurface = "web" | "dashboard" | "analytics-preview";

export type ReviewReplyStatusFilter = "incoming" | "answered" | "all";

export type ReviewChartRange = "week" | "month";

export type SocketAction = "ADD" | "UPDATE" | "DELETE";

export interface ReviewsListQuery {
  search?: { query?: string };
  filters?: Record<string, unknown>;
  sort?: { by?: string; order?: "asc" | "desc" };
  pagination?: { limit?: number; nextToken?: string };
}

export interface UseReviewsDataOptions {
  targetEntityId: string;
  targetEntityType: "CLINIC" | "SPECIALIST";
  scope: ReviewsApiScope;
  accessToken?: string;
  /** Refetch when this key changes (clinic switch for managers). Not session token. */
  refetchKey?: string;
  /** Initial list query merged into every fetch */
  listQuery?: ReviewsListQuery;
  enabled?: boolean;
}

export interface DashboardReviewEntityInput {
  userRole: UserRole | null;
  activeClinicId: string | null;
  specialistProfileId?: string | null;
  clinic?: Clinic | null;
  specialist?: Specialist | null;
}

export interface ResolvedDashboardReviewEntity {
  targetEntityId: string;
  targetEntityType: "CLINIC" | "SPECIALIST";
  entity: Clinic | Specialist | null;
  refetchKey: string;
  refetchOnClinicSwitch: boolean;
}

export interface ReviewChartBin {
  data: number;
  count: number;
  /** Human-readable axis label (e.g. "Sunday", "Jun 28"). */
  label?: string;
  /** Full hover text; falls back to label + count in BarGraph. */
  tooltip?: string;
}

export interface ReviewChartBinsResult {
  reviewCountBins: ReviewChartBin[];
  reviewScoreBins: ReviewChartBin[];
  todayReviewCount?: number;
  todayAvgRating?: number;
  highlightIndex: number;
}

export type ReviewSocketHandler = (payload: {
  action: SocketAction;
  data: Review;
}) => void;

export type ReviewReplySocketHandler = (payload: {
  action: SocketAction;
  data: import("@cosmediate/type-utils").ReviewReply;
}) => void;
