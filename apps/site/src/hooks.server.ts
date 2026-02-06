import type { Handle } from "@sveltejs/kit";

const handler: Handle = async ({ event, resolve }) => {
  return resolve(event);
};

export const handle: Handle = handler;
