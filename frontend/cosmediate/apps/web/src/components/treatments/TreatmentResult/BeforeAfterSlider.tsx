import React, { useReducer } from "react";
import Image from "next/image";
import { cn } from "@cosmediate/ui/lib/utils";

type State = {
  rangeValue: number;
};

type Action =
  | { type: "change"; payload: number }
  | { type: "move"; payload: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "change":
      return {
        rangeValue: action.payload,
      };
    case "move":
      return {
        rangeValue: Math.round(action.payload),
      };
    default:
      return state;
  }
}

type ChangeEvent = React.ChangeEvent<HTMLInputElement>;
type PointerEvent = React.PointerEvent<HTMLDivElement>;
type InlineStyle = React.CSSProperties;

interface Props {
  beforeImage: string;
  afterImage: string;
  width?: number | string;
  height?: number | string;
  rounded?: boolean;
  onChange?: (event: ChangeEvent) => void;
  onPointerMove?: (event: PointerEvent) => void;
  onPointerEnter?: (event: PointerEvent) => void;
  onPointerLeave?: (event: PointerEvent) => void;
  pointerMove?: boolean;
  className?: string;
  beforeClassName?: string;
  afterClassName?: string;
  buttonClassName?: string;
  style?: InlineStyle;
  beforeStyle?: InlineStyle;
  afterStyle?: InlineStyle;
  buttonStyle?: InlineStyle;
}

// // Helper function to get responsive dimensions based on screen width
// const getResponsiveSize = (baseSize: number): number => {
//   if (typeof window === 'undefined') return baseSize; // SSR check

//   const width = window.innerWidth;
//   if (width < 480) return baseSize * 0.7; // Small mobile
//   if (width < 768) return baseSize * 0.85; // Mobile
//   return baseSize; // Default/Desktop
// };

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  width,
  height,
  rounded = false,
  onChange,
  onPointerMove,
  onPointerEnter,
  onPointerLeave,
  pointerMove = false,
  className = "before-after-slider",
  beforeClassName = "before",
  afterClassName = "after",
  buttonClassName = "resize-button",
  style,
  beforeStyle,
  afterStyle,
  buttonStyle,
}: Props) {
  const [{ rangeValue }, dispatch] = useReducer(reducer, {
    rangeValue: 50,
  });

  const handleChange = (event: ChangeEvent) => {
    dispatch({ type: "change", payload: Number(event.target.value) });

    if (onChange) onChange(event);
  };

  const handlePointerMove = (event: PointerEvent) => {
    const { clientX, currentTarget } = event;
    const { left, width } = currentTarget.getBoundingClientRect();
    const positionX = clientX - left;

    if (positionX >= 0)
      dispatch({ type: "move", payload: (positionX / width) * 100 });

    if (onPointerMove) onPointerMove(event);
  };

  const handlePointerEnter = (event: PointerEvent) => {
    if (!onPointerEnter) return;

    onPointerEnter(event);
  };

  const handlePointerLeave = (event: PointerEvent) => {
    if (!onPointerLeave) return;

    onPointerLeave(event);
  };

  // Use React hook for window resize
  const [windowSize, setWindowSize] = React.useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
  });

  React.useEffect(() => {
    // Only execute on client side

    // Handler to call on window resize
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
      });
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures effect is only run on mount and unmount

  // Adjust button size based on screen width
  const buttonSize = React.useMemo(() => {
    if (windowSize.width < 480) return 22; // Small mobile
    if (windowSize.width < 768) return 26; // Mobile
    return 30; // Default/Desktop
  }, [windowSize.width]);

  // Adjust icon size based on screen width
  const iconSize = React.useMemo(() => {
    if (windowSize.width < 480) return 14; // Small mobile
    if (windowSize.width < 768) return 16; // Mobile
    return 20; // Default/Desktop
  }, [windowSize.width]);

  const labelClassName = cn(
    "inline-flex items-center justify-center w-[4.75rem] text-primary-accent font-semibold tracking-wider text-xs px-2 py-2 rounded select-none shadow",
    "bg-gray-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-30",
  );

  return (
    <div
      className={className}
      style={{
        position: `relative`,
        overflow: `hidden`,
        width: width || "100%",
        height: height ?? "auto",
        aspectRatio: height ? undefined : "1 / 1",
        cursor: "e-resize",
        userSelect: "none",
        borderRadius: rounded ? "0.75rem" : undefined, // rounded-xl equivalent
        maxWidth: "100%", // Ensure it doesn't overflow container on small screens
        ...style,
      }}
      onPointerMove={pointerMove ? handlePointerMove : undefined}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {/* After image as base layer */}
      <div
        className={cn("absolute inset-0", afterClassName)}
        style={afterStyle}
      >
        <Image
          src={afterImage}
          alt="after"
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          quality={100}
          className="object-cover"
        />
      </div>

      {/* Before image overlay with clipping */}
      <div
        className={cn("absolute inset-0", beforeClassName)}
        style={{
          clipPath: `inset(0 ${100 - rangeValue}% 0 0)`,
          borderRight: "2px solid #eee",
          ...beforeStyle,
        }}
      >
        <Image
          src={beforeImage}
          alt="before"
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          quality={100}
          className="object-cover"
        />
      </div>

      {!pointerMove && (
        <>
          <input
            type="range"
            min={0}
            max={100}
            value={rangeValue}
            name="slider"
            onChange={handleChange}
            style={{
              appearance: "none",
              backgroundColor: "transparent",
              width: "100%",
              height: "100%",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              cursor: "inherit",
            }}
          />
          <div
            className={buttonClassName}
            style={{
              backgroundColor: "#fff",
              pointerEvents: "none",
              position: "absolute",
              top: "50%",
              left: `${rangeValue}%`,
              transform: `translate(-50%,-50%)`,
              borderRadius: "50%",
              width: buttonSize,
              height: buttonSize,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0px 0px 5px rgba(0,0,0,0.3)", // Add shadow for better visibility
              ...buttonStyle,
            }}
          >
            <svg
              fill="#333"
              xmlns="http://www.w3.org/2000/svg"
              width={iconSize}
              height={iconSize}
              viewBox="0 0 24 24"
            >
              <path d="M24,12l-5.7-5.7V11c-3.7,0-9,0-12.6,0V6.3L0,12l5.8,5.7V13c3.6,0,8.9,0,12.5,0v4.7L24,12z" />
            </svg>
          </div>
        </>
      )}
      {/* Labels for Before and After */}
      <div className="pointer-events-none absolute bottom-3 left-2 z-20">
        <span className={labelClassName}>Before</span>
      </div>
      <div className="pointer-events-none absolute bottom-3 right-2 z-20">
        <span className={labelClassName}>After</span>
      </div>
    </div>
  );
}
