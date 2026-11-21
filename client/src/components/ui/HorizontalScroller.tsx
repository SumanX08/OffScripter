
import type { ReactNode } from "react";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  children: ReactNode;
};

export default function HorizontalScroller({ children }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "right" ? 320 : -320,
      behavior: "smooth",
    });
  };

  const arrowClass =
    "absolute top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-[#263911]/15 bg-[#FCF9EC] text-[#263911] shadow-md transition hover:bg-[#263911] hover:text-white";

  return (
    <div className="group relative w-full">
      <button
        type="button"
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className={`${arrowClass} left-0`}
      >
        <ChevronLeft size={19} />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto scroll-smooth px-11 py-2
        [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className={`${arrowClass} right-0`}
      >
        <ChevronRight size={19} />
      </button>
    </div>
  );
}
