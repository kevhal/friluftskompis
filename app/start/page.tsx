"use client";

import { useState } from "react";
import TaskVisualizer from "./TaskVisualizer";

export default function StartPage() {
  const [started, setStarted] = useState(false);

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-white">
      <button
        onClick={() => setStarted(true)}
        disabled={started}
        className="rounded-full bg-[#5aad6a] px-12 py-5 text-xl font-medium text-white shadow-md hover:bg-[#4e9b5e] active:bg-[#448a53] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5aad6a] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5aad6a]"
      >
        Tur
      </button>
      <div className="absolute top-[calc(50%+52px)] left-1/2 -translate-x-1/2 w-full max-w-sm">
        <TaskVisualizer running={started} />
      </div>
    </div>
  );
}
