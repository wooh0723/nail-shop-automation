"use client";

import { Controller, useWatch } from "react-hook-form";
import type {
  Control,
  FieldErrors,
  UseFormSetValue,
} from "react-hook-form";
import type { ContactFormValues } from "@/lib/booking/contactSchema";
import type { HandPhoto, YesNo } from "@/lib/booking/types";
import HandPhotoUploader from "./HandPhotoUploader";

type PrecheckPath =
  | "precheck.gelRemoval"
  | "precheck.hasExtension"
  | "precheck.hasPartsToRemove";

type Props = {
  control: Control<ContactFormValues>;
  setValue: UseFormSetValue<ContactFormValues>;
  errors: FieldErrors<ContactFormValues>;
};

function YesNoField({
  name,
  value,
  onChange,
  error,
}: {
  name: PrecheckPath;
  value: YesNo | undefined;
  onChange: (v: YesNo) => void;
  error?: string;
}) {
  function btnClass(active: boolean) {
    return [
      "h-12 rounded-lg border text-sm transition",
      active
        ? "border-foreground bg-foreground text-background"
        : "border-foreground/15 bg-transparent text-foreground hover:border-foreground/40",
    ].join(" ");
  }
  return (
    <div role="radiogroup" aria-label={name}>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          role="radio"
          aria-checked={value === "yes"}
          onClick={() => onChange("yes")}
          className={btnClass(value === "yes")}
        >
          예
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={value === "no"}
          onClick={() => onChange("no")}
          className={btnClass(value === "no")}
        >
          아니오
        </button>
      </div>
      {error && <p className="mt-1 text-[12px] text-red-600">{error}</p>}
    </div>
  );
}

function YesNoController({
  name,
  control,
  errors,
}: {
  name: PrecheckPath;
  control: Control<ContactFormValues>;
  errors: FieldErrors<ContactFormValues>;
}) {
  const errMsg =
    name === "precheck.gelRemoval"
      ? errors.precheck?.gelRemoval?.message
      : name === "precheck.hasExtension"
      ? errors.precheck?.hasExtension?.message
      : errors.precheck?.hasPartsToRemove?.message;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <YesNoField
          name={name}
          value={field.value as YesNo | undefined}
          onChange={(v) => field.onChange(v)}
          error={errMsg}
        />
      )}
    />
  );
}

export default function PrecheckSection({
  control,
  setValue,
  errors,
}: Props) {
  const gelRemoval = useWatch({ control, name: "precheck.gelRemoval" });
  const hasExtension = useWatch({ control, name: "precheck.hasExtension" });
  const hasPartsToRemove = useWatch({
    control,
    name: "precheck.hasPartsToRemove",
  });
  const handPhoto = useWatch({ control, name: "precheck.handPhoto" });

  const showFollowups = gelRemoval === "yes";
  const needsPhoto =
    showFollowups &&
    (hasExtension === "yes" || hasPartsToRemove === "yes");

  return (
    <section className="mb-6 rounded-2xl border border-foreground/10 p-4">
      <header className="mb-3">
        <h2 className="text-[13px] font-medium tracking-tight">
          예약 전 확인 <span className="text-foreground/40">(선택)</span>
        </h2>
        <p className="mt-1 text-[11px] text-foreground/50">
          시술 시간 확인에 도움이 돼요.
        </p>
      </header>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-[13px] text-foreground/80">
            젤 제거가 필요하신가요?
          </p>
          <YesNoController
            name="precheck.gelRemoval"
            control={control}
            errors={errors}
          />
        </div>

        {showFollowups && (
          <>
            <div>
              <p className="mb-2 text-[13px] text-foreground/80">
                현재 손에 연장 시술이 되어 있나요?
              </p>
              <YesNoController
                name="precheck.hasExtension"
                control={control}
                errors={errors}
              />
            </div>

            <div>
              <p className="mb-2 text-[13px] text-foreground/80">
                제거해야 할 파츠가 있나요?
              </p>
              <YesNoController
                name="precheck.hasPartsToRemove"
                control={control}
                errors={errors}
              />
            </div>
          </>
        )}

        {needsPhoto && (
          <div>
            <p className="mb-2 text-[13px] text-foreground/80">
              현재 손사진을 첨부해주세요
            </p>
            <HandPhotoUploader
              value={handPhoto as HandPhoto | undefined}
              onChange={(next) =>
                setValue("precheck.handPhoto", next, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            />
            {errors.precheck?.handPhoto?.message && (
              <p className="mt-1 text-[12px] text-red-600">
                {errors.precheck.handPhoto.message}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
