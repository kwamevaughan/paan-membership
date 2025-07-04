import { useState } from "react";
import { Icon } from "@iconify/react";

const FullscreenToggle = ({ mode }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen toggle function
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        // Firefox
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        // Chrome, Safari, Opera
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        // IE/Edge
        document.documentElement.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        // Firefox
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        // Chrome, Safari, Opera
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        // IE/Edge
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={toggleFullscreen}
        aria-label={
          isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"
        }
        className={`focus:outline-none p-2 rounded-full bg-white/50 ${
          mode === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
        }`}
      >
        <Icon
          icon={
            isFullscreen
              ? "dashicons:fullscreen-exit-alt"
              : "mingcute:fullscreen-fill"
          }
          className={`h-5 w-5 ${mode === "dark" ? "text-white" : "text-black"}`}
        />
      </button>
      <div
        className={`
          absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max
          bg-white text-gray-900 text-xs py-1 px-3 rounded-md
          shadow-lg opacity-0 group-hover:opacity-100
          translate-y-1 group-hover:translate-y-0
          transition-all duration-200 ease-in-out
          ${mode === "dark" ? "text-gray-200" : "text-gray-900"}
          before:content-[''] before:absolute before:-top-1.5 before:left-1/2
          before:-translate-x-1/2 before:border-4
          before:border-transparent before:border-b-white
        `}
      >
        {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      </div>
    </div>
  );
};

export default FullscreenToggle;
