'use server';

import { signIn } from 'next-auth/react';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';

/* ------------------ DATABASE ------------------ */
const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

/* ------------------ AUTH ------------------ */
export async function authenticate(prevState: string | undefined, formData: FormData) {
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();

  const result = await signIn('credentials', { email, password, redirect: false });
  if (!result?.ok) return 'Invalid credentials.';
  return null;
}

/* ------------------ SCHEMA ------------------ */
export const FormSchema = z.object({
  id: z.string().optional(),
  customerId: z.string({ invalid_type_error: 'Customer is required' }),
  amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.00' }),
  status: z.enum(['pending', 'paid'], { invalid_type_error: 'Please select a valid status.' }),
  date: z.string(),
});

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

/* ------------------ CREATE INVOICE ------------------ */
export async function createInvoice(prevState: State, formData: FormData) {
  const parsed = FormSchema.safeParse({
    customerId: formData.get('customerId')?.toString(),
    amount: Number(formData.get('amount')),
    status: formData.get('status')?.toString(),
    date: formData.get('date')?.toString(),
    id: formData.get('id')?.toString(),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { customerId, amount, status, date } = parsed.data;
  const amountInCents = amount * 100;

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Create Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

/* ------------------ UPDATE INVOICE ------------------ */
export async function updateInvoice(id: string, prevState: State, formData: FormData) {
  const parsed = FormSchema.safeParse({
    customerId: formData.get('customerId')?.toString(),
    amount: Number(formData.get('amount')),
    status: formData.get('status')?.toString(),
    date: formData.get('date')?.toString(),
    id,
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = parsed.data;
  const amountInCents = amount * 100;

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
