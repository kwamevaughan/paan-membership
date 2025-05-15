import { useEffect, useRef, useState } from "react";

export default function ConnectingDotsBackground({
  color = "#f05d23",
  secondaryColor = "#505050",
  dotCount = 10, // Reduced dot count
  lineDistance = 180,
  dotSize = 2,
  speed = 0.3,
  responsive = true,
  className = "",
  mode,
}) {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const isDarkMode = mode === "dark";
  const animationRef = useRef(null);
  const dotsRef = useRef([]);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const isMouseActiveRef = useRef(false);
  const mouseSpeedRef = useRef({ x: 0, y: 0 });
  const prevMousePosRef = useRef({ x: 0, y: 0 });

  const getRandomColor = () => {
    const colors = [
      "#f05d23", // Orange
      "#4CAF50", // Green
      "#2196F3", // Blue
      "#FF9800", // Amber
      "#E91E63", // Pink
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        setDimensions({
          width: container.offsetWidth,
          height: container.offsetHeight,
        });
      }
    };

    const handleMouseMove = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;

      mouseSpeedRef.current = {
        x: newX - prevMousePosRef.current.x,
        y: newY - prevMousePosRef.current.y,
      };

      prevMousePosRef.current = { x: newX, y: newY };
      mousePositionRef.current = { x: newX, y: newY };
      isMouseActiveRef.current = true;

      clearTimeout(mouseInactiveTimeout);
      mouseInactiveTimeout = setTimeout(() => {
        isMouseActiveRef.current = false;
      }, 3000);
    };

    let mouseInactiveTimeout;

    updateDimensions();

    if (responsive) {
      window.addEventListener("resize", updateDimensions);
    }

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      if (responsive) {
        window.removeEventListener("resize", updateDimensions);
      }
      document.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(mouseInactiveTimeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [responsive]);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const spawnRadius = 100; // Reduced spawn radius for fewer dots

    dotsRef.current = Array.from({ length: dotCount }, () => {
      const radius = Math.random() * dotSize + 0.8;
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * spawnRadius;
      return {
        x: mousePositionRef.current.x + Math.cos(angle) * distance,
        y: mousePositionRef.current.y + Math.sin(angle) * distance,
        radius: radius,
        vx: (Math.random() * speed - speed / 2) * (radius / dotSize),
        vy: (Math.random() * speed - speed / 2) * (radius / dotSize),
        originalRadius: radius,
        opacity: Math.random() * 0.5 + 0.5,
        color: getRandomColor(),
      };
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { x: mouseX, y: mouseY } = mousePositionRef.current;
      const { x: speedX, y: speedY } = mouseSpeedRef.current;
      const mouseSpeed = Math.sqrt(speedX * speedX + speedY * speedY);
      const isMouseActive = isMouseActiveRef.current;

      const mouseDot = isMouseActive
        ? {
            x: mouseX,
            y: mouseY,
            radius: dotSize * 2 + Math.min(mouseSpeed / 5, 3),
            opacity: 1,
          }
        : null;

      dotsRef.current.forEach((dot) => {
        const time = Date.now() / 1000;
        const pulseFactor = Math.sin(time) * 0.15 + 1;

        dot.x += dot.vx;
        dot.y += dot.vy;

        const dx = dot.x - mouseX;
        const dy = dot.y - mouseY;
        const distanceToMouse = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = spawnRadius;

        if (distanceToMouse > maxDistance) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * maxDistance;
          dot.x = mouseX + Math.cos(angle) * distance;
          dot.y = mouseY + Math.sin(angle) * distance;
          dot.vx = (Math.random() * speed - speed / 2) * (dot.radius / dotSize);
          dot.vy = (Math.random() * speed - speed / 2) * (dot.radius / dotSize);
        }

        dot.radius = dot.originalRadius * pulseFactor;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.globalAlpha = dot.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, dotCount, speed, dotSize]);

  return (
    <canvas ref={canvasRef} className={`absolute inset-0 -z-10 ${className}`} />
  );
}
