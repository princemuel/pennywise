import adapter from '@sveltejs/adapter-node';
import { execSync } from 'node:child_process';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		version: { name: execSync('git rev-parse HEAD').toString('utf8').trim() },
		alias: { '@/*': './src/*' }
	}
};
export default config;
