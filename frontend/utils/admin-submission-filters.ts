export interface AdminSubmissionFilterState {
  search: string;
  status: string;
  paymentStatus: string;
  track: string;
  presentationFormat: string;
  reviewerId: string;
  submitterType: string;
  educationLevel: string;
  wantsFullPaper: string;
  fileStatus: string;
}

export function createEmptyAdminSubmissionFilters(): AdminSubmissionFilterState {
  return {
    search: "",
    status: "",
    paymentStatus: "",
    track: "",
    presentationFormat: "",
    reviewerId: "",
    submitterType: "",
    educationLevel: "",
    wantsFullPaper: "",
    fileStatus: "",
  };
}

export function buildAdminSubmissionSearchParams(state: AdminSubmissionFilterState): URLSearchParams {
  const params = new URLSearchParams();
  const trimmedSearch = state.search.trim();
  if (trimmedSearch) params.set("search", trimmedSearch);
  if (state.status) params.set("status", state.status);
  if (state.paymentStatus) params.set("paymentStatus", state.paymentStatus);
  if (state.track) params.set("track", state.track);
  if (state.presentationFormat) params.set("presentationFormat", state.presentationFormat);
  if (state.reviewerId) params.set("reviewerId", state.reviewerId);
  if (state.submitterType) params.set("submitterType", state.submitterType);
  if (state.educationLevel) params.set("educationLevel", state.educationLevel);
  if (state.wantsFullPaper !== "") params.set("wantsFullPaper", state.wantsFullPaper);
  if (state.fileStatus) params.set("fileStatus", state.fileStatus);
  return params;
}

export function countSecondaryAdminFilters(state: AdminSubmissionFilterState): number {
  let count = 0;
  if (state.submitterType) count += 1;
  if (state.educationLevel) count += 1;
  if (state.wantsFullPaper !== "") count += 1;
  if (state.fileStatus) count += 1;
  return count;
}

export function hasActiveAdminSubmissionFilters(
  state: AdminSubmissionFilterState,
  rawSearchInput: string,
): boolean {
  return Boolean(
    rawSearchInput.trim()
    || state.search.trim()
    || state.status
    || state.paymentStatus
    || state.track
    || state.presentationFormat
    || state.reviewerId
    || countSecondaryAdminFilters(state) > 0,
  );
}
