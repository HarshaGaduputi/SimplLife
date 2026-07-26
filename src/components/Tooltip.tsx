import { useState, useRef, useId } from "react";

export function Tooltip({
  label,
  position = "top",
  children,
}: {
  label: string;
  position?: "top" | "left" | "right" | "bottom";
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);
  const id = useId();
  const open = () => {
    window.clearTimeout(timerRef.current);
    setShow(true);
  };
  const close = () => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setShow(false), 80);
  };
  const positionClasses: Record<string, string> = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
    >
      {children}
      <span
        role="tooltip"
        id={id}
        className={
          "pointer-events-none absolute whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium text-white bg-[#16587B] shadow-md transition-opacity duration-150 " +
          positionClasses[position] +
          (show ? " opacity-100" : " opacity-0")
        }
        style={
          show
            ? undefined
            : { visibility: "hidden" as const }
        }
      >
        <span className="html.theme-dark &:bg-[#5B88B2]"></span>
        {label}
      </span>
    </span>
  );
}
