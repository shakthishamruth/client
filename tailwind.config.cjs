module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  /* ensure needed color utilities are generated; add a safelist to force classes used via @apply */
  safelist: [
    'border-border',
    'bg-background',
    'text-foreground',
    'bg-primary',
    'text-primary-foreground',
    'border-input',
  ],
  theme: {
    extend: {
      colors: {
        // make classes like `border-border`, `bg-background`, etc. available
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};
