import Image from "next/image";
import { cn } from "@/lib/cn";

export type BrianState = "idle" | "talking" | "celebrating" | "encouraging";

const STATE_IMAGE: Record<BrianState, string> = {
  idle: "/brian/coach-brian-avatar.png",
  talking: "/brian/coach-brian-avatar.png",
  celebrating: "/brian/coach-brian-celebrating.png",
  encouraging: "/brian/coach-brian-encouraging.png",
};

const STATE_ANIMATION: Record<BrianState, string> = {
  idle: "brian-breathe",
  talking: "brian-talk",
  celebrating: "brian-pop",
  encouraging: "brian-pop",
};

export function BrianAvatar({
  state = "idle",
  size = 40,
  className,
}: {
  state?: BrianState;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("relative shrink-0 overflow-hidden rounded-full", STATE_ANIMATION[state], className)}
      style={{ width: size, height: size }}
    >
      <Image src={STATE_IMAGE[state]} alt="Coach Brian" fill className="object-cover" sizes={`${size}px`} />
    </div>
  );
}
