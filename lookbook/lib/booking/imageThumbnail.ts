// Resize the original image down to fit Vercel's 4.5MB request body cap.
// Phone photos are often 10MB+ HEIC/JPEG; we re-encode to JPEG at maxDim=1920.
export function resizeForUpload(
  file: File,
  maxDim = 1920,
  quality = 0.85
): Promise<File> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1);
        const w = Math.max(1, Math.round(img.width * ratio));
        const h = Math.max(1, Math.round(img.height * ratio));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const newName = file.name.replace(/\.[^.]+$/, ".jpg") || "photo.jpg";
            resolve(new File([blob], newName, { type: "image/jpeg" }));
          },
          "image/jpeg",
          quality
        );
      } catch {
        resolve(file);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    // HEIC etc. that the browser can't decode: fall back to the original
    // (will hit Vercel's 4.5MB cap if too big — the upload route surfaces an error).
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

// Thumbnail used as sessionStorage preview. Full-size base64 would blow the 5MB quota.
export function makeThumbnail(file: File, maxSize = 240): Promise<string | undefined> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const w = Math.max(1, Math.round(img.width * ratio));
        const h = Math.max(1, Math.round(img.height * ratio));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(undefined);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      } catch {
        resolve(undefined);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    };
    img.src = url;
  });
}
