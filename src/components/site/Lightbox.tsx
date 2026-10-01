"use client";

import YetAnotherLightbox from "yet-another-react-lightbox";
import { Captions, Counter, Fullscreen, Thumbnails, Zoom } from "yet-another-react-lightbox/plugins";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { getStayCopy, type StayLocale } from "@/content/stay-copy";
import { photoCaption, stayPhotos } from "@/content/stay-media";
import { trackEvent } from "@/lib/analytics";

export default function Lightbox({ index, locale, onClose }: { index: number; locale: StayLocale; onClose: () => void }) {
  const c = getStayCopy(locale);
  const slides = stayPhotos.map(photo => ({
    src: photo.src,
    srcSet: photo.srcSet,
    thumbnail: photo.thumbnail,
    width: photo.width,
    height: photo.height,
    alt: photoCaption(photo.id, locale),
    title: photoCaption(photo.id, locale),
  }));
  return <YetAnotherLightbox
    open
    index={index}
    close={onClose}
    slides={slides}
    plugins={[Captions, Counter, Fullscreen, Thumbnails, Zoom]}
    carousel={{ preload: 1 }}
    controller={{ closeOnBackdropClick: true }}
    thumbnails={{ width: 80, height: 54, gap: 8, showToggle: true }}
    labels={{
      Close: c.common.close,
      Previous: c.lightbox.previous,
      Next: c.lightbox.next,
      "Zoom in": c.lightbox.zoomIn,
      "Zoom out": c.lightbox.zoomOut,
      "Enter Fullscreen": c.lightbox.fullscreen,
      "Exit Fullscreen": c.lightbox.exitFullscreen,
      "Show thumbnails": c.lightbox.showThumbs,
      "Hide thumbnails": c.lightbox.hideThumbs,
    }}
    on={{ view: ({ index: viewed }) => trackEvent("gallery_image_view", { index: viewed }) }}
    styles={{ container: { backgroundColor: "rgba(20, 22, 24, .97)" } }}
  />;
}
