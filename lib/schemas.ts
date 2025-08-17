import {z} from 'zod';

export const loginSchema = z.object({
	email: z.string().min(1, 'Email is required').email('Invalid email'),
	password: z.string().min(8, 'Password must be at least 8 characters')
});

export const signupSchema = z.object({
	email: z.string().min(1, 'Email is required').email('Invalid email'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
	repeatPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.repeatPassword, {
	message: "Passwords don't match",
	path: ["repeatPassword"],
});

export const clientSchema = z.object({
	clientName: z.string().min(1, 'Client name is required'),
	industry: z.string().min(1, 'Industry is required'),
	description: z.string().optional(),
	logoFile: z.any().optional(), // File object for logo upload
	contactName: z.string().min(1, 'Contact name is required'),
	whatsapp: z.string().min(1, 'WhatsApp number is required'),
	position: z.string().min(1, 'Position is required'),
	email: z.string().min(1, 'Email is required').email('Invalid email'),
	corresponsalClientName: z.string().optional(),
	corresponsalWhatsapp: z.string().optional(),
	corresponsalClientName2: z.string().optional(),
	accountType: z.string().optional(),
	invitationMethods: z.object({
		whatsapp: z.boolean().optional(),
		email: z.boolean().optional(),
		copyLink: z.boolean().optional()
	}).optional()
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
