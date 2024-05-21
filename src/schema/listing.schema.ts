import { number, object, string, TypeOf } from 'zod';

export const createLisitngSchema = object({
  body: object({
    userId: string().optional(),
    name: string({ required_error: 'Name is required' }),
    email: string({ required_error: 'Email is required' }).email(
      'Invalid email'
    ),
    phoneno: string().optional(),
    country: string(),
    city: string(),
    branch: string(),
    place_id: string({ required_error: 'place_id is required' }),
    type: number().refine(val => val === 1 || val === 2, {
      message: 'Type must be either 1 or 2',
    }),
  }),
});
export const updateLisitngSchema = object({
  body: object({
    _id: string({ required_error: 'id is required' }),
    name: string({ required_error: 'Name is required' }).optional(),
    email: string({ required_error: 'Email is required' })
      .email('Invalid email')
      .optional(),
    country: string().optional(),
    phoneno: string().optional(),
    city: string().optional(),
    branch: string().optional(),
    place_id: string({ required_error: 'place_id is required' }).optional(),
  }),
});

export type CreateLisitngInput = TypeOf<typeof createLisitngSchema>['body'];
export type UpdateLisitngInput = TypeOf<typeof updateLisitngSchema>['body'];
