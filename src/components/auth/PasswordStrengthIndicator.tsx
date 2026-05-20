"use client";

import React from "react";

interface PasswordStrengthProps {
  score: 0 | 1 | 2 | 3;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthProps> = ({ score }) => {
  const labels = ["Weak", "Fair", "Good", "Strong"];
  const barColors = [
    "bg-error",
    "bg-error",
    "bg-tertiary-container",
    "bg-tertiary",
  ];

  return (
    <div className="w-full space-y-2 mt-2">
      <div className="flex justify-between items-center text-xs font-medium text-on-surface-variant">
        <span>Password Strength</span>
        <span>{labels[score]}</span>
      </div>
      <div className="grid grid-cols-4 gap-1 h-1.5 w-full bg-surface-variant rounded-sm overflow-hidden">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`h-full transition-colors duration-300 ${
              index <= score ? barColors[score] : "bg-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
