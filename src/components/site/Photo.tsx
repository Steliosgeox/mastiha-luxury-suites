import Image from "next/image";
import { photoCaption, stayPhoto, type PhotoId } from "@/content/stay-media";
import type { StayLocale } from "@/content/stay-copy";
import { PhotoButton } from "./SiteShell";
import ui from "./ui.module.css";

type PhotoProps = {
  id: PhotoId;
  locale: StayLocale;
  /** Sets the frame's shape, e.g. an aspect-ratio class. */
  className?: string;
  sizes?: string;
  priority?: boolean;
  reveal?: boolean;
  parallax?: boolean;
  /** Overrides the catalogue's focal point for this crop. */
  position?: string;
};

/** A photograph in a positioned, size-reserved frame. */
export function Photo({ id, locale, className = "", sizes = "(max-width: 760px) 100vw, 60vw", priority, reveal = true, parallax, position }: PhotoProps) {
  const photo = stayPhoto(id);
  return <div className={`${ui.photo} ${className}`} data-photo-id={id} data-photo-reveal={reveal || undefined}>
    <Image
      src={photo.src}
      alt={photoCaption(id, locale)}
      fill
      sizes={sizes}
      priority={priority}
      className={ui.photoImage}
      style={{ objectPosition: position ?? photo.position }}
      data-parallax={parallax || undefined}
    />
  </div>;
}

/** A photograph that opens the lightbox. */
export function OpenablePhoto(props: PhotoProps) {
  return <PhotoButton id={props.id}><Photo {...props} /></PhotoButton>;
}
