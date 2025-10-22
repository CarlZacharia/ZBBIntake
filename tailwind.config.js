/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: { extend: {} },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark", {
      zb: {
        primary: "#3b82f6",
        secondary: "#10b981",
        accent: "#fb923c",
        neutral: "#2a323c",
        "base-100": "#f9fafb",
        info: "#22d3ee",
        success: "#34d399",
        warning: "#fbbf24",
        error: "#ef4444",
      }
    }]
  }
};

