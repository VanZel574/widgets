/*
* widget for modal window
* */

class ModalWidget {
  constructor(options) {
    this.options = options
  }

  /*--------------
  * parse options
  *-------------*/
  set options(values) {
    this.btnId = values.btn
    this.modalId = values.modal
  }

  /*--------------
  * modal elements
  *-------------*/
  set modalElements(items) {
    this.modalEl = items.modalEl
    this.modalOverlay = items.modalOverlay
    this.modalContainerEl = items.modalContainerEl
    this.modalCloseEl = items.modalCloseEl
    this.modalTrigger = items.modalTrigger
  }

  openModal() {
    // show modal
    this.modalTrigger.addEventListener('click', () => {
      this.modalEl.classList.add('modal-active')

      // show container
      setTimeout(() => {
        this.modalOverlay.classList.add('modal-overlay-active')
        this.modalContainerEl.classList.add('modal-container-active')

        // make body overflow hidden so it's not scrollable
        document.documentElement.style.overflow = 'hidden'
      }, 50)
    })
  }

  closeModal() {
    // hide overlay and modal-container
    this.modalOverlay.classList.remove('modal-overlay-active')
    this.modalContainerEl.classList.remove('modal-container-active')

    // make body overflow hidden so it's not scrollable
    document.documentElement.style.overflow = 'auto';

    // hide modal
    setTimeout(() => {
      this.modalEl.classList.remove('modal-active')
    },200)
  }

  closeHandler() {
    // close modal
    this.modalOverlay.addEventListener('click', () => {this.closeModal()})
    this.modalCloseEl.addEventListener('click', () => {this.closeModal()})
  }

  initModal() {
    document.addEventListener("DOMContentLoaded", () => {
      // write modal DOM elements to class items
      this.modalElements = {
        modalEl: document.querySelector(this.modalId),
        modalOverlay: document.querySelector(`${this.modalId} .modal-overlay`),
        modalContainerEl: document.querySelector(`${this.modalId} .modal-container`),
        modalCloseEl: document.querySelector(`${this.modalId} .close-modal`),
        modalTrigger: document.querySelector(this.btnId)
      }

      // init events
      this.openModal()
      this.closeHandler()
    })
  }
}

// add modal class to global object Window
window.ModalWidget = ModalWidget
