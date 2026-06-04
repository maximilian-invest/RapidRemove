"use client";
/* RapidRemove — language context + hook */
import React from "react";
import { I18N } from "@/lib/i18n";

export const LangContext = React.createContext({ lang: "de", t: I18N.de, setLang: () => {} });
export const useLang = () => React.useContext(LangContext);
