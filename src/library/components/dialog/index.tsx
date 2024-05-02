import React, { useState, useCallback, useRef, useEffect, useMemo, useContext, PropsWithChildren } from 'react';
import ReactDOM from 'react-dom';
import { DialogProvider, DialogContext } from './provider';
import { firstFocusable } from '../../utils/firstFocusable';

type DialogElement = HTMLDialogElement | HTMLDivElement;
const modalRoot = (typeof document !== 'undefined')
  ? document.getElementsByTagName('body').item(0)
  : null;

export interface DialogProps {
  onSubmit?: (close: (result?: any) => void) => Promise<void>;
  dialogRef?: React.MutableRefObject<HTMLDialogElement | null>;
  style?: React.CSSProperties;
  className?: string;
  doNotUseHTML5Dialog?: boolean
}

/**
 * Need options:
 * Click-outside to close: boolean
 */
export const Dialog: React.FC<PropsWithChildren<DialogProps>> = function Dialog({ doNotUseHTML5Dialog, className, style, onSubmit, children, dialogRef }) {
  const [submitting, setSubmitting] = useState(false);
  const { close, dialog: dialogEl } = useContext(DialogContext);
  const [_, setRerender] = useState(false);
  
  const dialogClose = useCallback((e: Event) => {
    if (!dialogEl?.current?.returnValue) {
      close();
      return;
    }

    try {
      let val = JSON.parse(dialogEl.current!.returnValue);
      close(val);
    }
    catch {
      close(dialogEl.current?.returnValue);
    }
  }, [ close, dialogEl ]);

  const backdropClick = useCallback((e: MouseEvent) => {
    if (!dialogEl?.current) return;
    const {top, bottom, left, right} = dialogEl.current.getBoundingClientRect();
    const { clientX, clientY } = e;
    const isInDialog = (top <= clientY && e.clientY <= bottom && left <= clientX && clientX <= right);
    if (e.target === dialogEl.current && !isInDialog) {
      dialogEl.current.close();
    }
  }, [ dialogEl ]);

  const dialogCreated = (el: DialogElement | null) => {
    if (!el || (el as HTMLDialogElement).open || !dialogEl) {
      setRerender(p => !p);
      return;
    }
    
    try {
      const dialogPolyfill = require('@borvik/dialog-polyfill').default;
      dialogPolyfill.registerDialog(el);
    } catch (err) {
      console.error('HTML5 dialog-polyfill failed to register - dialogs may not work');
      console.error(err);
    }

    dialogEl.current = el as HTMLDialogElement;
    if (dialogRef) {
      dialogRef.current = el as HTMLDialogElement;
    }
    setRerender(p => !p);
  };
  useEffect(() => {
    if (!dialogEl?.current) {
      return;
    }
    
    const dlg = dialogEl?.current;
    dlg.addEventListener('close', dialogClose);
    dlg.addEventListener('click', backdropClick);
    if (!dlg.open) {
      dlg.showModal();
    }

    let dialogBody = dlg.querySelector('.dialog-body');
    if (dialogBody) {
      let focusable = firstFocusable(dialogBody);
      if (focusable) {
        focusable.focus();
      }
    }
    // dialogEl.current.show();

    // Notes: show() - Backdrop Click doesn't work (obviously), but neither does Esc which _is_ weird
    return () => {
      dlg.removeEventListener('close', dialogClose);
      dlg.removeEventListener('click', backdropClick);
    };
  }, [dialogClose, backdropClick, dialogEl?.current]);

  if (!modalRoot)
    return null;

  const DialogTag =  doNotUseHTML5Dialog ? 'div' : 'dialog';
  let classes: string[] = [];
  if (className?.length) classes.push(className);
  if (doNotUseHTML5Dialog) classes.push('dialog');

  return ReactDOM.createPortal(<div className='dialog-container'>
    <DialogTag style={style} className={`${classes.join(' ')} ${!!onSubmit ? 'dialog-form' : ''} ${submitting ? 'submitting' : ''}`.trim()} ref={dialogCreated}>
      {!!onSubmit && <form onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSubmitting(true);
        let errored = false;
        onSubmit((result?: any) => {
          if (result !== null && typeof result !== 'undefined') {
            dialogEl?.current!.close(JSON.stringify(result));
            return;
          }
          dialogEl?.current!.close();
        })
        .catch(() => { errored = true }) // empty catch to catch form errors
        .finally(() => {
          if (errored)
            setSubmitting(false);
        }); // setSubmitting...
      }}>
        {children}
      </form>}
      {!onSubmit && <>
        {children}
      </>}
    </DialogTag>
  </div>, modalRoot);  
};

export interface DialogHeaderProps {
  showClose?: boolean;
  className?: string
}

export const DialogHeader: React.FC<PropsWithChildren<DialogHeaderProps>> = function DialogHeader({ className, showClose = true, children }) {
  const { dialog: dialogEl } = useContext(DialogContext);
  return <div className={`dialog-header ${className ?? ''}`.trim()}>
    <div>
      {children}
    </div>
    {showClose && <div>
      <button type='button' className='close' data-noautofocus onClick={() => {
        dialogEl?.current?.close();
      }}>×</button>
    </div>}
  </div>
};

export interface DialogBodyProps {
  className?: string
}

export const DialogBody: React.FC<PropsWithChildren<DialogBodyProps>> = function DialogBody({ className, children }) {
  return <div className={`dialog-body ${className ?? ''}`.trim()}>
    {children}
  </div>
};

interface FooterProps {
  className?: string
}

export const DialogFooter: React.FC<PropsWithChildren<FooterProps>> = function DialogFooter({ className, children }) {
  return <div className={`dialog-footer ${className ?? ''}`.trim()}>
    {children}
  </div>
};

type PromiseState<T> = (value: T | PromiseLike<T>) => void;

export function useDialog<T = any>(dialog: React.ReactNode) {
  const [showing, setShowing] = useState(false);
  const refPromise = useRef<PromiseState<T> | null>(null);
  const dialogEl = useRef<HTMLDialogElement | null>(null);

  const closeDialog = useCallback((result?: any) => {
    if (refPromise.current) {
      refPromise.current(result);
    } else {
      setShowing(false)
    }
  }, []);

  const showDialog = useCallback(async (): Promise<T> => {
    setShowing(true);

    let result: T;
    while (true) {
      try {
        result = await new Promise<T>((resolve) => {
          refPromise.current = resolve;
        });

        refPromise.current = null;
        setShowing(false);
        return result;
      }
      catch (e) {
        refPromise.current = null;
      }
    }
  }, []);


  let providerValue = useMemo(() => ({
    close: closeDialog,
    dialog: dialogEl,
  }), [ closeDialog ]);

  return {
    dialog: showing
      ? <DialogProvider value={providerValue}>{dialog}</DialogProvider>
      : null,
    showDialog
  };
}


/**
 * const {
 *   open
 *   close
 * } = useDialog(modal, {
 *   options
 * });
 */