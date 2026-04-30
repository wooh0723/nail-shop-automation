import { z } from "zod";
import { BRANCHES, type Branch } from "../branches";

const PHONE_RE = /^01[016789]-?\d{3,4}-?\d{4}$/;

const yesNo = z.enum(["yes", "no"]);

const handPhotoSchema = z.object({
  fileUploadId: z.string().min(1),
  filename: z.string(),
  previewDataUrl: z.string().optional(),
});

export const precheckSchema = z.object({
  gelRemoval: yesNo.optional(),
  hasExtension: yesNo.optional(),
  hasPartsToRemove: yesNo.optional(),
  handPhoto: handPhotoSchema.optional(),
});

// Schema for the bare contact fields (used by /api/booking).
// Only name/phone are required; everything else is optional.
export const contactSchema = z.object({
  branch: z
    .union([
      z.enum([...BRANCHES] as [Branch, ...Branch[]]),
      z.literal(""),
    ])
    .optional(),
  name: z
    .string()
    .trim()
    .min(1, "이름을 입력해주세요")
    .max(40, "이름은 40자 이내로 입력해주세요"),
  phone: z
    .string()
    .trim()
    .regex(
      PHONE_RE,
      "휴대폰 번호 형식이 아닙니다 (예: 010-1234-5678)"
    ),
  visitDate: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal("")])
    .optional(),
  memo: z.string().max(500, "메모는 500자 이내로 입력해주세요").optional(),
});

// Form schema bundles contact + precheck so RHF can validate both at once.
export const contactFormSchema = contactSchema.extend({
  precheck: precheckSchema,
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
