import { z } from "zod";

export const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

export function normalizeUsername(username) {
  return username.normalize("NFKC").trim().toLowerCase();
}

const usernameSchema = z
  .string()
  .trim()
  .min(4, "Username must be at least 4 characters.")
  .max(30, "Username must be at most 30 characters.")
  .regex(
    USERNAME_REGEX,
    "Username may only contain letters, numbers, underscores, and hyphens.",
  );

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password must be at most 128 characters.");

const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Display name is required.")
  .max(70, "Display name must be at most 70 characters.");

const bioSchema = z
  .string()
  .trim()
  .max(140, "Bio must be at most 140 characters.")
  .optional()
  .transform((value) => (value === undefined || value === "" ? null : value));

export const registerSchema = z.object({
  username: usernameSchema,
  display_name: displayNameSchema,
  password: passwordSchema,
  bio: bioSchema,
});

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

export const updateMeSchema = z
  .object({
    username: usernameSchema.optional(),
    display_name: displayNameSchema.optional(),
    bio: z.string().trim().max(140).optional(),
    password: passwordSchema.optional(),
    current_password: z.string().min(1).max(128).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.password !== undefined && !data.current_password) {
      ctx.addIssue({
        code: "custom",
        path: ["current_password"],
        message: "Current password is required to set a new password.",
      });
    }
  });
