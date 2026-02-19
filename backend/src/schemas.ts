import * as z from "zod";

export const accountLoginBody = z.object({
  email: z.email(),
  password: z.string(),
})

export const shapes = z.object({
  shapes: z.array(z.object({
    toString: z.string()
  }).catchall(z.unknown())),
})

export const accountGraphBody = z.object({
  graph: z.object({
    shapes: z.array(z.object({
      toString: z.string()
    }).catchall(z.unknown())),
    name: z.string().optional(),
  }),
  name: z.string().optional(),
});

export const accountGraphNameBody = z.object({
  name: z.string()
})

export const forgotPasswordBody = z.object({
  email: z.email()
})

export const resetPasswordBody = z.object({
  token: z.string(),
  password: z.string()
})

export const changePasswordBody = z.object({
  oldPassword: z.string(),
  password: z.string()
})