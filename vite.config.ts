import { defineConfig } from 'vite';
// base './' so the build runs from any folder or subpath (web host, Tauri, file server)
export default defineConfig({ base: './' });
