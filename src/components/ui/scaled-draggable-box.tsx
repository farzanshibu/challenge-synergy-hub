import React, { useState, useRef, useEffect } from 'react';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const ScaledDraggableBox = ({
  // Mini‑map visible dimensions
  miniMapWidth = 640,
  miniMapHeight = 360,

  // Full resolution “canvas” (e.g., 1920×1080)
  totalWidth = 1920,
  totalHeight = 1080,

  // Draggable box dimensions (in full‑resolution units)
  boxWidth = 100,
  boxHeight = 100,

  // Movement step (in full‑resolution pixels)
  step = 5,

  // Called with the "compensated" position: (x + boxWidth, y + boxHeight)
  onPositionChange = () => {},
}) => {
  // Store the top-left corner in full resolution
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Scale factor from full resolution to mini-map
  const scale = Math.min(miniMapWidth / totalWidth, miniMapHeight / totalHeight);

  // Clamp top-left corner so box never leaves the container visually
  const clampPosition = (x, y) => ({
    x: clamp(x, 0, totalWidth - boxWidth),
    y: clamp(y, 0, totalHeight - boxHeight),
  });

  // Whenever position changes, report the "bottom-right" corner
  // i.e. top-left + boxWidth/boxHeight
  useEffect(() => {
    onPositionChange(position.x + boxWidth, position.y + boxHeight);
  }, [position, boxWidth, boxHeight, onPositionChange]);

  // Start dragging
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);

    const rect = containerRef.current.getBoundingClientRect();
    // Convert mouse to full-res coords via scale
    const clickX = (e.clientX - rect.left) / scale;
    const clickY = (e.clientY - rect.top) / scale;

    dragOffset.current = {
      x: clickX - position.x,
      y: clickY - position.y,
    };
  };

  // Drag in progress
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;

    const newX = mouseX - dragOffset.current.x;
    const newY = mouseY - dragOffset.current.y;
    setPosition(clampPosition(newX, newY));
  };

  // End dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Arrow key nudge (clamped)
  const handleKeyDown = (e) => {
    let { x, y } = position;
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        y -= step;
        break;
      case 'ArrowDown':
        e.preventDefault();
        y += step;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        x -= step;
        break;
      case 'ArrowRight':
        e.preventDefault();
        x += step;
        break;
      default:
        return;
    }
    setPosition(clampPosition(x, y));
  };

  // Attach global mouse listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{
        width: miniMapWidth,
        height: miniMapHeight,
        position: 'relative',
        overflow: 'hidden', // no scroll
        border: '2px solid #ccc',
        backgroundColor: '#f8f8f8',
      }}
    >
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          left: position.x * scale,
          top: position.y * scale,
          width: boxWidth * scale,
          height: boxHeight * scale,
          backgroundColor: '#b18ce2',
          cursor: 'move',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 12,
        }}
      >
        {/* Show top-left corner vs. totalWidth/totalHeight in UI */}
        TL({Math.round(position.x)}, {Math.round(position.y)})
      </div>
    </div>
  );
};

export default ScaledDraggableBox;
