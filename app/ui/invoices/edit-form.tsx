'use client';

import { CustomerField, InvoiceForm, State } from '@/app/lib/actions';
import { CheckIcon, ClockIcon, CurrencyDollarIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/app/ui/button';

import { useActionState } from 'react';

export default function EditInvoiceForm({ invoice, customers }: { invoice: InvoiceForm, customers: CustomerField[] }) {
  const initialState: State = { message: null, errors: {} };
  const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);
  const [state, formAction] = useActionState(updateInvoiceWithId, initialState);

  return (
    <form action={formAction}>
      {/* Customer */}
      <div className="mb-4">
        <label htmlFor="customer" className="mb-2 block text-sm font-medium">Choose customer</label>
        <div className="relative">
          <select id="customer" name="customerId" defaultValue={invoice.customer_id} className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm">
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <UserCircleIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"/>
        </div>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <label htmlFor="amount" className="mb-2 block text-sm font-medium">Amount</label>
        <div className="relative">
          <input id="amount" name="amount" type="number" step="0.01" defaultValue={invoice.amount} className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm"/>
          <CurrencyDollarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"/>
        </div>
      </div>

      {/* Status */}
      <fieldset className="mb-4">
        <legend className="text-sm font-medium mb-2">Invoice Status</legend>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="status" value="pending" defaultChecked={invoice.status === 'pending'} className="h-4 w-4"/>
            Pending <ClockIcon className="h-4 w-4"/>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="status" value="paid" defaultChecked={invoice.status === 'paid'} className="h-4 w-4"/>
            Paid <CheckIcon className="h-4 w-4"/>
          </label>
        </div>
      </fieldset>

      <div className="flex justify-end gap-4">
        <Link href="/dashboard/invoices" className="px-4 py-2 bg-gray-200 rounded">Cancel</Link>
        <Button type="submit">Edit Invoice</Button>
      </div>
    </form>
  );
}
