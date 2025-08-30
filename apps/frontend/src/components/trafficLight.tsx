import React from "react";
import clsx from "clsx";

interface TrafficLightProps {
  value: boolean; // true = vert à droite, false = rouge à gauche
}

export const TrafficLight: React.FC<TrafficLightProps> = ({ value }) => {
    return (
      <div className="flex space-x-6 items-center justify-evenly">
        {/* Cercle gauche (rouge si false) */}
        <div
          className={clsx(
            "w-15 h-15 rounded-full transition-all duration-500 ease-in-out",
            value
              ? "bg-gray-400 scale-95"
              : "bg-red-500 shadow-lg shadow-red-500/70 animate-pulse scale-110"
          )}
        />
  
        {/* Cercle droit (vert si true) */}
        <div
          className={clsx(
            "w-15 h-15 rounded-full transition-all duration-500 ease-in-out",
            value
              ? "bg-green-500 shadow-lg shadow-green-500/70 animate-pulse scale-110"
              : "bg-gray-400 scale-95"
          )}
        />
      </div>
    );
  };
