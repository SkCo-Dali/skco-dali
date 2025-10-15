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
    <div className="grid w-[815px] grid-cols-3 bg-gray-100 rounded-full px-0 py-0 my-0">
      {CATEGORIES.map((category) => (
        <button
          key={category.value}
          onClick={() => onCategoryChange(category.value)}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-medium transition-all",
            "border-2",
            selectedCategory === category.value
              ? "w-full h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C73D] data-[state=active]:to-[#A3E40B] data-[state=active]:text-white rounded-full px-4 py-2 mt-0 text-sm font-medium transition-all duration-200"
              : "bg-background text-foreground border-border hover:border-[#00c73d] hover:bg-[#00c73d]/5",
          )}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
