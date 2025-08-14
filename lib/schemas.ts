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

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
