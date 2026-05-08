"use client";

import { useState } from "react";

interface PackingItem {
  id: string;
  name: string;
  category: string;
  checked: boolean;
}

const CATEGORIES = [
  "Klær",
  "Sko og føtter",
  "Utstyr",
  "Mat og drikke",
  "Sikkerhet",
  "Hygiene",
  "Annet",
] as const;

const TRIP_TYPES = [
  { value: "dagstur", label: "Dagstur" },
  { value: "overnatting", label: "Overnatting på hytte" },
  { value: "telt", label: "Telttur" },
  { value: "vintertur", label: "Vintertur" },
] as const;

const PACKING_SUGGESTIONS: Record<string, PackingItem[]> = {
  dagstur: [
    { id: "d1", name: "Turryggsekk (20-30L)", category: "Utstyr", checked: false },
    { id: "d2", name: "Regjakke", category: "Klær", checked: false },
    { id: "d3", name: "Ullundertøy", category: "Klær", checked: false },
    { id: "d4", name: "Tursko", category: "Sko og føtter", checked: false },
    { id: "d5", name: "Ekstra ullsokker", category: "Sko og føtter", checked: false },
    { id: "d6", name: "Matpakke og snacks", category: "Mat og drikke", checked: false },
    { id: "d7", name: "Vannflaske (min. 1L)", category: "Mat og drikke", checked: false },
    { id: "d8", name: "Termos med varm drikke", category: "Mat og drikke", checked: false },
    { id: "d9", name: "Kart og kompass", category: "Sikkerhet", checked: false },
    { id: "d10", name: "Førstehjelpsutstyr", category: "Sikkerhet", checked: false },
    { id: "d11", name: "Hodelykt", category: "Sikkerhet", checked: false },
    { id: "d12", name: "Solkrem", category: "Hygiene", checked: false },
    { id: "d13", name: "Sitteunderlag", category: "Utstyr", checked: false },
  ],
  overnatting: [
    { id: "o1", name: "Turryggsekk (40-50L)", category: "Utstyr", checked: false },
    { id: "o2", name: "Regjakke og regbukse", category: "Klær", checked: false },
    { id: "o3", name: "Ullundertøy (2 sett)", category: "Klær", checked: false },
    { id: "o4", name: "Fleece eller dunjakke", category: "Klær", checked: false },
    { id: "o5", name: "Tursko", category: "Sko og føtter", checked: false },
    { id: "o6", name: "Hyttesko/sandaler", category: "Sko og føtter", checked: false },
    { id: "o7", name: "Ekstra ullsokker (2 par)", category: "Sko og føtter", checked: false },
    { id: "o8", name: "Lakenpose", category: "Utstyr", checked: false },
    { id: "o9", name: "Mat til alle måltider", category: "Mat og drikke", checked: false },
    { id: "o10", name: "Vannflaske og termos", category: "Mat og drikke", checked: false },
    { id: "o11", name: "Kart og kompass", category: "Sikkerhet", checked: false },
    { id: "o12", name: "Førstehjelpsutstyr", category: "Sikkerhet", checked: false },
    { id: "o13", name: "Hodelykt med ekstra batterier", category: "Sikkerhet", checked: false },
    { id: "o14", name: "DNT-nøkkel", category: "Utstyr", checked: false },
    { id: "o15", name: "Toalettsaker", category: "Hygiene", checked: false },
    { id: "o16", name: "Solkrem og solbriller", category: "Hygiene", checked: false },
    { id: "o17", name: "Håndkle (lett reisehåndkle)", category: "Hygiene", checked: false },
  ],
  telt: [
    { id: "t1", name: "Turryggsekk (60-70L)", category: "Utstyr", checked: false },
    { id: "t2", name: "Telt", category: "Utstyr", checked: false },
    { id: "t3", name: "Sovepose", category: "Utstyr", checked: false },
    { id: "t4", name: "Liggeunderlag", category: "Utstyr", checked: false },
    { id: "t5", name: "Kokeapparat og gass", category: "Utstyr", checked: false },
    { id: "t6", name: "Kjele og bestikk", category: "Utstyr", checked: false },
    { id: "t7", name: "Regjakke og regbukse", category: "Klær", checked: false },
    { id: "t8", name: "Ullundertøy (2–3 sett)", category: "Klær", checked: false },
    { id: "t9", name: "Fleece og dunjakke", category: "Klær", checked: false },
    { id: "t10", name: "Tursko", category: "Sko og føtter", checked: false },
    { id: "t11", name: "Ekstra ullsokker (3 par)", category: "Sko og føtter", checked: false },
    { id: "t12", name: "Frysetørket mat", category: "Mat og drikke", checked: false },
    { id: "t13", name: "Vannflaske og vannrensing", category: "Mat og drikke", checked: false },
    { id: "t14", name: "Kart og kompass", category: "Sikkerhet", checked: false },
    { id: "t15", name: "Førstehjelpsutstyr", category: "Sikkerhet", checked: false },
    { id: "t16", name: "Hodelykt med ekstra batterier", category: "Sikkerhet", checked: false },
    { id: "t17", name: "Kniv/multiverktøy", category: "Sikkerhet", checked: false },
    { id: "t18", name: "Toalettsaker", category: "Hygiene", checked: false },
    { id: "t19", name: "Tørkerull / toalettpapir", category: "Hygiene", checked: false },
  ],
  vintertur: [
    { id: "v1", name: "Turryggsekk (40-60L)", category: "Utstyr", checked: false },
    { id: "v2", name: "Vindtett ytterlag (jakke + bukse)", category: "Klær", checked: false },
    { id: "v3", name: "Ullundertøy (tykt, 2 sett)", category: "Klær", checked: false },
    { id: "v4", name: "Dunjakke", category: "Klær", checked: false },
    { id: "v5", name: "Ullsokker (3 par)", category: "Sko og føtter", checked: false },
    { id: "v6", name: "Fjellstøvler (isolerte)", category: "Sko og føtter", checked: false },
    { id: "v7", name: "Gamasjer", category: "Sko og føtter", checked: false },
    { id: "v8", name: "Lue og buff", category: "Klær", checked: false },
    { id: "v9", name: "Votter (tynt + tykt par)", category: "Klær", checked: false },
    { id: "v10", name: "Skibriller/solbriller", category: "Klær", checked: false },
    { id: "v11", name: "Termos med varm drikke", category: "Mat og drikke", checked: false },
    { id: "v12", name: "Energirik mat og snacks", category: "Mat og drikke", checked: false },
    { id: "v13", name: "Kart, kompass og GPS", category: "Sikkerhet", checked: false },
    { id: "v14", name: "Førstehjelpsutstyr", category: "Sikkerhet", checked: false },
    { id: "v15", name: "Hodelykt", category: "Sikkerhet", checked: false },
    { id: "v16", name: "Nødbivy / vindpose", category: "Sikkerhet", checked: false },
    { id: "v17", name: "Spade (snøspade)", category: "Sikkerhet", checked: false },
    { id: "v18", name: "Solkrem (SPF 50)", category: "Hygiene", checked: false },
  ],
};

export default function PackingListClient() {
  const [tripType, setTripType] = useState<string>("");
  const [items, setItems] = useState<PackingItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<string>(CATEGORIES[0]);
  const [generated, setGenerated] = useState(false);

  function handleGenerate() {
    if (!tripType) return;
    const suggestions = PACKING_SUGGESTIONS[tripType] ?? [];
    setItems(suggestions.map((item) => ({ ...item, checked: false })));
    setGenerated(true);
  }

  function toggleItem(id: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  }

  function addItem() {
    const name = newItemName.trim();
    if (!name) return;
    const newItem: PackingItem = {
      id: `custom-${Date.now()}`,
      name,
      category: newItemCategory,
      checked: false,
    };
    setItems((prev) => [...prev, newItem]);
    setNewItemName("");
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  const grouped = items.reduce<Record<string, PackingItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const totalItems = items.length;
  const checkedItems = items.filter((i) => i.checked).length;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      {/* Trip type selector */}
      <div className="rounded-2xl border border-[#e0e8d8] bg-white p-6">
        <h2 className="font-semibold text-[#1a2e1a] mb-4">Velg turtype</h2>
        <div className="grid grid-cols-2 gap-3">
          {TRIP_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => {
                setTripType(type.value);
                setGenerated(false);
              }}
              className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors border ${
                tripType === type.value
                  ? "bg-[#2d4a2d] text-white border-[#2d4a2d]"
                  : "bg-[#f8fbf5] text-[#2d4a2d] border-[#e0e8d8] hover:bg-[#eef4e8]"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={!tripType}
          className="mt-5 w-full rounded-full bg-[#2d4a2d] px-6 py-3 text-base font-medium text-white hover:bg-[#3d6b3d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Generer pakkeliste
        </button>
      </div>

      {/* Packing list */}
      {generated && items.length > 0 && (
        <>
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-[#e0e8d8] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2d4a2d] rounded-full transition-all duration-300"
                style={{ width: `${totalItems > 0 ? (checkedItems / totalItems) * 100 : 0}%` }}
              />
            </div>
            <span className="text-sm text-[#4a6741] font-medium whitespace-nowrap">
              {checkedItems} / {totalItems} pakket
            </span>
          </div>

          {/* Grouped items */}
          {CATEGORIES.filter((cat) => grouped[cat]?.length).map((category) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-[#4a6741] uppercase tracking-wide mb-2">
                {category}
              </h3>
              <div className="rounded-2xl border border-[#e0e8d8] bg-white divide-y divide-[#f0f4ec]">
                {grouped[category].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#f8fbf5] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(item.id)}
                      className="h-4 w-4 rounded border-[#a0b890] text-[#2d4a2d] accent-[#2d4a2d]"
                    />
                    <span
                      className={`flex-1 text-sm ${
                        item.checked ? "line-through text-[#a0b890]" : "text-[#1a2e1a]"
                      }`}
                    >
                      {item.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeItem(item.id);
                      }}
                      className="text-[#c0c8b8] hover:text-[#e05050] transition-colors text-lg leading-none"
                      aria-label={`Fjern ${item.name}`}
                    >
                      ×
                    </button>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Add custom item */}
          <div className="rounded-2xl border border-[#e0e8d8] bg-white p-4">
            <h3 className="text-sm font-semibold text-[#4a6741] mb-3">Legg til egen ting</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addItem();
                }}
                placeholder="F.eks. Solbriller"
                className="flex-1 rounded-lg border border-[#e0e8d8] px-3 py-2 text-sm text-[#1a2e1a] placeholder:text-[#a0b890] focus:outline-none focus:ring-2 focus:ring-[#2d4a2d]/20 focus:border-[#2d4a2d]"
              />
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="rounded-lg border border-[#e0e8d8] px-3 py-2 text-sm text-[#1a2e1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#2d4a2d]/20 focus:border-[#2d4a2d]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button
                onClick={addItem}
                className="rounded-lg bg-[#2d4a2d] px-4 py-2 text-sm font-medium text-white hover:bg-[#3d6b3d] transition-colors"
              >
                Legg til
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
