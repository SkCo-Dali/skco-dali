import React from "react";
import Lottie from "lottie-react";
import animationData from "../../../public/animations/market_oportunidades.json";

export const MarketDaliLoadingAnimation: React.FC<{ message?: string }> = ({ 
  message = "Cargando oportunidades..." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Lottie
        animationData={animationData}
        loop
        autoplay
        style={{ width: 180, height: 140 }}
      />
      <p className="text-muted-foreground mt-4 text-sm">{message}</p>
    </div>
  );
};
