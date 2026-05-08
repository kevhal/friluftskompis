"use client";

import { useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Checkbox,
  InputField,
  RadioButton,
  Toggle,
} from "@/app/components/ui";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6 pb-2 border-b border-gray-200">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      {label && <p className="text-xs text-gray-400 mb-2">{label}</p>}
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </div>
  );
}

export default function ComponentsClient() {
  const [toggleA, setToggleA] = useState(true);
  const [toggleB, setToggleB] = useState(false);
  const [checked, setChecked] = useState(true);
  const [radio, setRadio] = useState("a");
  const [alerts, setAlerts] = useState({
    info: true,
    success: true,
    warning: true,
    error: true,
  });

  return (
    <>
      {/* Buttons */}
      <Section title="Button">
        <Row label="Variants">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="text">Text</Button>
        </Row>
        <Row label="Disabled">
          <Button variant="primary" disabled>Primary</Button>
          <Button variant="secondary" disabled>Secondary</Button>
          <Button variant="text" disabled>Text</Button>
        </Row>
      </Section>

      {/* Alert */}
      <Section title="Alert">
        <div className="flex flex-col gap-3 max-w-lg">
          {(["info", "success", "warning", "error"] as const).map((type) =>
            alerts[type] ? (
              <Alert
                key={type}
                type={type}
                message={
                  type === "info"    ? "Dette er en informasjonsmelding." :
                  type === "success" ? "Turen ble lagret!" :
                  type === "warning" ? "Været kan endre seg på fjellet." :
                                       "Noe gikk galt. Prøv igjen."
                }
                onClose={() => setAlerts((a) => ({ ...a, [type]: false }))}
              />
            ) : (
              <button
                key={type}
                onClick={() => setAlerts((a) => ({ ...a, [type]: true }))}
                className="text-xs text-gray-400 hover:text-gray-600 text-left"
              >
                + Vis {type}-varsel igjen
              </button>
            )
          )}
        </div>
      </Section>

      {/* Avatar */}
      <Section title="Avatar">
        <Row label="Placeholder">
          <Avatar size="S" type="Placeholder" />
          <Avatar size="L" type="Placeholder" />
        </Row>
        <Row label="Photo (no src — dev warning in console)">
          <Avatar size="S" type="Photo" />
          <Avatar size="L" type="Photo" />
        </Row>
      </Section>

      {/* Badge */}
      <Section title="Badge / Tag">
        <Row label="Static">
          <Badge label="Jotunheimen" />
          <Badge label="Lett" />
          <Badge label="3 dager" />
          <Badge label="DNT-hytte" />
        </Row>
        <Row label="Actionable">
          <Badge label="Hardangervidda" actionable onRemove={() => alert("Fjernet")} />
          <Badge label="Høst" actionable onRemove={() => alert("Fjernet")} />
          <Badge label="Familie" actionable onRemove={() => alert("Fjernet")} />
        </Row>
      </Section>

      {/* Input field */}
      <Section title="Input Field">
        <div className="flex flex-col gap-4 max-w-sm">
          <InputField label="Turnavn" placeholder="F.eks. Galdhøpiggen" />
          <InputField label="Med hint" placeholder="Søk…" hint="Minst 3 tegn for å søke" />
          <InputField
            label="Med feil"
            placeholder="Din e-post"
            defaultValue="ikke-en-epost"
            error="Ugyldig e-postadresse"
          />
          <InputField label="Deaktivert" placeholder="Kan ikke redigeres" disabled />
        </div>
      </Section>

      {/* Checkbox */}
      <Section title="Checkbox">
        <Row label="States">
          <Checkbox
            label="Jeg har lest vilkårene"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <Checkbox label="Deaktivert (av)" disabled />
          <Checkbox label="Deaktivert (på)" checked disabled onChange={() => {}} />
        </Row>
      </Section>

      {/* Radio button */}
      <Section title="Radio Button">
        <Row label="Group">
          {[
            { value: "a", label: "Lett tur" },
            { value: "b", label: "Middels tur" },
            { value: "c", label: "Krevende tur" },
          ].map(({ value, label }) => (
            <RadioButton
              key={value}
              label={label}
              name="difficulty"
              value={value}
              checked={radio === value}
              onChange={() => setRadio(value)}
            />
          ))}
        </Row>
        <Row label="Disabled">
          <RadioButton label="Ikke tilgjengelig" name="disabled-example" disabled />
        </Row>
      </Section>

      {/* Toggle */}
      <Section title="Toggle">
        <Row label="With label">
          <Toggle toggled={toggleA} onChange={setToggleA} label={toggleA ? "Varsler på" : "Varsler av"} />
          <Toggle toggled={toggleB} onChange={setToggleB} label={toggleB ? "Offline-modus" : "Online-modus"} />
        </Row>
        <Row label="Without label">
          <Toggle toggled={toggleA} onChange={setToggleA} />
          <Toggle toggled={toggleB} onChange={setToggleB} />
        </Row>
        <Row label="Disabled">
          <Toggle toggled={true} disabled label="Alltid på" />
          <Toggle toggled={false} disabled label="Alltid av" />
        </Row>
      </Section>
    </>
  );
}
