"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export interface ProgressBarProps {
  /** One of the five stages: waiting, requesting, offering, considering, result */
  status:
    | undefined
    | "waiting"
    | "requesting"
    | "offering"
    | "considering"
    | "accepted"
    | "rejected"
    | "result";
}

const STAGES = [
  "waiting",
  "requesting",
  "offering",
  "considering",
  "result",
] as const;

export const ProgressBar: React.FC<ProgressBarProps> = ({ status }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (status === "waiting") {
      setCurrentIndex(0);
    } else if (status === "requesting") {
      setCurrentIndex(1);
    } else if (status === "offering") {
      setCurrentIndex(2);
    } else if (status === "considering") {
      setCurrentIndex(3);
    } else if (status === "accepted" || status === "rejected") {
      setCurrentIndex(4);
    }
  });

  // map index to percentage (0% at index 0, 100% at index 4)
  const progressValue =
    currentIndex < 0 ? 0 : (currentIndex / (STAGES.length - 1)) * 100;

  return (
    <Card className="w-full p-4">
      {/* Stage Labels */}
      <div className="grid grid-cols-5 gap-2 mb-2 text-sm">
        {STAGES.map((stage, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          // Shared base styles
          let labelClasses = "text-center truncate transition-colors";

          if (isCurrent) {
            // Highlight current stage
            labelClasses += " text-blue-600 font-semibold";
          } else if (isPassed) {
            // Highlight passed stages differently
            labelClasses += " text-green-600";
          } else {
            // Future stages
            labelClasses += " text-gray-400";
          }

          // Capitalize first letter
          const labelText = stage.charAt(0).toUpperCase() + stage.slice(1);

          return (
            <div key={stage} className={labelClasses}>
              {labelText}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <Progress value={progressValue} className="w-full" />
    </Card>
  );
};
