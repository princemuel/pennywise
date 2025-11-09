import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { execSync } from 'node:child_process';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		version: { name: execSync('git rev-parse HEAD').toString('utf8').trim() },
		alias: { '@/*': './src/*' }
	}
};

export default config;
