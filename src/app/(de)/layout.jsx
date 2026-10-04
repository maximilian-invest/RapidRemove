/* Root-Layout der deutschen Seiten (Startseite, Magazin, Rechtliches, Admin …). */
import RootShell, { rootMetadata, rootViewport } from "@/components/RootShell";

export const metadata = rootMetadata;
export const viewport = rootViewport;

export default function DeLayout({ children }) {
  return <RootShell lang="de">{children}</RootShell>;
}
