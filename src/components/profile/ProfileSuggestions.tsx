import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProfile } from "@/types/userProfile";
import { Send, MessageSquare, CheckCircle2, Clock, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Props {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  onBack: () => void;
}

export function ProfileSuggestions({ profile, updateProfile, onBack }: Props) {
  const [newSuggestion, setNewSuggestion] = useState("");
  const [category, setCategory] = useState("general");

  const handleSubmit = () => {
    if (!newSuggestion.trim()) {
      toast.error("Por favor escribe una sugerencia");
      return;
    }

    const suggestion = {
      id: Date.now().toString(),
      text: newSuggestion,
      category,
      createdAt: new Date().toISOString(),
      status: "pending" as const,
    };

    updateProfile({
      suggestions: [...(profile.suggestions || []), suggestion],
    });

    setNewSuggestion("");
    setCategory("general");
    toast.success("¡Gracias por tu sugerencia! La revisaremos pronto.");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "implemented":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "reviewed":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "implemented":
        return "Implementada";
      case "reviewed":
        return "En revisión";
      default:
        return "Pendiente";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* New Suggestion Form */}
      <Card className="p-4 border-border/40 space-y-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-primary" />
          <div>
            <h3 className="font-medium text-lg">Nueva Sugerencia</h3>
            <p className="text-sm text-muted-foreground">¿Qué te gustaría que mejoráramos?</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="leads">Leads</SelectItem>
                <SelectItem value="opportunities">Oportunidades</SelectItem>
                <SelectItem value="commissions">Comisiones</SelectItem>
                <SelectItem value="notifications">Notificaciones</SelectItem>
                <SelectItem value="ui">Interfaz</SelectItem>
                <SelectItem value="feature">Nueva Funcionalidad</SelectItem>
                <SelectItem value="bug">Reportar Problema</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggestion">Tu Sugerencia</Label>
            <Textarea
              id="suggestion"
              value={newSuggestion}
              onChange={(e) => setNewSuggestion(e.target.value)}
              placeholder="Describe tu idea o sugerencia de forma clara y concisa..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">{newSuggestion.length}/500 caracteres</p>
          </div>

          <Button onClick={handleSubmit} className="w-full gap-2">
            <Send className="h-4 w-4" />
            Enviar Sugerencia
          </Button>
        </div>
      </Card>

      {/* Suggestions History */}
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Historial de Sugerencias</h3>

        {profile.suggestions && profile.suggestions.length > 0 ? (
          <div className="space-y-3">
            {profile.suggestions
              .slice()
              .reverse()
              .map((suggestion) => (
                <Card key={suggestion.id} className="p-4 border-border/40">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(suggestion.status || "pending")}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {suggestion.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(suggestion.createdAt).toLocaleDateString("es-CO", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <p className="text-sm">{suggestion.text}</p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          suggestion.status === "implemented"
                            ? "default"
                            : suggestion.status === "reviewed"
                              ? "secondary"
                              : "outline"
                        }
                        className="shrink-0"
                      >
                        {getStatusLabel(suggestion.status || "pending")}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        ) : (
          <Card className="p-4 border-border/40 border-dashed">
            <div className="text-center space-y-2">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm text-muted-foreground">Aún no has enviado sugerencias</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
