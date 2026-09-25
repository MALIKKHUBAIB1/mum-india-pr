export type ImageKitAuth = {
  publicKey: string;
  urlEndpoint: string;
  token: string;
  expire: number;
  signature: string;
};

/** Direct browser → ImageKit upload (file never touches our server). */
export async function uploadToImageKit(
  file: File,
  auth: ImageKitAuth,
  folder = "/mum-india",
): Promise<{ url: string; fileId: string }> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Image must be under 8 MB.");

  const form = new FormData();
  form.append("file", file);
  form.append("fileName", file.name);
  form.append("publicKey", auth.publicKey);
  form.append("signature", auth.signature);
  form.append("expire", String(auth.expire));
  form.append("token", auth.token);
  form.append("useUniqueFileName", "true");
  form.append("folder", folder);

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`ImageKit upload failed (${res.status}).`);
  const json = (await res.json()) as { url: string; fileId: string };
  if (!json.url) throw new Error("ImageKit upload failed.");
  return { url: json.url, fileId: json.fileId };
}
