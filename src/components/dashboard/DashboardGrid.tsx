import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { WidgetConfig, WIDGET_SIZE_MAP, WidgetSize } from "@/types/dashboard";
import { Button } from "@/components/ui/button";

interface DashboardGridProps {
  widgets: WidgetConfig[];
  onReorder: (newOrder: string[]) => void;
  onUpdateWidget: (widgetId: string, updates: Partial<WidgetConfig>) => void;
  isCustomizing: boolean;
  children: (widget: WidgetConfig) => React.ReactNode;
}

function SortableWidget({
  widget,
  children,
  isCustomizing,
  onUpdateWidget,
}: {
  widget: WidgetConfig;
  children: React.ReactNode;
  isCustomizing: boolean;
  onUpdateWidget: (widgetId: string, updates: Partial<WidgetConfig>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: widget.id,
    disabled: !isCustomizing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sizes: WidgetSize[] = ["small", "medium", "large", "full"];
  const currentSizeIndex = sizes.indexOf(widget.size);
  
  const handleSizeIncrease = () => {
    if (currentSizeIndex < sizes.length - 1) {
      onUpdateWidget(widget.id, { size: sizes[currentSizeIndex + 1] });
    }
  };

  const handleSizeDecrease = () => {
    if (currentSizeIndex > 0) {
      onUpdateWidget(widget.id, { size: sizes[currentSizeIndex - 1] });
    }
  };

  const getSizeLabel = (size: WidgetSize) => {
    const labels = { small: "1x", medium: "2x", large: "3x", full: "4x" };
    return labels[size];
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        WIDGET_SIZE_MAP[widget.size],
        isCustomizing && "ring-2 ring-primary/20 rounded-xl",
      )}
    >
      {isCustomizing && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-background border rounded-lg shadow-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 cursor-grab active:cursor-grabbing hover:bg-accent"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </Button>
          {widget.resizable && (
            <>
              <div className="h-5 w-px bg-border" />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-accent"
                onClick={handleSizeDecrease}
                disabled={currentSizeIndex === 0}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs font-medium px-1 min-w-[28px] text-center">
                {getSizeLabel(widget.size)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-accent"
                onClick={handleSizeIncrease}
                disabled={currentSizeIndex === sizes.length - 1}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export function DashboardGrid({
  widgets,
  onReorder,
  onUpdateWidget,
  isCustomizing,
  children,
}: DashboardGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);

      const newOrder = arrayMove(widgets, oldIndex, newIndex);
      onReorder(newOrder.map((w) => w.id));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-4 gap-4 auto-rows-min">
          {widgets.map((widget) => (
            <SortableWidget
              key={widget.id}
              widget={widget}
              isCustomizing={isCustomizing}
              onUpdateWidget={onUpdateWidget}
            >
              {children(widget)}
            </SortableWidget>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
