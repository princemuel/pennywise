import z from 'zod';

export const PotChangeset = z.object({
	name: z.string().min(1, '30 characters left').max(30).trim(),
	target: z.float32().multipleOf(0.01).default(0),
	total: z.float32().multipleOf(0.01).default(0),
	theme: z.hex().length(6).toLowerCase().trim(),
	token: z.literal('').optional()
});
