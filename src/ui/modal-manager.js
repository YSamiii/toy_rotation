export class ModalManager {
  #scrollY = 0;
  #dialog = null;
  #onTouchMove = event => { if (this.#dialog && !this.#dialog.contains(event.target)) event.preventDefault(); };
  open(dialog) {
    this.#dialog = dialog;
    this.#scrollY = window.scrollY;
    document.documentElement.classList.add('modal-open');
    document.body.style.top = `-${this.#scrollY}px`;
    document.addEventListener('touchmove', this.#onTouchMove, { passive:false });
    dialog.showModal();
    dialog.addEventListener('close', () => this.close(), { once:true });
  }
  close() {
    if (!document.documentElement.classList.contains('modal-open')) return;
    document.removeEventListener('touchmove', this.#onTouchMove);
    document.documentElement.classList.remove('modal-open');
    document.body.style.top = '';
    this.#dialog = null;
    window.scrollTo(0, this.#scrollY);
  }
}
