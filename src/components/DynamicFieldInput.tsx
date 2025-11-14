import { useRef, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { DynamicField } from "@/types/email";

interface DynamicFieldInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dynamicFields: DynamicField[];
  onDrop?: (e: React.DragEvent) => void;
}

interface ParsedSegment {
  type: "text" | "field";
  content: string;
  fieldLabel?: string;
}

export function DynamicFieldInput({
  value,
  onChange,
  placeholder,
  dynamicFields,
  onDrop,
}: DynamicFieldInputProps) {
  const [segments, setSegments] = useState<ParsedSegment[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    parseValue(value);
  }, [value, dynamicFields]);

  const parseValue = (text: string) => {
    const parsed: ParsedSegment[] = [];
    const regex = /\{([^}]+)\}/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the field
      if (match.index > lastIndex) {
        const textContent = text.substring(lastIndex, match.index);
        if (textContent) {
          parsed.push({ type: "text", content: textContent });
        }
      }

      // Add the field
      const fieldKey = match[1];
      const field = dynamicFields.find((f) => f.key === fieldKey);
      parsed.push({
        type: "field",
        content: `{${fieldKey}}`,
        fieldLabel: field?.label || fieldKey,
      });

      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const textContent = text.substring(lastIndex);
      if (textContent) {
        parsed.push({ type: "text", content: textContent });
      }
    }

    setSegments(parsed);
  };

  const handleTextChange = (index: number, newText: string) => {
    const newSegments = [...segments];
    newSegments[index].content = newText;

    // Reconstruct the full value
    const newValue = newSegments.map((s) => s.content).join("");
    onChange(newValue);
  };

  const handleRemoveField = (index: number) => {
    const newSegments = segments.filter((_, i) => i !== index);
    const newValue = newSegments.map((s) => s.content).join("");
    onChange(newValue);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // If clicking on the container itself (not on inputs or badges), focus the trailing input
    if (e.target === containerRef.current) {
      const trailingInput = containerRef.current?.querySelector('input:last-of-type') as HTMLInputElement;
      if (trailingInput) {
        trailingInput.focus();
      }
    }
  };

  const handleTrailingInputChange = (newText: string) => {
    // Add or update the trailing text segment
    const newValue = segments.map((s) => s.content).join("") + newText;
    onChange(newValue);
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-wrap items-center gap-1 min-h-10 px-3 py-2 border border-input bg-background rounded-md cursor-text focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      onClick={handleContainerClick}
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {segments.length === 0 && !value && (
        <span className="text-muted-foreground text-sm pointer-events-none">{placeholder}</span>
      )}
      {segments.map((segment, index) => (
        <div key={index} className="inline-flex items-center">
          {segment.type === "field" ? (
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 cursor-default select-none"
            >
              <span className="pointer-events-none">{segment.fieldLabel}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveField(index);
                }}
                className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                type="button"
              >
                ×
              </button>
            </Badge>
          ) : (
            <input
              type="text"
              value={segment.content}
              onChange={(e) => handleTextChange(index, e.target.value)}
              onFocus={() => setEditingIndex(index)}
              onBlur={() => setEditingIndex(null)}
              className="bg-transparent border-none outline-none min-w-[20px] text-sm px-0"
              style={{ width: `${Math.max(segment.content.length, 1)}ch` }}
            />
          )}
        </div>
      ))}
      {/* Trailing input for easy typing at the end */}
      <input
        type="text"
        onChange={(e) => handleTrailingInputChange(e.target.value)}
        className="bg-transparent border-none outline-none flex-1 min-w-[40px] text-sm px-0"
        placeholder={segments.length === 0 ? placeholder : ""}
      />
    </div>
  );
}
