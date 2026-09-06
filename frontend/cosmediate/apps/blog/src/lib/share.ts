type SharePlatform = "facebook" | "twitter" | "linkedin" | "whatsapp";

export const SHARE_URLS: Record<
  SharePlatform,
  (url: string, title: string) => string
> = {
  facebook: (url) =>
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  twitter: (url, title) =>
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  linkedin: (url) =>
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  whatsapp: (url, title) =>
    `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
};

export const sharePost = (
  platform: SharePlatform,
  url: string,
  title: string
) => {
  console.log("sharePost");
  const shareUrl = SHARE_URLS[platform](url, title);
  window.open(shareUrl, "_blank", "noopener,noreferrer");
};
