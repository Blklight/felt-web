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

export type Point = { x: number; y: number };

type Motion = {
  initial: object;
  animate: object;
  transition: object;
};

export const fromPoint = <T extends Motion>(motion: T, from?: Point): T =>
  from
    ? {
        ...motion,
        initial: {
          ...motion.initial,
          x: from.x,
          y: from.y,
          rotate: -18,
          scale: 0.7,
        },
        animate: { ...motion.animate, x: 0, rotate: 0, scale: 1 },
        transition: { ...motion.transition, duration: 0.5 },
      }
    : motion;
