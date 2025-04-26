import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "waveform-strong": {
          "0%": { d: "path('M0,15 Q5,5 10,15 T20,15 T30,15 T40,15 T50,15 T60,15 T70,15 T80,15 T90,15 T100,15 T110,15 T120,15 T130,15 T140,15 T150,15 T160,15 T170,15 T180,15 T190,15 T200,15 T210,15 T220,15 T230,15 T240,15 T250,15 T260,15 T270,15 T280,15 T290,15 T300,15')" },
          "25%": { d: "path('M0,15 Q5,10 10,15 T20,20 T30,10 T40,15 T50,5 T60,25 T70,15 T80,10 T90,20 T100,15 T110,25 T120,10 T130,15 T140,5 T150,15 T160,20 T170,15 T180,10 T190,20 T200,5 T210,15 T220,25 T230,15 T240,5 T250,20 T260,15 T270,10 T280,15 T290,25 T300,15')" },
          "50%": { d: "path('M0,15 Q5,5 10,25 T20,10 T30,20 T40,5 T50,25 T60,10 T70,15 T80,20 T90,5 T100,25 T110,10 T120,20 T130,5 T140,25 T150,15 T160,10 T170,20 T180,5 T190,25 T200,15 T210,10 T220,20 T230,5 T240,25 T250,10 T260,20 T270,5 T280,25 T290,10 T300,15')" },
          "75%": { d: "path('M0,15 Q5,20 10,10 T20,15 T30,25 T40,5 T50,20 T60,10 T70,25 T80,15 T90,5 T100,20 T110,10 T120,25 T130,15 T140,5 T150,15 T160,10 T170,25 T180,15 T190,5 T200,20 T210,10 T220,25 T230,5 T240,20 T250,15 T260,10 T270,25 T280,5 T290,20 T300,15')" },
          "100%": { d: "path('M0,15 Q5,5 10,15 T20,15 T30,15 T40,15 T50,15 T60,15 T70,15 T80,15 T90,15 T100,15 T110,15 T120,15 T130,15 T140,15 T150,15 T160,15 T170,15 T180,15 T190,15 T200,15 T210,15 T220,15 T230,15 T240,15 T250,15 T260,15 T270,15 T280,15 T290,15 T300,15')" }
        },
        "waveform-weak": {
          "0%": { d: "path('M0,15 Q5,13 10,15 T20,17 T30,14 T40,15 T50,16 T60,15 T70,14 T80,15 T90,16 T100,15 T110,14 T120,15 T130,17 T140,15 T150,13 T160,15 T170,16 T180,15 T190,14 T200,15 T210,16 T220,15 T230,14 T240,15 T250,17 T260,15 T270,13 T280,15 T290,16 T300,15')" },
          "33%": { d: "path('M0,15 Q5,14 10,16 T20,15 T30,13 T40,15 T50,17 T60,14 T70,15 T80,16 T90,15 T100,13 T110,16 T120,15 T130,14 T140,17 T150,15 T160,13 T170,15 T180,16 T190,15 T200,14 T210,15 T220,17 T230,13 T240,15 T250,16 T260,15 T270,14 T280,15 T290,17 T300,15')" },
          "66%": { d: "path('M0,15 Q5,16 10,14 T20,15 T30,17 T40,13 T50,15 T60,16 T70,14 T80,15 T90,17 T100,15 T110,13 T120,16 T130,15 T140,14 T150,15 T160,17 T170,13 T180,15 T190,16 T200,15 T210,14 T220,17 T230,15 T240,13 T250,15 T260,16 T270,15 T280,14 T290,15 T300,15')" },
          "100%": { d: "path('M0,15 Q5,13 10,15 T20,17 T30,14 T40,15 T50,16 T60,15 T70,14 T80,15 T90,16 T100,15 T110,14 T120,15 T130,17 T140,15 T150,13 T160,15 T170,16 T180,15 T190,14 T200,15 T210,16 T220,15 T230,14 T240,15 T250,17 T260,15 T270,13 T280,15 T290,16 T300,15')" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "waveform-strong": "waveform-strong 3s ease-in-out infinite",
        "waveform-weak": "waveform-weak 5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
