import svg from '@poppanator/sveltekit-svg';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';

export default defineConfig({
	envPrefix: 'PUBLIC_',
	plugins: [
		tailwindcss(),
		sveltekit(),
		svg({
			includePaths: ['./src/lib/icons/', './src/assets/icons/'],
			svgoOptions: {
				multipass: true,
				plugins: [
					{ name: 'preset-default' },
					{ name: 'removeAttrs', params: { attrs: '(fill|stroke)' } }
				]
			}
		}),

		devtoolsJson()
	],
	server: { host: true },
	define: { __BUILD_DATE__: JSON.stringify(new Date()) }
});
