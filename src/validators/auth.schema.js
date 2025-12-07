import { z } from 'zod';

// 🧍‍♂️ Signup Schema
const signupSchema = z
  .object({
    name: z.preprocess(
      val => (val === undefined ? '' : val),
      z
        .string({ required_error: 'Name is required' })
        .trim()
        .nonempty('Name cannot be empty')
        .min(2, 'Name must be at least 2 characters long')
        .max(50, 'Name too long')
    ),

    email: z.preprocess(
      val => (val === undefined ? '' : val),
      z
        .string({ required_error: 'Email is required' })
        .trim()
        .nonempty('Email cannot be empty')
        .email('Invalid email format')
    ),

    password: z.preprocess(
      val => (val === undefined ? '' : val),
      z
        .string({ required_error: 'Password is required' })
        .trim()
        .nonempty('Password cannot be empty')
        .min(6, 'Password must be at least 6 characters long')
    ),

    phone: z
      .string()
      .regex(/^[0-9]{11}$/, 'Phone number must be 11 digits')
      .optional()
      .or(z.literal('').optional()),

    address: z.string().optional()
  })
  .strict({ message: 'Unknown field(s) provided' });

// 🔐 Login Schema
const loginSchema = z
  .object({
    email: z.preprocess(
      val => (val === undefined ? '' : val),
      z
        .string({ required_error: 'Email is required' })
        .trim()
        .nonempty('Email cannot be empty')
        .email('Invalid email format')
    ),

    password: z.preprocess(
      val => (val === undefined ? '' : val),
      z
        .string({ required_error: 'Password is required' })
        .trim()
        .nonempty('Password cannot be empty')
    )
  })
  .strict({ message: 'Unknown field(s) provided' });

// 🧾 Update Profile Schema
const updateUserSchema = z
  .object({
    name: z
      .preprocess(
        val => (val === undefined ? '' : val),
        z.string().min(2, 'Name must be at least 2 characters long')
      )
      .optional(),

    phone: z
      .preprocess(
        val => (val === undefined ? '' : val),
        z.string().regex(/^[0-9]{11}$/, 'Phone number must be 11 digits')
      )
      .optional(),

    address: z
      .preprocess(
        val => (val === undefined ? '' : val),
        z.string().nonempty('Address cannot be empty')
      )
      .optional()
  })
  .strict({ message: 'Unknown field(s) provided' });

const updatePasswordSchema = z
  .object({
    oldPassword: z.preprocess(
      val => (val === undefined ? '' : val),
      z
        .string({ required_error: 'Password is required' })
        .trim()
        .nonempty('Password cannot be empty')
    ),
    newPassword: z.preprocess(
      val => (val === undefined ? '' : val),
      z
        .string({ required_error: 'Password is required' })
        .trim()
        .nonempty('Password cannot be empty')
        .min(6, 'Password must be at least 6 characters long')
    )
  })
  .strict({ message: 'Unknown field(s) provided' });

const resetPassword = z
  .object({
    password: z.preprocess(
      val => (val === undefined ? '' : val),
      z
        .string({ required_error: 'Password is required' })
        .trim()
        .nonempty('Password cannot be empty')
        .min(6, 'Password must be at least 6 characters long')
    )
  })
  .strict({ message: 'Unknown field(s) provided' });

export {
  signupSchema,
  loginSchema,
  updateUserSchema,
  updatePasswordSchema,
  resetPassword
};
