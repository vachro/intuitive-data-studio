import studio from "@sanity/eslint-config-studio";

export default [
  ...studio,

  // Node-only scripts (migrations, one-offs, etc.)
  {
    files: ["scripts/**/*.{js,cjs,mjs}"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
      },
    },
  },
];
