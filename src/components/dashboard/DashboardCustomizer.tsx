import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings2, RefreshCw, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { WidgetConfig } from "@/types/dashboard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardCustomizerProps {
  widgets: WidgetConfig[];
  onToggleWidget: (widgetId: string) => void;
  onReset: () => void;
  isCustomizing: boolean;
  onCustomizingChange: (value: boolean) => void;
}

export function DashboardCustomizer({
  widgets,
  onToggleWidget,
  onReset,
  isCustomizing,
  onCustomizingChange,
}: DashboardCustomizerProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant={isCustomizing ? "default" : "outline"}
        size="sm"
        onClick={() => onCustomizingChange(!isCustomizing)}
        className="gap-2"
      >
        <Settings2 className="h-4 w-4" />
        {isCustomizing ? "Guardar cambios" : "Personalizar"}
      </Button>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Configurar widgets</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
            <div className="space-y-4 pr-4">
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {widget.enabled ? (
                      <Eye className="h-4 w-4 text-primary" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <Label className="text-sm font-medium">{widget.title}</Label>
                      <p className="text-xs text-muted-foreground">{widget.type}</p>
                    </div>
                  </div>
                  <Switch checked={widget.enabled} onCheckedChange={() => onToggleWidget(widget.id)} />
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" onClick={onReset} className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              Restaurar diseño original
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
