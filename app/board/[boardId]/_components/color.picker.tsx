"use client";

import { colorRgb, colorToCss } from "@/lib/utils";
import { Color } from "@/types/canvas";

interface ColorPickerProps {
  onChange: (color: Color) => void;
}

export const ColorPicker = ({ onChange }: ColorPickerProps) => {
  return (
    <div className="flex flex-wrap gap-2 items-center max-w-[164px] pr-2 mr-2 border-r border-neutral-200">
      {colorRgb.map((item: Color, index: number) => {
        return (
          <>
            <ColorButton key={index} color={item} onClick={onChange} />
          </>
        );
      })}
    </div>
  );
};

interface ColorButtonProps {
  onClick: (color: Color) => void;
  color: Color;
}

const ColorButton = ({ onClick, color }: ColorButtonProps) => {
  return (
    <button
      className="h-8 w-8 items-center flex justify-center hover:opacity-75 transition"
      onClick={() => onClick(color)}
    >
      <div
        className="rounded-md border border-neutral-300 h-8 w-8"
        style={{ background: colorToCss(color) }}
      />
    </button>
  );
};
