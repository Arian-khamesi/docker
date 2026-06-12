"use client";

import { SliderEditor } from "./slider-editor";
import { SliderPreview } from "./slider-preview";

export function SliderLayout() {
  return (
    <div
      className="
      grid
      gap-6

      xl:grid-cols-[1fr_420px]
    "
    >
      {/* Editor */}

      <div>
        <SliderEditor />
      </div>

      {/* Preview */}

      <div>
        <SliderPreview />
      </div>
    </div>
  );
}