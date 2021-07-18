
const getTemplate = ({ data=[], placeholder, selectedId = null }) => {
  let text = placeholder ?? 'Placeholder по умолчанию'

  const selectOptions = data.map(item => {
    let selected = ''
    if (item.id === selectedId) {
      text = item.value
      selected = 'selected'
    }
    return `
      <li class="select-option ${selected}" data-type="option" data-id="${item.id}">${item.value}</li>
    `
  })


  return `
              <div class="select-value-container" data-type="value">
                <div class="select-value">
                    ${text}
                </div>
                <div class="select-control-container">
                    <div class="select-arrow-wrap">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="10" class="select-arrow"><path d="M9.211364 7.59931l4.48338-4.867229c.407008-.441854.407008-1.158247 0-1.60046l-.73712-.80023c-.407008-.441854-1.066904-.441854-1.474243 0L7 5.198617 2.51662.33139c-.407008-.441853-1.066904-.441853-1.474243 0l-.737121.80023c-.407008.441854-.407008 1.158248 0 1.600461l4.48338 4.867228L7 10l2.211364-2.40069z"></path></svg>
                    </div>
                </div>
            </div>

            <div class="select-dropdown">
                <ul class="select-dropdown-list">
                    ${selectOptions.join('')}
                </ul>
            </div>
  `
}


class CustomSelect {
  constructor(id, options) {
    this.$select = document.querySelector(id)
    this.options = options
    this.selectedOptionId = {
      prevValue: null,
      curValue: null
    }

    this.render()
    this.init()
  }

  // Set active option id
  set SET_SELECTED_OPTION (newVal) {
    this.selectedOptionId = newVal
  }
  get GET_SELECTED_OPTION () {
    return this.selectedOptionId
  }
  get GET_SELECTED_VALUE_CUR () {
    const curId = this.GET_SELECTED_OPTION.curValue
    return this.options.data.find(item => item.id === curId)
  }

  get IS_OPEN () {
    return this.$select.classList.contains('select-open')
  }

  /*-----------------------------
  * Methods
  *----------------------------*/

  // Init select
  init () {
    this.clickHandler = this.clickHandler.bind(this)
    this.$select.addEventListener('click', this.clickHandler)
    this.$value = this.$select.querySelector('[data-type="value"] .select-value')

    // Selected item
    // if (this.options.selectedId)
  }

  // Render template
  render () {
    this.$select.insertAdjacentHTML("afterbegin", getTemplate(this.options))
  }

  // Open select
  open () {
    this.$select.classList.remove('select-open')
    this.$select.classList.add('select-close')
  }

  // Close select
  close () {
    this.$select.classList.add('select-open')
    this.$select.classList.remove('select-close')
  }

  // Click on select
  clickHandler (e) {
    const clickElem = e.target.dataset

    if (clickElem.type === 'option') {
      // get selected id from class
      let selectedId = this.GET_SELECTED_OPTION
      selectedId.curValue = clickElem.id

      // save current selected id
      this.SET_SELECTED_OPTION = selectedId

      // Highlight selected id
      this.selectOption()

      // Save to prev selected
      selectedId.prevValue = clickElem.id
      this.SET_SELECTED_OPTION = selectedId

    }
    this.toggleSelect()
  }

  // Open or close select
  toggleSelect () {
    this.IS_OPEN ? this.open() : this.close()
  }

  // Highlight selected item
  selectOption () {
    const { prevValue, curValue } = this.GET_SELECTED_OPTION

    if (prevValue) {
      this.$select.querySelector(`[data-id="${prevValue}"]`).classList.remove('selected')
    }

    if (curValue) {
      this.$select.querySelector(`[data-id="${curValue}"]`).classList.add('selected')
      this.$value.textContent = this.GET_SELECTED_VALUE_CUR.value
    }
  }

}

window.CustomSelect = CustomSelect
