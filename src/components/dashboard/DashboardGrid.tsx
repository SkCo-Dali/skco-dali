import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { WidgetConfig } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";

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

  const [isResizing, setIsResizing] = useState(false);
  const [dimensions, setDimensions] = useState({ cols: widget.cols || 2, rows: widget.rows || 1 });
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDimensions({ cols: widget.cols || 2, rows: widget.rows || 1 });
  }, [widget.cols, widget.rows]);

  const handleResizeStart = (e: React.MouseEvent, direction: 'right' | 'bottom' | 'corner') => {
    if (!isCustomizing) return;
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startCols = dimensions.cols;
    const startRows = dimensions.rows;
    const cellWidth = widgetRef.current?.parentElement?.offsetWidth ? 
      (widgetRef.current.parentElement.offsetWidth - 48) / 4 : 200; // 4 columns, gap-4 (16px * 3)
    const cellHeight = 200;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      if (direction === 'right' || direction === 'corner') {
        const newCols = Math.max(1, Math.min(4, Math.round(startCols + deltaX / cellWidth)));
        setDimensions(prev => ({ ...prev, cols: newCols }));
      }

      if (direction === 'bottom' || direction === 'corner') {
        const newRows = Math.max(1, Math.round(startRows + deltaY / cellHeight));
        setDimensions(prev => ({ ...prev, rows: newRows }));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      onUpdateWidget(widget.id, { 
        cols: dimensions.cols, 
        rows: dimensions.rows 
      });
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isResizing ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
    gridColumn: `span ${dimensions.cols}`,
    gridRow: `span ${dimensions.rows}`,
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (node) (widgetRef as any).current = node;
      }}
      style={style}
      className={cn(
        "relative group",
        isCustomizing && "ring-2 ring-primary/20 rounded-xl",
      )}
    >
      {isCustomizing && (
        <>
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
          </div>
          
          {widget.resizable && (
            <>
              {/* Right resize handle */}
              <div
                className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-primary/20 transition-colors z-10"
                onMouseDown={(e) => handleResizeStart(e, 'right')}
              />
              
              {/* Bottom resize handle */}
              <div
                className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-primary/20 transition-colors z-10"
                onMouseDown={(e) => handleResizeStart(e, 'bottom')}
              />
              
              {/* Corner resize handle */}
              <div
                className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize hover:bg-primary/30 transition-colors z-10 rounded-tl-lg"
                onMouseDown={(e) => handleResizeStart(e, 'corner')}
              />
            </>
          )}
        </>
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
        <div className="grid grid-cols-4 gap-4" style={{ gridAutoRows: '200px' }}>
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
