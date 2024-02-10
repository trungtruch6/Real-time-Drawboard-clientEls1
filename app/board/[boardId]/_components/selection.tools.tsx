"use client";

import { memo, useState } from "react";
import { useMutation, useSelf } from "@/liveblocks.config";

import { Camera, CanvasMode, CanvasState, Color } from "@/types/canvas";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { BringToFront, CloudFog, SendToBack, Trash2 } from "lucide-react";
import { useSelectionBounds } from "@/hooks/use.selection.bounds";
import { ColorPicker } from "./color.picker";
import { useDeleteLayers } from "@/hooks/use.delete.layers";

interface SelectionToolProps {
  camera: Camera;
  setLastUsedColor: (color: Color) => void;
  canvasState: CanvasState;
}

export const SelectionTools = memo(
  ({ camera, setLastUsedColor, canvasState }: SelectionToolProps) => {
    const selection = useSelf((me) => me.presence.selection);
    const deleteLayers = useDeleteLayers();
    // const [canvasState, setCanvasState] = useState<CanvasState>({
    //   mode: CanvasMode.None,
    // });
    const moveToBack = useMutation(
      ({ storage }) => {
        const liveLayerIds = storage.get("layerIds");
        const indices: number[] = [];

        const arr = liveLayerIds.toImmutable();

        for (let i = 0; i < arr.length; i++) {
          if (selection.includes(arr[i])) {
            indices.push(i);
          }
        }
        for (let i = 0; i < indices.length; i++) {
          liveLayerIds.move(indices[i], i);
        }
      },
      [selection]
    );

    const bringToFront = useMutation(
      ({ storage }) => {
        const liveLayerIds = storage.get("layerIds");
        const indices: number[] = [];

        const arr = liveLayerIds.toImmutable();

        for (let i = 0; i < arr.length; i++) {
          if (selection.includes(arr[i])) {
            indices.push(i);
          }
        }
        for (let i = indices.length - 1; i >= 0; i--) {
          liveLayerIds.move(
            indices[i],
            arr.length - 1 - (indices.length - 1 - i)
          );
        }
      },
      [selection]
    );

    const selectionBounds = useSelectionBounds();

    const setFill = useMutation(
      ({ storage }, fill: Color) => {
        const liveLayers = storage.get("layers");
        setLastUsedColor(fill);

        selection.forEach((id) => {
          liveLayers.get(id)?.set("fill", fill);
        });
      },
      [selection, setLastUsedColor]
    );

    if (!selectionBounds) {
      return null;
    }

    const x = selectionBounds.width / 2 + selectionBounds.x + camera.x;
    const y = selectionBounds.y + camera.y;
    console.log(camera);
    return (
      <div
        className="absolute p-3 rounded-xl bg-white shadow-md border flex select-none"
        style={{
          transform: `translate(calc(${x}px - 50%), calc(${y - 16}px - 100%))`,
        }}
      >
        <ColorPicker onChange={setFill} />
        <div className="flex flex-col gap-y-1.5 justify-center">
          <Hint label={"Bring to front"}>
            <Button variant={"board"} size={"icon"} onClick={bringToFront}>
              <BringToFront />
            </Button>
          </Hint>
          <Hint label={"Send to back"}>
            <Button variant={"board"} size={"icon"} onClick={moveToBack}>
              <SendToBack />
            </Button>
          </Hint>
        </div>
        <div className="flex items-center pl-2 ml-2 border-l border-neutral-200">
          <Hint label={"Delete"}>
            <Button variant={"board"} size={"icon"} onClick={deleteLayers}>
              <Trash2 />
            </Button>
          </Hint>
        </div>
      </div>
    );
  }
);

SelectionTools.displayName = "SelectionTools";
