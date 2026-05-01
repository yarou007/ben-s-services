/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        ink: "#0d141b",
        slate: "#475569",
        fog: "#f5f7fb",
        brand: {
          50: "#eef7ff",
          100: "#dbeeff",
          200: "#b6ddff",
          300: "#88c7ff",
          400: "#59abff",
          500: "#2c8fff",
          600: "#1f72e6",
          700: "#1b5ac2",
          800: "#1b4b9b",
          900: "#1a3f7a"
        },
        accent: {
          50: "#fff4ed",
          100: "#ffe6d5",
          200: "#ffc9a8",
          300: "#ffa76f",
          400: "#ff8a45",
          500: "#ff6b1a",
          600: "#e55010",
          700: "#bf3c0d",
          800: "#98320f",
          900: "#7a2c10"
        }
      },
      fontFamily: {
        sans: ["Manrope", "Segoe UI", "sans-serif"],
        serif: ["Fraunces", "Georgia", "serif"]
      },
      boxShadow: {
        soft: "0 20px 50px rgba(15, 23, 42, 0.12)",
        card: "0 12px 32px rgba(15, 23, 42, 0.08)",
        glow: "0 0 0 1px rgba(44, 143, 255, 0.15), 0 20px 60px rgba(44, 143, 255, 0.2)"
      },
      borderRadius: {
        xl: "1rem",
        '2xl': "1.5rem",
        '3xl': "2rem"
      }
    }
  },
  plugins: []
};
