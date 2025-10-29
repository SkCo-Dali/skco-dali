import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { WidgetConfig, WIDGET_SIZE_MAP, WidgetSize } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  const handleSizeChange = (size: WidgetSize) => {
    onUpdateWidget(widget.id, { size });
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
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-background border rounded-lg shadow-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </Button>
          {widget.resizable && (
            <Select value={widget.size} onValueChange={handleSizeChange}>
              <SelectTrigger className="h-7 w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Pequeño</SelectItem>
                <SelectItem value="medium">Mediano</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
                <SelectItem value="full">Completo</SelectItem>
              </SelectContent>
            </Select>
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
