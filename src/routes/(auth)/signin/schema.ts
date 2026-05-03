import { z } from 'zod';

export const schema = z.object({
	email: z.email('Please enter a valid email.').toLowerCase().trim(),
	password: z.string().min(8, 'Password must be at least 8 characters').max(32).trim(),
	token: z.literal('').optional()
});
