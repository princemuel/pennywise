const imageModules = import.meta.glob(
  "../../assets/media/images/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp}",
  {
    eager: true,
    query: { enhanced: true }
  }
);

function filenameFromPath(path: string) {
  return (
    path
      .split("/")
      .pop()
      ?.replace(/\.[^/.]+$/, "") ?? ""
  );
}

const avatars = Object.fromEntries(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Object.entries(imageModules).map(([path, mod]) => [filenameFromPath(path), (mod as any).default])
);

export const avatar = (slug: string): string => {
  const img = avatars[slug];
  if (!img && import.meta.env.DEV) console.warn(`Missing avatar: ${slug}`);
  return img ?? "";
};
