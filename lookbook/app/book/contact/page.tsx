"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import BackButton from "@/app/components/booking/BackButton";
import SummaryCard from "@/app/components/booking/SummaryCard";
import PrecheckSection from "@/app/components/booking/PrecheckSection";
import { useBookingDraft } from "@/lib/booking/useBookingDraft";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/lib/booking/contactSchema";
import { isExpiringSoon } from "@/lib/booking/uploadGuard";
import { BRANCHES, type Branch } from "@/lib/branches";
import type { BookingDraft } from "@/lib/booking/types";

export default function ContactPage() {
  const router = useRouter();
  const { draft, patch, hydrated } = useBookingDraft();

  // Direct entry guard
  useEffect(() => {
    if (!hydrated) return;
    if (!draft.track) router.replace("/book");
  }, [hydrated, draft.track, router]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[390px] px-5 pt-10">
        <p className="text-sm text-foreground/40">불러오는 중…</p>
      </div>
    );
  }

  if (!draft.track) {
    return null;
  }

  return <ContactForm draft={draft} patch={patch} router={router} />;
}

function ContactForm({
  draft,
  patch,
  router,
}: {
  draft: BookingDraft;
  patch: (partial: Partial<BookingDraft>) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const backTo = draft.track === "custom" ? "/book/custom" : "/?mode=select";
  const expiring =
    draft.track === "custom" && isExpiringSoon(draft.custom?.uploadedAt);

  const initialBranch =
    draft.contact?.branch && BRANCHES.includes(draft.contact.branch as Branch)
      ? (draft.contact.branch as Branch)
      : undefined;

  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      branch: initialBranch,
      name: draft.contact?.name || "",
      phone: draft.contact?.phone || "",
      visitDate: draft.contact?.visitDate || "",
      memo: draft.contact?.memo || "",
      precheck: {
        gelRemoval: draft.precheck?.gelRemoval,
        hasExtension: draft.precheck?.hasExtension,
        hasPartsToRemove: draft.precheck?.hasPartsToRemove,
        handPhoto: draft.precheck?.handPhoto,
      },
    },
  });

  // Persist on each field change so refresh restores values
  const branchVal = watch("branch");
  const nameVal = watch("name");
  const phoneVal = watch("phone");
  const visitDateVal = watch("visitDate");
  const memoVal = watch("memo");
  const gelRemovalVal = watch("precheck.gelRemoval");
  const hasExtensionVal = watch("precheck.hasExtension");
  const hasPartsToRemoveVal = watch("precheck.hasPartsToRemove");
  const handPhotoIdVal = watch("precheck.handPhoto.fileUploadId");

  useEffect(() => {
    patch({
      contact: {
        branch: (branchVal as Branch) ?? "",
        name: nameVal ?? "",
        phone: phoneVal ?? "",
        visitDate: visitDateVal ?? "",
        memo: memoVal ?? "",
      },
      precheck: {
        gelRemoval: gelRemovalVal,
        hasExtension: hasExtensionVal,
        hasPartsToRemove: hasPartsToRemoveVal,
        handPhoto: getValues("precheck.handPhoto"),
      },
    });
    // patch + getValues are stable, exclude from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    branchVal,
    nameVal,
    phoneVal,
    visitDateVal,
    memoVal,
    gelRemovalVal,
    hasExtensionVal,
    hasPartsToRemoveVal,
    handPhotoIdVal,
  ]);

  async function onSubmit(values: ContactFormValues) {
    setSubmitError(null);

    const cleanContact = {
      branch: values.branch,
      name: values.name.trim(),
      phone: values.phone.trim(),
      visitDate: values.visitDate,
      memo: values.memo?.trim() ?? "",
    };
    // Drop hidden answers: when gelRemoval=no, follow-ups + photo are irrelevant.
    // When both follow-ups=no, the photo is irrelevant.
    const precheckRaw = values.precheck;
    const cleanPrecheck =
      precheckRaw.gelRemoval === "yes"
        ? {
            gelRemoval: "yes" as const,
            hasExtension: precheckRaw.hasExtension!,
            hasPartsToRemove: precheckRaw.hasPartsToRemove!,
            handPhoto:
              precheckRaw.hasExtension === "yes" ||
              precheckRaw.hasPartsToRemove === "yes"
                ? precheckRaw.handPhoto
                  ? {
                      fileUploadId: precheckRaw.handPhoto.fileUploadId,
                      filename: precheckRaw.handPhoto.filename,
                    }
                  : undefined
                : undefined,
          }
        : { gelRemoval: "no" as const };
    patch({ contact: cleanContact });

    const payload =
      draft.track === "existing" && draft.existing
        ? {
            track: "existing" as const,
            existing: draft.existing,
            contact: cleanContact,
            precheck: cleanPrecheck,
          }
        : draft.track === "custom"
        ? {
            track: "custom" as const,
            custom: {
              images: (draft.custom?.images ?? []).map((i) => ({
                fileUploadId: i.fileUploadId,
                filename: i.filename,
              })),
              memo: draft.custom?.memo ?? "",
            },
            contact: cleanContact,
            precheck: cleanPrecheck,
          }
        : null;

    if (!payload) {
      setSubmitError("이전 단계 정보가 없습니다. 처음부터 다시 진행해주세요.");
      return;
    }

    let res: Response;
    try {
      res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      setSubmitError("네트워크 오류가 발생했어요. 다시 시도해주세요.");
      return;
    }

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setSubmitError(data.error || "제출에 실패했어요. 다시 시도해주세요.");
      return;
    }

    await res.json().catch(() => ({}));
    router.push("/book/done");
  }

  return (
    <div className="mx-auto max-w-[390px] px-5 pb-24 pt-4">
      <div className="mb-4">
        <BackButton to={backTo} />
      </div>

      <div className="stagger-reveal">
        <header className="mb-6">
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-tight">
            예약자 정보
          </h1>
          <p className="mt-2 text-sm text-foreground/70">
            신청 전 마지막 단계예요.
          </p>
        </header>

        <section className="mb-5">
          <SummaryCard draft={draft} />
        </section>

        {expiring && (
          <div className="mb-4 rounded-lg border border-yellow-700/30 bg-yellow-50/70 p-3 text-[12px] leading-relaxed text-yellow-900">
            이미지 업로드 후 시간이 오래 경과했어요. 변경 → 다시 업로드를 권장해요.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <PrecheckSection
            control={control}
            setValue={setValue}
            errors={errors}
          />
          <fieldset className="mb-4">
            <label
              htmlFor="branch"
              className="mb-2 block text-sm text-foreground/70"
            >
              지점
            </label>
            <select
              id="branch"
              defaultValue={initialBranch ?? ""}
              {...register("branch")}
              className="h-12 w-full rounded-lg border border-foreground/15 bg-transparent px-3 text-sm focus:border-foreground/40 focus:outline-none"
            >
              <option value="" disabled>
                지점을 선택하세요
              </option>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}점
                </option>
              ))}
            </select>
            {errors.branch && (
              <p className="mt-1 text-[12px] text-red-600">
                {errors.branch.message}
              </p>
            )}
          </fieldset>

          <fieldset className="mb-4">
            <label
              htmlFor="name"
              className="mb-2 block text-sm text-foreground/70"
            >
              이름
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              {...register("name")}
              className="h-12 w-full rounded-lg border border-foreground/15 bg-transparent px-3 text-sm focus:border-foreground/40 focus:outline-none"
            />
            {errors.name && (
              <p className="mt-1 text-[12px] text-red-600">
                {errors.name.message}
              </p>
            )}
          </fieldset>

          <fieldset className="mb-4">
            <label
              htmlFor="phone"
              className="mb-2 block text-sm text-foreground/70"
            >
              연락처
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="010-1234-5678"
              {...register("phone")}
              className="h-12 w-full rounded-lg border border-foreground/15 bg-transparent px-3 text-sm placeholder:text-foreground/30 focus:border-foreground/40 focus:outline-none"
            />
            {errors.phone && (
              <p className="mt-1 text-[12px] text-red-600">
                {errors.phone.message}
              </p>
            )}
          </fieldset>

          <fieldset className="mb-4">
            <label
              htmlFor="visitDate"
              className="mb-2 block text-sm text-foreground/70"
            >
              방문 예정일
            </label>
            <input
              id="visitDate"
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              {...register("visitDate")}
              className="h-12 w-full rounded-lg border border-foreground/15 bg-transparent px-3 text-sm focus:border-foreground/40 focus:outline-none"
            />
            {errors.visitDate && (
              <p className="mt-1 text-[12px] text-red-600">
                {errors.visitDate.message}
              </p>
            )}
          </fieldset>

          <fieldset className="mb-6">
            <label
              htmlFor="memo"
              className="mb-2 block text-sm text-foreground/70"
            >
              메모 <span className="text-foreground/40">(선택)</span>
            </label>
            <textarea
              id="memo"
              rows={3}
              maxLength={500}
              placeholder="기타 요청사항 있으시면 자유롭게 작성해주세요"
              {...register("memo")}
              className="w-full rounded-lg border border-foreground/15 bg-transparent p-3 text-sm placeholder:text-foreground/30 focus:border-foreground/40 focus:outline-none"
            />
            {errors.memo && (
              <p className="mt-1 text-[12px] text-red-600">
                {errors.memo.message}
              </p>
            )}
          </fieldset>

          {submitError && (
            <p className="mb-3 rounded-lg border border-red-700/30 bg-red-50/70 p-3 text-[12px] leading-relaxed text-red-800">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="magnetic-btn flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-foreground text-sm tracking-wide text-background disabled:opacity-50"
          >
            {isSubmitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
            )}
            제출
          </button>
        </form>
      </div>
    </div>
  );
}
