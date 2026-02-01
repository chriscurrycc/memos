import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
}

const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7", "#dfe6e9", "#74b9ff", "#fd79a8"];

const ConfettiAnimation = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            left: `${piece.x}%`,
            top: -20,
            backgroundColor: piece.color,
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: window.innerHeight + 20,
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2.5 + Math.random(),
            delay: piece.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiAnimation;
