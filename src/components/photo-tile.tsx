import clsx from "clsx";
import type { DemoPhoto } from "@/lib/demo-data";
import { photoStyle } from "@/lib/demo-data";

type PhotoTileProps = {
  photo: DemoPhoto;
  className?: string;
  label?: boolean;
};

export function PhotoTile({ photo, className, label = true }: PhotoTileProps) {
  return (
    <figure
      className={clsx(
        "relative overflow-hidden rounded-[8px] border border-white/10 bg-graphite-900",
        className
      )}
    >
      <div className="absolute inset-0 scale-105 bg-cover bg-center" style={photoStyle(photo)} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
      {label ? (
        <figcaption className="absolute bottom-2 left-2 right-2 truncate text-[11px] font-medium text-white/90">
          {photo.label}
        </figcaption>
      ) : null}
    </figure>
  );
}
