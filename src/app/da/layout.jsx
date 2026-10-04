/* Root-Layout für /da/<Profil-Check> (statischer Ordner neben [lang]). */
import RootShell, { rootMetadata, rootViewport } from "@/components/RootShell";

export const metadata = rootMetadata;
export const viewport = rootViewport;

export default function Layout({ children }) {
  return <RootShell lang="da">{children}</RootShell>;
}
