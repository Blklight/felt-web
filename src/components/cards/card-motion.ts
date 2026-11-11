export const FLIP_IN = {
  initial: { rotateY: 80, opacity: 0, y: -10 },
  animate: { rotateY: 0, opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" as const },
};

export const DEAL_IN = {
  initial: { opacity: 0, y: -18, scale: 0.92 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.3, ease: "easeOut" as const },
};

export const withDelay = <T extends { transition: object }>(
  motion: T,
  delay: number,
): T => ({
  ...motion,
  transition: { ...motion.transition, delay },
});
