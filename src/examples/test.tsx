import React, { useRef } from 'react';
import { Dialog, DialogHeader, DialogFooter, DialogBody } from '../lib';
import { useFormState } from '../lib/utils/usePartialState';
// import { firstFocusable } from '../../utils/firstFocusable';

interface FormState {
  first_name: string;
  last_name: string;
}

export const EditDialog: React.FC<{data?: FormState}> = (props) => {
  const dialogEl = useRef<HTMLDialogElement | null>(null);
  const [form, setForm] = useFormState<FormState>(props.data ?? {
    first_name: '',
    last_name: '',
  });

  return <Dialog doNotUseHTML5Dialog dialogRef={dialogEl} onSubmit={async (close) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (form.first_name === 'fail')
      throw new Error('test');
    close(form);
  }}>
    <DialogHeader>
      Edit User
    </DialogHeader>
    <DialogBody>
      <div>
        <label>First Name:</label>
        <input value={form.first_name ?? ''} onChange={(e) => setForm({ first_name: e.target.value })} />
      </div>
      <div>
        <label>Last Name:</label>
        <input value={form.last_name ?? ''} onChange={(e) => setForm({ last_name: e.target.value })} />
      </div>
    </DialogBody>
    <DialogFooter>
      <button type='button' onClick={() => {
        dialogEl.current?.close();
      }}>Close</button>
      <button type='submit'>Submit</button>
    </DialogFooter>
  </Dialog>;
}