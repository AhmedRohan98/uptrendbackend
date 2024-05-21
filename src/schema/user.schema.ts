import { object, string, TypeOf } from "zod";

export const createUserSchema = object({
  body: object({
    name: string({ required_error: "Name is required" }),
    email: string({ required_error: "Email is required" }).email(
      "Invalid email"
    ),
    password: string({ required_error: "Password is required" })
      .min(8, "Password must be more than 8 characters")
      .max(32, "Password must be less than 32 characters"),
    phoneno: string({ required_error: "Phone Number is required" }),
    // firstname: string({ required_error: 'Firstname is required' }),
    // lastname: string({ required_error: 'Lastname is required' }),
    // address: string({}),
    // role: string({})
  }),
  // .refine(data => data.password === data.passwordConfirm, {
  //   path: ['passwordConfirm'],
  //   message: 'Passwords do not match',
  // }),
});

export const loginUserSchema = object({
  body: object({
    email: string({ required_error: "Email is required" }).email(
      "Invalid email or password"
    ),
    password: string({ required_error: "Password is required" }).min(
      8,
      "Invalid email or password"
    ),
  }),
});

export const updateUserSchema = object({
  body: object({
    _id: string({ required_error: "id is required" }).optional(),
    name: string({ required_error: "Name is required" }).optional(),
    email: string({ required_error: "Email is required" })
      .email("Invalid email")
      .optional(),
    gender: string().optional(),
    profilepic: string().optional(),
    phoneno: string().optional(),
    address: string().optional(),
    colourScheme: string().optional(),
  }),
});

export const sendMessageSchema = object({
  body: object({
    to: string({ required_error: "Number is required" }),
    message: string({ required_error: "message is required" }),
  }),
});

export type CreateUserInput = TypeOf<typeof createUserSchema>["body"];
export type LoginUserInput = TypeOf<typeof loginUserSchema>["body"];
export type updateUserInput = TypeOf<typeof updateUserSchema>["body"];
export type SendMessageInput = TypeOf<typeof sendMessageSchema>["body"];
