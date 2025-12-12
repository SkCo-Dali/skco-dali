import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";

export const MarketDaliLoadingAnimation: React.FC<{ message?: string }> = ({ 
  message = "Cargando oportunidades..." 
}) => {
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    fetch("/animations/market_oportunidades.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Error loading animation:", err));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      {animationData ? (
        <Lottie
          animationData={animationData}
          loop
          autoplay
          style={{ width: 180, height: 140 }}
        />
      ) : (
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      )}
      <p className="text-muted-foreground mt-4 text-sm">{message}</p>
    </div>
  );
};
