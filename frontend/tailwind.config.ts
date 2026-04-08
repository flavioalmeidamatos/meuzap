// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Habilita suporte a classe 'dark' ou 'light' global
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          bg: "var(--bg-default)",
          panel: "var(--panel-header-bg)",
          search: "var(--search-input-bg)",
          searchContainer: "var(--search-container-bg)",
          chatBg: "var(--chat-bg)",
          border: "var(--border-color)",
          hover: "var(--hover-bg)",
          active: "var(--active-bg)",
          green: "var(--primary-teal)",
          greenHover: "var(--primary-teal-hover)",
          icon: "var(--icon-color)",
          textPrimary: "var(--text-primary)",
          textSecondary: "var(--text-secondary)",
          bubbleIn: "var(--incoming-bg)",
          bubbleOut: "var(--outgoing-bg)",
          systemBubble: "var(--system-msg-bg)",
        }
      },
      backgroundImage: {
        'chat-pattern': "url('/pattern.png')",
        'chat-pattern-light': "url('/pattern-light.png')"
      },
      boxShadow: {
        'wa-bubble': '0 1px 0.5px rgba(11,20,26,.13)', // Sombra super sutil característica do WP
      }
    },
  },
  plugins: [],
};
export default config;
