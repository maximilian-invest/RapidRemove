/* Schwere Hub-Artikeldaten je Sprache (für die Artikel-Route /[lang]/[mslug]/[hubslug]).
   Bewusst getrennt von hubs.js (leicht), damit nur die Route die Bodies lädt. */
import en from "@/lib/articles/en-hub-delete-google-business-profile";
import es from "@/lib/articles/es-hub-eliminar-perfil-de-empresa-google";
import pt from "@/lib/articles/pt-hub-eliminar-perfil-empresa-google";
import it from "@/lib/articles/it-hub-eliminare-profilo-attivita-google";
import fr from "@/lib/articles/fr-hub-supprimer-profil-etablissement-google";
import ja from "@/lib/articles/ja-hub-google-business-profile-sakujo";
import no from "@/lib/articles/no-hub-slett-google-bedriftsprofil";
import sv from "@/lib/articles/sv-hub-radera-google-foretagsprofil";
import da from "@/lib/articles/da-hub-slet-google-virksomhedsprofil";
import nl from "@/lib/articles/nl-hub-google-bedrijfsprofiel-verwijderen";

export const HUBS = { en, es, pt, it, fr, ja, no, sv, da, nl };
