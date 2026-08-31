import { z } from 'zod'

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, { error: 'Emri duhet të jetë të paktën 2 karaktere.' })
    .max(80, { error: 'Emri është shumë i gjatë.' })
    .trim(),
  email: z.email({ error: 'Vendos një email të vlefshëm.' }).trim(),
  password: z
    .string()
    .min(8, { error: 'Fjalëkalimi duhet të jetë të paktën 8 karaktere.' }),
})

export const loginSchema = z.object({
  email: z.email({ error: 'Vendos një email të vlefshëm.' }).trim(),
  password: z.string().min(1, { error: 'Fjalëkalimi është i detyrueshëm.' }),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
