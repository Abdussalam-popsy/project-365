import type { StaticImageData } from "next/image";
import guidePropertyServices from "../../public/logos/customers/svg/guide-property-services.svg";
import americanPropertyManagement from "../../public/logos/customers/svg/american-property-management.svg";
import evernest from "../../public/logos/customers/svg/evernest.svg";
import hbrRentals from "../../public/logos/customers/svg/hbr-rentals.svg";
import resihome from "../../public/logos/customers/svg/resihome.svg";
import gritPropertyGroup from "../../public/logos/customers/svg/grit-property-group.svg";
import fresnoManagement from "../../public/logos/customers/svg/fresno-management.svg";
import locationRentals from "../../public/logos/customers/svg/location-rentals.svg";
import proxPropertyManagement from "../../public/logos/customers/svg/prox-property-management.svg";
import gcRealty from "../../public/logos/customers/png/gc-realty.png";
import alpineLaProperties from "../../public/logos/customers/svg/alpine-la-properties.svg";
import titanPropertyManagement from "../../public/logos/customers/png/titan-property-management.png";

/**
 * Customer logos for the hero marquee and the Customers grid: white-on-transparent files in public/logos/customers.
 * Imported rather than linked by path so the build adds the GitHub Pages base path and the file's own dimensions.
 * `height` is set per logo so wide wordmarks and stacked badges carry similar visual weight.
 * PNG where the source was too small to vectorise cleanly.
 */
export interface CustomerLogo {
  name: string;
  image: StaticImageData;
  height: number;
}

export const customerLogos: CustomerLogo[] = [
  { name: "Guide Property Services", image: guidePropertyServices, height: 34 },
  { name: "American Property Management", image: americanPropertyManagement, height: 52 },
  { name: "Evernest", image: evernest, height: 32 },
  { name: "HBR Rentals", image: hbrRentals, height: 54 },
  { name: "ResiHome", image: resihome, height: 22 },
  { name: "GRIT Property Group", image: gritPropertyGroup, height: 54 },
  { name: "Fresno Management Company", image: fresnoManagement, height: 34 },
  { name: "Location Rentals", image: locationRentals, height: 28 },
  { name: "Pro X Property Management", image: proxPropertyManagement, height: 38 },
  { name: "GC Realty & Development", image: gcRealty, height: 34 },
  { name: "Alpine LA Properties", image: alpineLaProperties, height: 42 },
  { name: "Titan Property Management", image: titanPropertyManagement, height: 44 },
];

/** Width that keeps the logo's aspect ratio at its display height. */
export const logoWidth = (logo: CustomerLogo): number => Math.round((logo.height * logo.image.width) / logo.image.height);
