import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import Lottie from 'lottie-react';

interface StepSingleWishProps {
  initialValue: string;
  preferredName: string;
  isSubmitting?: boolean;
  onComplete: (wish: string) => void;
  onBack: () => void;
}

export function StepSingleWish({
  initialValue,
  preferredName,
  isSubmitting = false,
  onComplete,
  onBack,
}: StepSingleWishProps) {
  const [wish, setWish] = useState(initialValue);
  const maxLength = 240;
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch('/animations/loading_magic.json')
      .then(res => res.json())
      .then(data => setAnimationData(data));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          {animationData ? (
            <div className="w-48 h-48">
              <Lottie animationData={animationData} loop={true} />
            </div>
          ) : (
            <div className="p-4 rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          )}
        </div>
        <h2 className="text-3xl font-bold">Si pudieras pedir un único deseo para Dali, ¿cuál sería?</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Algo que te ayude a vender mejor o ahorrar tiempo. Solo uno, por favor.
        </p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="wish">Tu deseo (opcional)</Label>
          <Textarea
            id="wish"
            placeholder="Quisiera que ..."
            value={wish}
            onChange={(e) => {
              if (e.target.value.length <= maxLength) {
                setWish(e.target.value);
              }
            }}
            rows={4}
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground text-right">
            {wish.length}/{maxLength} caracteres
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline" className="flex-1" disabled={isSubmitting}>
            Atrás
          </Button>
          <Button onClick={() => onComplete(wish)} className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Finalizar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
