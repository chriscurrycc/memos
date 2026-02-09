import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
  rotation: number;
}

const palette = ["#f59e0b", "#fb923c", "#f87171", "#e879f9", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa"];

const ConfettiAnimation = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const newPieces: ConfettiPiece[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: palette[Math.floor(Math.random() * palette.length)],
      delay: Math.random() * 0.6,
      size: 4 + Math.random() * 6,
      rotation: Math.random() * 360,
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute rounded-sm"
          style={{
            left: `${piece.x}%`,
            top: -20,
            width: piece.size,
            height: piece.size * (0.6 + Math.random() * 0.8),
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
          initial={{ y: -20, rotate: piece.rotation, opacity: 1 }}
          animate={{
            y: window.innerHeight + 20,
            rotate: piece.rotation + 360 * (Math.random() > 0.5 ? 1 : -1),
            opacity: [1, 1, 0.8, 0],
            x: [0, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 120],
          }}
          transition={{
            duration: 2.8 + Math.random() * 0.8,
            delay: piece.delay,
            ease: [0.22, 0.68, 0.31, 1],
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiAnimation;
