import React from "react";
import { cn } from "@/lib/utils";

export type CommissionCategory = "pensiones" | "fiduciaria" | "seguros" | "all";

interface CommissionsCategorySlicerProps {
  selectedCategory: CommissionCategory;
  onCategoryChange: (category: CommissionCategory) => void;
}

const CATEGORIES: { value: CommissionCategory; label: string }[] = [
  { value: "pensiones", label: "Pensiones y Cesantías" },
  { value: "fiduciaria", label: "Fiduciaria" },
  { value: "seguros", label: "Seguros de Vida" },
];

export function CommissionsCategorySlicer({ selectedCategory, onCategoryChange }: CommissionsCategorySlicerProps) {
  return (
    <div className="grid w-[700px] grid-cols-3 bg-gray-100 rounded-full px-0 py-0 my-0">
      {CATEGORIES.map((category) => (
        <button
          key={category.value}
          onClick={() => onCategoryChange(category.value)}
          className={cn(
            "w-full h-full rounded-full px-4 py-2 mt-0 text-sm font-medium transition-all duration-200",
            selectedCategory === category.value
              ? "bg-gradient-to-r from-[#00C73D] to-[#A3E40B] text-white"
              : "bg-transparent text-foreground hover:bg-transparent",
          )}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
