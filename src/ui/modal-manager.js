export class ModalManager {
  #scrollY = 0;
  #dialog = null;
  #touchStartY = null;
  #onTouchStart = event => { this.#touchStartY = event.touches[0]?.clientY ?? null; };
  #onTouchMove = event => {
    const dialog = this.#dialog;
    if (!dialog || !dialog.contains(event.target)) {
      event.preventDefault();
      return;
    }
    const scroller = event.target instanceof Element ? event.target.closest('.form, .sheet') : null;
    if (!scroller || !dialog.contains(scroller)) {
      event.preventDefault();
      return;
    }
    const currentY = event.touches[0]?.clientY;
    if (this.#touchStartY == null || currentY == null) return;
    const pullingDown = currentY > this.#touchStartY;
    const pushingUp = currentY < this.#touchStartY;
    const atTop = scroller.scrollTop <= 0;
    const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
    if ((atTop && pullingDown) || (atBottom && pushingUp)) event.preventDefault();
  };
  open(dialog) {
    this.forceClose();
    this.#dialog = dialog;
    this.#scrollY = window.scrollY;
    document.documentElement.classList.add('modal-open');
    document.body.style.top = `-${this.#scrollY}px`;
    document.addEventListener('touchstart', this.#onTouchStart, { passive:true, capture:true });
    document.addEventListener('touchmove', this.#onTouchMove, { passive:false, capture:true });
    try {
      dialog.showModal();
      dialog.addEventListener('close', () => this.close(), { once:true });
      dialog.addEventListener('cancel', () => queueMicrotask(() => this.close()), { once:true });
    } catch (error) {
      this.close();
      throw error;
    }
  }
  close() {
    if (!document.documentElement.classList.contains('modal-open')) return;
    document.removeEventListener('touchstart', this.#onTouchStart, true);
    document.removeEventListener('touchmove', this.#onTouchMove, true);
    this.#touchStartY = null;
    document.documentElement.classList.remove('modal-open');
    document.body.style.top = '';
    this.#dialog = null;
    window.scrollTo(0, this.#scrollY);
  }
  forceClose() {
    if (this.#dialog?.open) this.#dialog.close();
    this.close();
  }
}
