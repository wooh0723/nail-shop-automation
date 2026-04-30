import { z } from "zod";
import { BRANCHES, type Branch } from "../branches";

const PHONE_RE = /^01[016789]-?\d{3,4}-?\d{4}$/;

const yesNo = z.enum(["yes", "no"]);

const handPhotoSchema = z.object({
  fileUploadId: z.string().min(1),
  filename: z.string(),
  previewDataUrl: z.string().optional(),
});

export const precheckSchema = z
  .object({
    gelRemoval: yesNo.optional(),
    hasExtension: yesNo.optional(),
    hasPartsToRemove: yesNo.optional(),
    handPhoto: handPhotoSchema.optional(),
  })
  .superRefine((val, ctx) => {
    if (!val.gelRemoval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gelRemoval"],
        message: "선택해주세요",
      });
      return;
    }
    if (val.gelRemoval === "yes") {
      if (!val.hasExtension) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hasExtension"],
          message: "선택해주세요",
        });
      }
      if (!val.hasPartsToRemove) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hasPartsToRemove"],
          message: "선택해주세요",
        });
      }
      const needsPhoto =
        val.hasExtension === "yes" || val.hasPartsToRemove === "yes";
      if (needsPhoto && !val.handPhoto) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["handPhoto"],
          message: "현재 손사진을 첨부해주세요",
        });
      }
    }
  });

// Schema for the bare contact fields (used by /api/booking).
export const contactSchema = z.object({
  branch: z.enum([...BRANCHES] as [Branch, ...Branch[]], {
    message: "지점을 선택해주세요",
  }),
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
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "방문 예정일을 선택해주세요"),
  memo: z.string().max(500, "메모는 500자 이내로 입력해주세요").optional(),
});

// Form schema bundles contact + precheck so RHF can validate both at once.
export const contactFormSchema = contactSchema.extend({
  precheck: precheckSchema,
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
