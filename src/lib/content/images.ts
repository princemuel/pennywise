/* eslint-disable @typescript-eslint/no-explicit-any */
const imageModules = import.meta.glob(
	'../../assets/media/images/avatars/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp}',
	{ eager: true, import: 'default' }
);

const avatars = Object.fromEntries(
	Object.entries(imageModules).map(([path, mod]) => [filenameFromPath(path), mod as any])
);

export const avatar = (slug: string): string => {
	const key = slug.replace(/\.[^/.]+$/, '');
	const img = avatars[key];
	if (!img && import.meta.env.DEV) console.warn(`Missing avatar: ${slug}`);
	return img ?? '';
};

function filenameFromPath(path: string) {
	return (
		path
			.split('/')
			.pop()
			?.replace(/\.[^/.]+$/, '') ?? ''
	);
}
