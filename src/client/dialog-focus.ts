/** Keep Tab at either end of a modal's controls inside the dialog. */
export function containDialogFocus(dialog: HTMLDialogElement) {
  dialog.addEventListener("keydown", event => {
    if (event.key !== "Tab" || !dialog.open) return;
    const controls = [...dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])')]
      .filter(control => control.getClientRects().length > 0);
    const first = controls[0];
    const last = controls.at(-1);
    if ((event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first)?.focus();
    }
  });
}
