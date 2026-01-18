import { createCookieSessionStorage } from 'react-router';

const isProduction = process.env.NODE_ENV === 'production';

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: '__remix-themes__',
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secrets: ['s3cr3t'],
		...(isProduction ? { domain: `https://${process.env.VERCEL_URL}`, secure: true } : {})
	}
});
