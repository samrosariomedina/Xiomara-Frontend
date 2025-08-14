import {z} from 'zod';

// General Information Form Schema
export const generalInformationSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  industry: z.string().min(1, 'Industry is required'),
  description: z.string().optional(),
  contactName: z.string().min(1, 'Contact name is required'),
  whatsapp: z.string().min(1, 'WhatsApp number is required'),
  position: z.string().min(1, 'Position is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
});

// Connect Correspondents Form Schema
export const connectCorrespondentsSchema = z.object({
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

// Brand Guides Form Schema (currently empty)
export const brandGuidesSchema = z.object({});

// Combined schema for the entire client form
export const clientSchema = generalInformationSchema.merge(connectCorrespondentsSchema).merge(brandGuidesSchema);

export type GeneralInformationInput = z.infer<typeof generalInformationSchema>;
export type ConnectCorrespondentsInput = z.infer<typeof connectCorrespondentsSchema>;
export type BrandGuidesInput = z.infer<typeof brandGuidesSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
