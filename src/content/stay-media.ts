export type PhotoId = "living" | "master" | "second" | "bathroom" | "terrace";
export type StayMedia = { id: PhotoId; src: string; width: number; height: number; position: string };

// Existing repository photographs only. hero.webp and terrace.webp are the same image.
// Film frames belong in the walkthrough, not in an inflated photograph count.
export const stayPhotos: StayMedia[] = [
  { id: "living", src: "/photography/living-room.webp", width: 1920, height: 1080, position: "50% 50%" },
  { id: "master", src: "/photography/master-bedroom.webp", width: 1920, height: 1080, position: "50% 55%" },
  { id: "second", src: "/photography/second-bedroom.webp", width: 1920, height: 1080, position: "50% 55%" },
  { id: "bathroom", src: "/photography/bathroom.webp", width: 1920, height: 1080, position: "48% 50%" },
  { id: "terrace", src: "/photography/hero.webp", width: 1920, height: 1080, position: "50% 54%" },
];
export function stayPhoto(id: PhotoId): StayMedia {
  const photo = stayPhotos.find((item) => item.id === id);
  if (!photo) throw new Error(`Unknown property photograph: ${id}`);
  return photo;
}
