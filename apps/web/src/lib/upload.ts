import { api } from "@/lib/api";

type CloudinaryUploadSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  resourceType: "image" | "raw";
};

export async function uploadAsset(
  file: File,
  altText: string,
  kind: "image" | "pdf" = "image",
): Promise<string> {
  const valid = kind === "pdf" ? file.type === "application/pdf" : file.type.startsWith("image/");
  if (!valid) throw new Error(kind === "pdf" ? "Choose a PDF file." : "Choose an image file.");
  const maxBytes = kind === "pdf" ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxBytes) throw new Error(kind === "pdf" ? "PDF files must be 15 MB or smaller." : "Images must be 5 MB or smaller.");

  const signature = await api<CloudinaryUploadSignature>("/admin/media/upload-signature", {
    method: "POST",
    body: JSON.stringify({ filename: file.name, mimeType: file.type, sizeBytes: file.size }),
  });
  const form = new FormData();
  form.set("file", file);
  form.set("api_key", signature.apiKey);
  form.set("timestamp", String(signature.timestamp));
  form.set("signature", signature.signature);
  form.set("folder", signature.folder);
  form.set("public_id", signature.publicId);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/${signature.resourceType}/upload`,
    { method: "POST", body: form },
  );
  const uploaded = await response.json().catch(() => ({})) as {
    secure_url?: string;
    public_id?: string;
    bytes?: number;
    error?: { message?: string };
  };
  if (!response.ok || !uploaded.secure_url || !uploaded.public_id) {
    throw new Error(uploaded.error?.message ?? "Cloudinary could not upload this file. Check the Cloudinary settings and try again.");
  }

  const media = await api<{ url: string }>("/admin/media", {
    method: "POST",
    body: JSON.stringify({
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      mimeType: file.type,
      sizeBytes: uploaded.bytes ?? file.size,
      altText,
    }),
  });
  return media.url;
}
