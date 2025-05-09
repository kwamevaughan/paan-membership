import { useState, useEffect } from "react";

export default function MovingDotBorder({ children, mode, className = "" }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [angle, setAngle] = useState(0);
  const dotColor = "#f05d23"; // The requested color
  const dotSize = 8; // Size of the dot in pixels

  // Calculate the position of the dot along the border
  useEffect(() => {
    const intervalId = setInterval(() => {
      setAngle((prevAngle) => (prevAngle + 1) % 360);
    }, 30);

    return () => clearInterval(intervalId);
  }, []);

  // Calculate dot position based on angle
  useEffect(() => {
    // Container dimensions - we'll use these to calculate the dot's position
    const container = document.getElementById("gradient-container");
    if (container) {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const borderRadius = 16; // This matches the rounded-2xl class

      // Calculate the path of the dot around the rounded rectangle
      let x, y;

      // Adjusted calculations to follow the border precisely
      if (angle <= 90) {
        // Top right corner and right edge
        const adjustedAngle = angle;
        if (adjustedAngle < 45) {
          // Top edge
          x = width * (adjustedAngle / 45);
          y = 0;
        } else {
          // Right corner arc
          const arcAngle = (adjustedAngle - 45) * (Math.PI / 180) * 2;
          x = width - borderRadius + Math.sin(arcAngle) * borderRadius;
          y = borderRadius - Math.cos(arcAngle) * borderRadius;
        }
      } else if (angle <= 180) {
        // Right edge and bottom right corner
        const adjustedAngle = angle - 90;
        if (adjustedAngle < 45) {
          // Right edge
          x = width;
          y = borderRadius + (height - 2 * borderRadius) * (adjustedAngle / 45);
        } else {
          // Bottom right corner arc
          const arcAngle = (adjustedAngle - 45) * (Math.PI / 180) * 2;
          x = width - borderRadius + Math.cos(arcAngle) * borderRadius;
          y = height - borderRadius + Math.sin(arcAngle) * borderRadius;
        }
      } else if (angle <= 270) {
        // Bottom edge and bottom left corner
        const adjustedAngle = angle - 180;
        if (adjustedAngle < 45) {
          // Bottom edge
          x = width - width * (adjustedAngle / 45);
          y = height;
        } else {
          // Bottom left corner arc
          const arcAngle = (adjustedAngle - 45) * (Math.PI / 180) * 2;
          x = borderRadius - Math.sin(arcAngle) * borderRadius;
          y = height - borderRadius + Math.cos(arcAngle) * borderRadius;
        }
      } else {
        // Left edge and top left corner
        const adjustedAngle = angle - 270;
        if (adjustedAngle < 45) {
          // Left edge
          x = 0;
          y =
            height -
            borderRadius -
            (height - 2 * borderRadius) * (adjustedAngle / 45);
        } else {
          // Top left corner arc
          const arcAngle = (adjustedAngle - 45) * (Math.PI / 180) * 2;
          x = borderRadius - Math.cos(arcAngle) * borderRadius;
          y = borderRadius - Math.sin(arcAngle) * borderRadius;
        }
      }

      setPosition({ x, y });
    }
  }, [angle]);

  return (
    <div
      id="gradient-container"
      className={`relative p-[4px] rounded-2xl ${
        mode !== "dark"
          ? "bg-gradient-to-r from-[#1e3a8a] via-[#f05d23] to-[#6b21a8] bg-[length:400%_400%] animate-circularGradient"
          : "bg-transparent"
      } ${className}`}
    >
      {/* Dot element positioned absolutely */}
      <div
        className="absolute w-2 h-2 rounded-full z-20"
        style={{
          backgroundColor: dotColor,
          left: `${position.x - dotSize / 2}px`,
          top: `${position.y - dotSize / 2}px`,
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          boxShadow: "0 0 5px rgba(240, 93, 35, 0.7)",
        }}
      />
      {children}
    </div>
  );
}
