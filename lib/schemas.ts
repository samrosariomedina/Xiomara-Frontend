import {z} from 'zod';

export const loginSchema = z.object({
	email: z.string().min(1, 'Email is required').email('Invalid email'),
	password: z.string().min(8, 'Password must be at least 8 characters')
});

export const signupSchema = z.object({
	email: z.string().min(1, 'Email is required').email('Invalid email'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
	repeatPassword: z.string().min(1, 'Please confirm your password'),
	name: z.string().optional()
}).refine((data) => data.password === data.repeatPassword, {
	message: "Passwords don't match",
	path: ["repeatPassword"],
});

export const forgotPasswordSchema = z.object({
	email: z.string().min(1, 'Email is required').email('Invalid email')
});

export const resetPasswordSchema = z.object({
	password: z.string()
		.min(8, 'Password must be at least 8 characters')
		.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
	confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords don't match",
	path: ["confirmPassword"],
});

// Client Schema - combines all form data
export const clientSchema = z.object({
	clientName: z.string().min(1, 'Client name is required'),
	industry: z.string().min(1, 'Industry is required'),
	description: z.string().optional(),
	logoFile: z.instanceof(File).optional().nullable(), // File object for logo upload
	contactName: z.string().min(1, 'Contact name is required'),
	whatsapp: z.string()
		.min(1, 'WhatsApp number is required')
		.regex(/^[0-9+\s()-]+$/, 'WhatsApp number can only contain digits and +()-'),
	position: z.string().min(1, 'Position is required'),
	email: z.string().min(1, 'Email is required').email('Invalid email'),
	corresponsalClientName: z.string().optional(),
	corresponsalWhatsapp: z.string()
		.optional()
		.refine(val => !val || /^[0-9+\s()-]+$/.test(val), {
			message: 'WhatsApp number can only contain digits and +()-',
		}),
	corresponsalClientName2: z.string().optional(),
	accountType: z.enum(['premium', 'standard', 'basic']).optional(),
	invitationMethods: z.object({
		whatsapp: z.boolean().default(false),
		email: z.boolean().default(false),
		copyLink: z.boolean().default(false)
	}).optional()
});
// Utility function for form validation
export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      errors[path] = issue.message;
    });
    return { success: false, errors };
  }
  return { success: true, data: result.data };
};

// General Information Form Schema
export const generalInformationSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  industry: z.enum(['tecnologia', 'salud', 'educacion', 'finanzas', 'retail', 'manufactura'], {
    message: 'Please select a valid industry'
  }),
  description: z.string().optional(),
  contactName: z.string().min(1, 'Contact name is required'),
  whatsapp: z.string()
    .min(1, 'WhatsApp number is required')
    .regex(/^[0-9+\s()-]+$/, 'WhatsApp number can only contain digits and +()-'),
  position: z.enum(['ceo', 'cto', 'marketing', 'ventas', 'gerente', 'coordinador'], {
    message: 'Please select a valid position'
  }),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  logoFile: z.instanceof(File).optional().nullable(), // For file upload
});

// Individual correspondent schema
const correspondentSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  whatsapp: z.string()
    .min(1, 'WhatsApp number is required')
    .regex(/^[0-9+\s()-]+$/, 'WhatsApp number can only contain digits and +()-'),
  accountType: z.enum(['premium', 'standard', 'basic']),
  invitationMethods: z.object({
    whatsapp: z.boolean(),
    email: z.boolean(),
    copyLink: z.boolean()
  }).optional()
});

// Connect Correspondents Form Schema
export const connectCorrespondentsSchema = z.object({
  correspondents: z.array(correspondentSchema).min(1, 'At least one correspondent is required')
});

// Brand Guides Form Schema (currently empty)
export const brandGuidesSchema = z.object({});

// Corresponsables Form Schema
export const corresponsablesSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  whatsapp: z.string()
    .min(1, 'WhatsApp number is required')
    .regex(/^[0-9+\s()-]+$/, 'WhatsApp number can only contain digits and +()-'),
  other: z.string().optional(),
  accountType: z.enum(['admin', 'user', 'guest'], {
    message: 'Please select a valid account type',
  }),
  invitationMethods: z.object({
    whatsapp: z.boolean(),
    email: z.boolean(),
    copyLink: z.boolean(),
  }).refine(
    data => data.whatsapp || data.email || data.copyLink,
    {
      message: 'At least one invitation method must be selected',
      path: ['invitationMethods'],
    }
  ),
});

// Fuentes Generales Form Schema
export const fuentesGeneralesSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  file: z.instanceof(File).optional().nullable(),
  url: z.string()
    .optional()
    .refine(
      (val) => !val || z.string().url().safeParse(val).success,
      {
        message: 'Please enter a valid URL',
      }
    ),
  text: z.string().optional(),
}).refine(
  (data) => data.file || data.url || data.text,
  {
    message: 'At least one source (file, URL, or text) must be provided',
    path: ['general'],
  }
);

// Knowledge Base Form Schema
export const knowledgeBaseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  accountType: z.enum(['kb', 'article'], {
    message: 'Please select a valid account type',
  }),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  file: z.instanceof(File).optional().nullable(),
  url: z.string()
    .optional()
    .refine(
      (val) => !val || z.string().url().safeParse(val).success,
      {
        message: 'Please enter a valid URL',
      }
    ),
  text: z.string().optional(),
}).refine(
  (data) => data.file || data.url || data.text,
  {
    message: 'At least one source (file, URL, or text) must be provided',
    path: ['general'],
  }
);

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ClientInput = z.infer<typeof clientSchema>;

export type GeneralInformationInput = z.infer<typeof generalInformationSchema>;
export type ConnectCorrespondentsInput = z.infer<typeof connectCorrespondentsSchema>;
export type CorrespondentInput = z.infer<typeof correspondentSchema>;
export type BrandGuidesInput = z.infer<typeof brandGuidesSchema>;
export type CorresponsablesInput = z.infer<typeof corresponsablesSchema>;
export type FuentesGeneralesInput = z.infer<typeof fuentesGeneralesSchema>;
export type KnowledgeBaseInput = z.infer<typeof knowledgeBaseSchema>;

// Backend response types
export interface ClientResponse {
  _id: string;
  title: string | null;
  parent: string | null;
  items: Record<string, string[]>;
  metadata: {
    type: string;
    industry: string;
    description?: string;
    contactName: string;
    whatsapp: string;
    position: string;
    email: string;
  } | null;
  timestamp: string;
}

export interface ListenerResponse {
  _id: string;
  type: string;
  title: string | null;
  origin: string;
  reference: string | null;
  enabled: boolean;
  approved: boolean;
  timestamp: string;
}

export interface ClientWithCampaigns {
  id: string;
  name: string;
  contact: string;
  email: string;
  createdDate: string;
  campaigns: number;
  avatar: string;
  campaignDetails: Array<{
    id: string;
    name: string;
    createdDate: string;
    connectedSources: {
      whatsapp: number;
      email: number;
      other: number;
    };
    status: string;
  }>;
}

// CSV upload schema
export const csvUploadSchema = z.object({
  csvFile: z.instanceof(File).refine(
    (file) => file.type === 'text/csv' || file.name.endsWith('.csv'),
    'File must be a CSV file'
  ),
  enabled: z.boolean().default(true)
});

export type CsvUploadInput = z.infer<typeof csvUploadSchema>;
