import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	envPrefix: 'PUBLIC_',
	plugins: [tailwindcss(), reactRouter(), tsconfigPaths(), devtoolsJson()],
	server: { host: true },
	define: { __BUILD_DATE__: JSON.stringify(new Date()) }
});
