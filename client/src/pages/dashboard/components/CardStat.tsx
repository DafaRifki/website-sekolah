import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CardStatProps } from "../types";

const colorMap: Record<string, string> = {
  green: "hover:bg-green-100 active:bg-green-200 text-green-600",
  yellow: "hover:bg-yellow-100 active:bg-yellow-200 text-yellow-600",
  red: "hover:bg-red-100 active:bg-red-200 text-red-600",
  blue: "hover:bg-blue-100 active:bg-blue-200 text-blue-600",
};

const CardStat: React.FC<CardStatProps> = ({
  title,
  value,
  description,
  icon,
  color,
}) => (
  <Card
    className={`cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 ${colorMap[color]}`}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">
        {title}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <p className={`text-2xl font-bold ${colorMap[color].split(" ")[2]}`}>
        {value}
      </p>
      <p className="text-xs text-gray-500">{description}</p>
    </CardContent>
  </Card>
);

export default CardStat;
