import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";
export default defineConfig({
    plugins: [
        react(),
        nodePolyfills({
            exclude: [],
            globals: {
                Buffer: true,
                global: true,
                process: true,
            },
            protocolImports: true,
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: "::", // optional, allows LAN access
        port: 5173, // use 5173 unless you specifically want 8080
        allowedHosts: ["utah-kits-adaptor-lee.trycloudflare.com", "localhost"],
    },
});
