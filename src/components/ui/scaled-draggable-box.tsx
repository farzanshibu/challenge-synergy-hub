import React, { useState, useRef, useEffect } from "react";

interface ScaledDraggableBoxProps {
  miniMapWidth?: number;
  miniMapHeight?: number;
  totalWidth?: number;
  totalHeight?: number;
  boxWidth?: number;
  boxHeight?: number;
  step?: number;
  initialX?: number;
  initialY?: number;
  onPositionChange?: (x: number, y: number) => void;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const ScaledDraggableBox = ({
  miniMapWidth = 640,
  miniMapHeight = 367,
  totalWidth = 2040,
  totalHeight = 1180,
  boxWidth = 120,
  boxHeight = 90,
  step = 5,
  initialX = 0,
  initialY = 0,
  onPositionChange = (x: number, y: number) => {},
}: ScaledDraggableBoxProps) => {
  const [position, setPosition] = useState({
    x: initialX,
    y: initialY,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const scale = Math.min(
    miniMapWidth / totalWidth,
    miniMapHeight / totalHeight
  );

  // Fix: The clampPosition function needs to account for the scaled box size
  const clampPosition = (x: number, y: number) => {
    const maxX = Math.max(0, 1240 - boxWidth);
    const maxY = Math.max(0, 910 - boxHeight);
    return {
      x: clamp(x, 0, maxX),
      y: clamp(y, 0, maxY),
    };
  };

  useEffect(() => {
    // Center of the box = position + half of boxWidth/Height
    onPositionChange(Math.round(position.x), Math.round(position.y));
  }, [position, boxWidth, boxHeight, onPositionChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = containerRef.current!.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / scale;
    const clickY = (e.clientY - rect.top) / scale;

    dragOffset.current = {
      x: clickX - position.x,
      y: clickY - position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const rect = containerRef.current!.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;

    setPosition(
      clampPosition(
        mouseX - dragOffset.current.x,
        mouseY - dragOffset.current.y
      )
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let { x, y } = position;
    switch (e.key) {
      case "ArrowUp":
        y -= step;
        break;
      case "ArrowDown":
        y += step;
        break;
      case "ArrowLeft":
        x -= step;
        break;
      case "ArrowRight":
        x += step;
        break;
      default:
        return;
    }
    e.preventDefault();
    setPosition(clampPosition(x, y));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-100 font-medium">
        Position: X {Math.round(position.x)}, Y {Math.round(position.y)}
      </div>

      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="relative overflow-hidden border-2 border-stone-950 bg-stone-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent flex items-center justify-center"
        style={{ width: miniMapWidth, height: miniMapHeight }}
      >
        <div
          className="relative bg-stone-950 overflow-hidden"
          style={{
            width: 1240 * scale,
            height: 910 * scale,
          }}
        >
          <div
            onMouseDown={handleMouseDown}
            className="absolute px-5 bg-purple-500 cursor-move select-none flex items-center justify-center text-white text-[9px] font-light rounded-sm"
            style={{
              left: position.x * scale,
              top: position.y * scale,
              width: boxWidth * scale,
              height: boxHeight * scale,
            }}
          >
            🔥
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScaledDraggableBox;
