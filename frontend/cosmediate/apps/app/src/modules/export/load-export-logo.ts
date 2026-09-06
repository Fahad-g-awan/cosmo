const LOGO_PATH = "/logos/logo.png";

let cachedLogoDataUrl: string | null = null;

export async function loadExportLogoDataUrl(): Promise<string> {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;

  const response = await fetch(LOGO_PATH);
  if (!response.ok) {
    throw new Error("Failed to load export logo");
  }

  const blob = await response.blob();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read export logo"));
    reader.readAsDataURL(blob);
  });

  cachedLogoDataUrl = dataUrl;
  return dataUrl;
}
