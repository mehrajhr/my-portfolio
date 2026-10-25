import { api } from "@/lib/api";

export async function uploadAsset(file: File, altText: string, kind: "image" | "pdf" = "image"): Promise<string> {
  const valid = kind === "pdf" ? file.type === "application/pdf" : file.type.startsWith("image/");
  if (!valid) throw new Error(kind === "pdf" ? "Choose a PDF file." : "Choose an image file.");
  const maxBytes = kind === "pdf" ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxBytes) throw new Error(kind === "pdf" ? "PDF files must be 15 MB or smaller." : "Images must be 5 MB or smaller.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  const result = await api<{url:string}>("/admin/media/upload", {
    method: "POST",
    body: JSON.stringify({ filename: file.name, mimeType: file.type, base64: btoa(binary), altText }),
  });
  return result.url;
}
