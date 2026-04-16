import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...compat.extends("next/core-web-vitals"),
    {
        ignores: [".next/**", "dist/**", "node_modules/**"],
    },
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
            "react-hooks/set-state-in-effect": "off",
            "react-hooks/purity": "off",
            "prefer-const": "warn",
        },
    }
);
