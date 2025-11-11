import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { MicrosoftAuth } from "@/components/MicrosoftAuth";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useState } from "react";
import Lottie from "lottie-react";

interface LoginProps {
  onLogin: (user: any) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Efecto parallax suave para el video
  const videoX = useTransform(mouseX, [-300, 300], [-15, 15]);
  const videoY = useTransform(mouseY, [-300, 300], [-15, 15]);
  const smoothVideoX = useSpring(videoX, { stiffness: 50, damping: 20 });
  const smoothVideoY = useSpring(videoY, { stiffness: 50, damping: 20 });

  // Efecto parallax para el card
  const cardX = useTransform(mouseX, [-300, 300], [10, -10]);
  const cardY = useTransform(mouseY, [-300, 300], [10, -10]);
  const smoothCardX = useSpring(cardX, { stiffness: 80, damping: 25 });
  const smoothCardY = useSpring(cardY, { stiffness: 80, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  // Animación simple de personaje usando Lottie (puedes reemplazar con tu propia animación)
  const characterAnimation = {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 60,
    w: 200,
    h: 200,
    nm: "Simple Character",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Circle",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 1, k: [{ t: 0, s: [0], e: [360] }, { t: 60 }] },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "el",
                p: { a: 0, k: [0, 0] },
                s: { a: 0, k: [80, 80] }
              },
              {
                ty: "fl",
                c: { a: 0, k: [0.2, 0.6, 1, 1] },
                o: { a: 0, k: 100 }
              }
            ]
          }
        ],
        ip: 0,
        op: 60,
        st: 0
      }
    ]
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden" 
      style={{ backgroundColor: "#ededed" }}
      onMouseMove={handleMouseMove}
    >
      {/* Personaje animado con Lottie - posición fija */}
      <motion.div
        className="absolute top-8 right-8 w-32 h-32 z-10"
        animate={{
          scale: isHovered ? 1.2 : 1,
          rotate: isHovered ? 10 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Lottie 
          animationData={characterAnimation}
          loop={true}
          style={{ width: "100%", height: "100%" }}
        />
      </motion.div>

      <div className="w-full max-w-2xl relative z-20">
        {/* Logo y header con animación */}
        <motion.div 
          className="text-center mb-4"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Video principal con efecto parallax */}
          <motion.div 
            className="w-full max-w-2xl h-64 mx-auto mb-4 rounded-xl overflow-hidden shadow-lg bg-black"
            style={{ 
              x: smoothVideoX, 
              y: smoothVideoY,
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <video
              src="https://aistudiojarvis0534199251.blob.core.windows.net/skandia-icons/Dali_.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain"
            />
          </motion.div>
        </motion.div>

        {/* Card de login con animación parallax */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ 
            x: smoothCardX, 
            y: smoothCardY,
          }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <Card className="shadow-xl border-0 py-4">
            <CardHeader className="space-y-1 text-center pb-4 pt-0">
              <CardDescription>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h1 className="sk-h2" style={{ color: "#3f3f3f" }}>
                    Dali
                  </h1>
                  <p className="text-gray-600 mt-2">Donde los datos se convierten en oportunidades.</p>
                </motion.div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <motion.div 
                className="flex justify-center space-y-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Autenticación real con Microsoft */}
                <MicrosoftAuth />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer con animación */}
        <motion.div 
          className="text-center text-sm text-gray-500 pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <p>¿Necesitas ayuda? Contacta a tu administrador de sistema</p>
          <p className="mt-2">© 2025 Skandia Colombia. Todos los derechos reservados.</p>
        </motion.div>
      </div>
    </div>
  );
}
