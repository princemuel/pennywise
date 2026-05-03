import svg from '@poppanator/sveltekit-svg';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import devtools from 'vite-plugin-devtools-json';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		svg({
			includePaths: ['src/assets/media/icons/'],
			svgoOptions: { multipass: true, plugins: [{ name: 'preset-default' }] }
		}),
		devtools()
	]
});
