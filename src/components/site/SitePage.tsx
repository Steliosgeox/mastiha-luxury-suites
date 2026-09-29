import { ChatMount } from "@/components/chat/ChatMount";
import { getStayCopy, type StayLocale } from "@/content/stay-copy";
import { liveChatEnabled } from "@/lib/chat/service";
import { getContactChannels } from "@/lib/contact";
import { SiteShell } from "./SiteShell";
import { Amenities } from "./sections/Amenities";
import { Balcony } from "./sections/Balcony";
import { Bedrooms } from "./sections/Bedrooms";
import { Closing } from "./sections/Closing";
import { Family } from "./sections/Family";
import { Faq } from "./sections/Faq";
import { Footer } from "./sections/Footer";
import { Gallery } from "./sections/Gallery";
import { Hero } from "./sections/Hero";
import { Host } from "./sections/Host";
import { Intro } from "./sections/Intro";
import { Kitchen } from "./sections/Kitchen";
import { Location } from "./sections/Location";
import { Nearby } from "./sections/Nearby";
import { PhotoTour } from "./sections/PhotoTour";
import { Reviews } from "./sections/Reviews";
import { Vrontados } from "./sections/Vrontados";
import ui from "./ui.module.css";

export function SitePage({ locale }: { locale: StayLocale }) {
  const contact = getContactChannels();
  return <>
    <SiteShell locale={locale}>
      <a href="#suite" className={ui.skip}>{getStayCopy(locale).common.skip}</a>
      <main>
        <Hero locale={locale} />
        <PhotoTour locale={locale} />
        <Intro locale={locale} />
        <Bedrooms locale={locale} />
        <Family locale={locale} />
        <Balcony locale={locale} />
        <Kitchen locale={locale} />
        <Gallery locale={locale} />
        <Amenities locale={locale} />
        <Reviews locale={locale} />
        <Location locale={locale} />
        <Nearby locale={locale} />
        <Vrontados locale={locale} />
        <Host locale={locale} />
        <Faq locale={locale} />
        <Closing locale={locale} />
      </main>
      <Footer locale={locale} contact={contact} />
    </SiteShell>
    <ChatMount locale={locale} liveEnabled={liveChatEnabled()} fallback={{ whatsapp: contact.whatsapp, email: contact.email }} />
  </>;
}
