// ── Brand Palette ────────────────────────────────────────
export const brand = {
  primary: "#174BD4",
  cta: "#85DABE",
  ctaLight: "#A8E8D0",
  ctaDark: "#5FC9A3",
} as const;

// ── Neutral Palette (Dark Mode First) ────────────────────
export const neutral = {
  bg: "#030712",
  surface: "#0A0F1E",
  surfaceLight: "#111827",
  border: "rgba(255, 255, 255, 0.06)",
  borderHover: "rgba(255, 255, 255, 0.12)",
  borderCard: "rgba(255, 255, 255, 0.08)",
} as const;

// ── Text Palette ─────────────────────────────────────────
export const text = {
  primary: "#F8FAFC",
  secondary: "#94A3B8",
  muted: "#64748B",
  faint: "#475569",
} as const;

// ── Semantic Colors ──────────────────────────────────────
export const semantic = {
  success: "#34D399",
  warning: "#FBBF24",
  error: "#F87171",
  info: "#60A5FA",
} as const;

// ── Gradients ────────────────────────────────────────────
export const gradients = {
  heroText: `linear-gradient(135deg, ${text.primary} 0%, ${brand.cta} 50%, ${brand.primary} 100%)`,
  ctaGlow: `0 0 20px rgba(133, 218, 190, 0.35), 0 0 60px rgba(133, 218, 190, 0.1)`,
  primaryGlow: `0 0 15px rgba(23, 75, 212, 0.3), 0 0 45px rgba(23, 75, 212, 0.08)`,
  heroRadial: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(23, 75, 212, 0.15) 0%, transparent 70%)`,
  navBg: "rgba(3, 7, 18, 0.80)",
} as const;

// ── Shadows ──────────────────────────────────────────────
export const shadows = {
  card: "0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)",
  cardHover: "0 4px 14px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)",
  elevated: "0 8px 30px rgba(0, 0, 0, 0.5)",
} as const;

// ── Typography ───────────────────────────────────────────
export const fonts = {
  sans: "'Inter', system-ui, -apple-system, sans-serif",
  heading: "'Space Grotesk', 'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
} as const;

// ── Animation Durations ──────────────────────────────────
export const motion = {
  fast: "150ms",
  normal: "250ms",
  slow: "400ms",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  ease: "cubic-bezier(0.25, 0.1, 0.25, 1)",
} as const;

// ── Full theme export ────────────────────────────────────
const theme = {
  brand,
  neutral,
  text,
  semantic,
  gradients,
  shadows,
  fonts,
  motion,
} as const;
export default theme;