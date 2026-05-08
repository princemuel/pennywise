import type { Handle } from '@sveltejs/kit';

const handler: Handle = async ({ event, resolve }) => {
	event.locals.timeZone = event.cookies.get('timezone') ?? 'UTC';
	event.locals.locale = event.cookies.get('locale') ?? 'en-US';

	return resolve(event);
};

export const handle: Handle = handler;
