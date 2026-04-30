import type { Branch } from "../branches";

export type BookingTrack = "existing" | "custom";

export type ExistingDraft = {
  artId: string;
  artName: string;
  coverImage: string;
  variationMemo: string;
};

export type CustomImage = {
  fileUploadId: string;
  filename: string;
  previewDataUrl?: string;
};

export type CustomDraft = {
  images: CustomImage[];
  memo: string;
  uploadedAt?: number;
};

export type ContactDraft = {
  branch: Branch | "";
  name: string;
  phone: string;
  visitDate: string;
  memo: string;
};

export type YesNo = "yes" | "no";

export type HandPhoto = {
  fileUploadId: string;
  filename: string;
  previewDataUrl?: string;
};

export type PrecheckDraft = {
  gelRemoval?: YesNo;
  hasExtension?: YesNo;
  hasPartsToRemove?: YesNo;
  handPhoto?: HandPhoto;
};

export type BookingDraft = {
  track: BookingTrack | null;
  existing?: ExistingDraft;
  custom?: CustomDraft;
  contact?: ContactDraft;
  precheck?: PrecheckDraft;
};

export const EMPTY_DRAFT: BookingDraft = { track: null };
