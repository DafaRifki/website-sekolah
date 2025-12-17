import React from "react";
import type { CardStatProps } from "../types";

const CardStat: React.FC<CardStatProps> = ({
  title,
  value,
  description,
  icon,
  color,
}) => {
  const getColorClass = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "green":
        return "bg-green-50 text-green-700 border-green-100";
      case "yellow":
        return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "red":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const getIconBgClass = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100";
      case "green":
        return "bg-green-100";
      case "yellow":
        return "bg-yellow-100";
      case "red":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div
      className={`p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 ${getColorClass(
        color
      )}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          <p className="text-xs mt-2 opacity-70">{description}</p>
        </div>
        <div className={`p-3 rounded-lg ${getIconBgClass(color)}`}>
          {React.isValidElement(icon)
            ? React.cloneElement(
                icon as React.ReactElement<{
                  size?: number;
                  className?: string;
                }>,
                {
                  size: 24,
                  className: "opacity-80",
                }
              )
            : icon}
        </div>
      </div>
    </div>
  );
};

export default CardStat;
