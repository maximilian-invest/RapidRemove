"use client";
/* Partner-Login (/partner) — gleiches Design wie der Kunden-Login (Customer-App-Handoff, Klassen aus
   dashboard.css unter .rra). mode="login": E-Mail + Passwort. mode="setup": mit dem persönlichen
   Link einmalig Login anlegen bzw. neues Passwort setzen. */
import React from "react";
import { Loader, Eye, EyeOff } from "lucide-react";
import "@/styles/dashboard.css";
import { call, BASE } from "./shared";
import { PasskeyLoginButton } from "@/components/PasskeyOffer";

export default function PartnerLogin({ mode = "login", linkToken = "", account = "", onToken, onSkip }) {
  const setup = mode === "setup";
  const [email, setEmail] = React.useState(account || "");
  const [pw, setPw] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErr("");
    if (setup && pw.length < 8) { setErr("Please use at least 8 characters."); return; }
    setBusy(true);
    try {
      const r = setup ? await call("setup", { t: linkToken, email, password: pw }) : await call("login", { email, password: pw });
      onToken(r.token);
    } catch (x) {
      setErr(x.message === "too_many" ? "Too many attempts – please wait a few minutes."
        : x.message === "email" ? "Please enter a valid email."
          : x.message === "invalid link" ? "This link is not valid (anymore). Please ask RapidRemove for the current link."
            : setup ? "Could not save – please try again." : "Email or password is wrong.");
    }
    setBusy(false);
  };

  return (
    <div className="rra">
      <div className="lg-wrap">
        <form className="lg" onSubmit={submit}>
          <div className="lg-art"><img src={`${BASE}/assets/app/rocket.webp`} alt="" /></div>
          <div>
            <h1>{setup ? (account ? "New password" : "Create your login") : "Partner login"}</h1>
            <p>{setup
              ? "Next time just open rapid-remove.com/partner and log in – no link needed."
              : "Log in to see your removal tasks and earnings."}</p>
          </div>
          <label className="fld"><span>Email</span>
            <input type="email" autoComplete={setup ? "username" : "email"} required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </label>
          <label className="fld"><span>{setup ? "Password (min. 8 characters)" : "Password"}</span>
            <span style={{ position: "relative", display: "block" }}>
              <input type={show ? "text" : "password"} autoComplete={setup ? "new-password" : "current-password"} required value={pw} onChange={(e) => setPw(e.target.value)} style={{ width: "100%", paddingRight: 52 }} />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}
                style={{ position: "absolute", right: 6, top: 6, width: 44, height: 44, display: "grid", placeItems: "center", color: "var(--g3)" }}>
                {show ? <EyeOff /> : <Eye />}
              </button>
            </span>
          </label>
          {err ? <div className="note bad">{err}</div> : null}
          <button className="cta" disabled={busy}>{busy ? <Loader className="spin" /> : null}{setup ? "Save & continue" : "Log in"}</button>
          {!setup ? <PasskeyLoginButton role="partner" onToken={onToken} onError={setErr} /> : null}
          {setup
            ? <button type="button" className="lnk" onClick={onSkip}>Skip for now</button>
            : <p className="lnk" style={{ height: "auto", fontSize: 14, fontWeight: 500, lineHeight: 1.45 }}>Forgot your password? Just open your personal link from RapidRemove – it always works.</p>}
        </form>
      </div>
    </div>
  );
}
