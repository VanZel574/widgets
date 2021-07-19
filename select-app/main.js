
const getTemplate = ({ data=[], placeholder }, selected = null) => {
    let text = placeholder ?? ''

    const selectOptions = data.map(value => {
        let selectedClass = ''
        if (value === selected) {
            text = value
            selectedClass = 'selected'
        }
        return `
      <li class="select-option ${selectedClass}" data-type="option" data-value="${value}">${value}</li>
    `
    })


    return `
        <div class="select-value-container" data-type="value-container">
                <div class="select-value" data-type="value">
                    ${text}
                </div>
                <div class="select-control-container" data-type="select-controls">
                    <div class="select-arrow-wrap">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="10" class="select-arrow"><path d="M9.211364 7.59931l4.48338-4.867229c.407008-.441854.407008-1.158247 0-1.60046l-.73712-.80023c-.407008-.441854-1.066904-.441854-1.474243 0L7 5.198617 2.51662.33139c-.407008-.441853-1.066904-.441853-1.474243 0l-.737121.80023c-.407008.441854-.407008 1.158248 0 1.600461l4.48338 4.867228L7 10l2.211364-2.40069z"></path></svg>
                    </div>
                </div>
            </div>

        <div class="select-dropdown" data-type="dropdown">
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
        this.selected = {
            prevValue: null,
            curValue: null
        }

        this.render()
        this.init()
    }

    // Set active option id
    set SET_SELECTED_OPTION (newVal) {
        this.selected = newVal
    }
    get GET_SELECTED_OPTION () {
        return this.selected
    }

    get IS_OPEN () {
        return this.$select.classList.contains('select-open')
    }

    /*-----------------------------
    * Methods
    *----------------------------*/

    // Init select
    init () {
        //
        this.$select.classList.add('select', 'select-close')
        // Click handler
        this.onClickOption = this.onClickOption.bind(this)
        this.toggleSelect = this.toggleSelect.bind(this)
        this.close = this.close.bind(this)
        this.$select.querySelector('[data-type="dropdown"]').addEventListener('click', this.onClickOption)
        this.$select.querySelector('[data-type="value-container"]').addEventListener('click', this.toggleSelect)
        document.addEventListener('click', this.close)
        document.addEventListener('touchstart', this.close)


        this.$value = this.$select.querySelector('[data-type="value"]')

        // Selected item in options
        const selectedId = this.options.selected
        if (selectedId !== undefined) {
            this.saveClickedOption(this.options.data[selectedId], 'cur')
            this.saveClickedOption(this.options.data[selectedId], 'prev')
        }
    }

    // Render template
    render () {
        // const selected = this.options.selected ? this.options.data[this.options.selected] : null
        const selected = this.options.selected
        this.$select.insertAdjacentHTML("afterbegin", getTemplate(this.options, this.options.data[selected]))
    }

    // Open select
    open () {
        this.$select.classList.add('select-open')
        this.$select.classList.remove('select-close')
    }

    // Close select
    close () {
        this.$select.classList.remove('select-open')
        this.$select.classList.add('select-close')
    }

    // Save selected option
    saveClickedOption (value, type) {
        let selected = this.GET_SELECTED_OPTION
        if (type === 'cur') {
            selected.curValue = value
        } else {
            selected.prevValue = value
        }

        this.SET_SELECTED_OPTION = selected
    }


    // Click on dropdown
    onClickOption (e) {
        e.stopPropagation()
        const clickElem = e.target.dataset

        // Save cur selected
        this.saveClickedOption(clickElem.value, 'cur')
        // Highlight selected id
        this.selectOption()
        // Save to prev selected
        this.saveClickedOption(clickElem.value, 'prev')
        // Callback
        this.options.onSelected ? this.options.onSelected(this.GET_SELECTED_OPTION.curValue) : null
        // Close
        this.close()
    }

    // Open or close select
    toggleSelect (e) {
        e.stopPropagation()
        this.IS_OPEN ? this.close() : this.open()
    }

    // Highlight selected item
    selectOption () {
        const { prevValue, curValue } = this.GET_SELECTED_OPTION

        if (prevValue) {
            this.$select.querySelector(`[data-value="${prevValue}"]`).classList.remove('selected')
        }

        if (curValue) {
            this.$select.querySelector(`[data-value="${curValue}"]`).classList.add('selected')
            this.$value.textContent = this.GET_SELECTED_OPTION.curValue
        }
    }


    destroy () {
        document.removeEventListener('click', this.close)
        document.removeEventListener('touchstart', this.close)
        this.$select.querySelector('[data-type="dropdown"]').removeEventListener('click', this.onClickOption)
        this.$select.querySelector('[data-type="value-container"]').removeEventListener('click', this.toggleSelect)
        this.$select.innerHTML = ''
    }

}

window.CustomSelect = CustomSelect
