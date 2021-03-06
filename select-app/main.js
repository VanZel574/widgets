/*---------------------------------------------------
* Select
* const customSelect = new CustomSelect('#id', options)
* options = {
*   data: Array of objects {id: Number, value: String},
*   placeholder: string,
*   selected: number,
*   onSelect: function(item)
*   onInput: function
* }
*
* data - items in select
* selected - number of selected item
* onSelect - callback onSelect event, item-selected value
* onInput - callback input event, must return new data. This func render data to dropdown
*---------------------------------------------------*/



/*-----------------
* Dropdown items
*----------------*/
const getDropDownItems = data => {
    return data.map(item =>
        `<li class="select-option" data-id="${item.id}" data-value="${item.value}">${item.value}</li>`
    )
}

/*-------------------
* Template html
*------------------*/
const getTemplate = ({ data=[], placeholder }) => {
    let text = placeholder ?? ''

    // Build dropdown items
    const selectOptions = getDropDownItems(data)

    return `
        <div class="select-value-container" data-type="value-container">
                <input type="text" class="select-value" data-type="value" value="${text}" />
                <div class="select-control-container" data-type="select-controls">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="10" class="select-arrow">
                        <path d="M9.211364 7.59931l4.48338-4.867229c.407008-.441854.407008-1.158247 0-1.60046l-.73712-.80023c-.407008-.441854-1.066904-.441854-1.474243 0L7 5.198617 2.51662.33139c-.407008-.441853-1.066904-.441853-1.474243 0l-.737121.80023c-.407008.441854-.407008 1.158248 0 1.600461l4.48338 4.867228L7 10l2.211364-2.40069z"></path>
                    </svg>

                    <svg class="select-spinner hide-control" viewBox="0 0 50 50">
                       <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                    </svg>
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
        // Rename props in options.data
        this.renameData(options)

        this.options = options
        this.selected = {
            prevValue: null,
            curValue: null
        }

        this.render()
        this.init()
    }

    // Set active option id
    // set SET_SELECTED_OPTION (newVal) {
    //     this.selected = newVal
    // }
    get GET_SELECTED_OPTION () {
        return this.selected
    }

    // Change selected option
    set SET_SELECTED (id) {
        if (id !== undefined) {
            const selectedItem = this.options.data.find(item => item.id === id)
            this.saveClickedOption(selectedItem, 'cur')

            this.selectOption()
            this.saveClickedOption(selectedItem, 'prev')
        }

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
        this.$value = this.$select.querySelector('[data-type="value"]')

        // Init events
        this.eventsHandler()

        // Selected item in options
        this.SET_SELECTED = this.options.selected
    }

    eventsHandler () {
        // Click handler
        this.onClickOption = this.onClickOption.bind(this)
        this.toggleSelect = this.toggleSelect.bind(this)
        this.close = this.close.bind(this)
        this.onInput = this.onInput.bind(this)

        if (this.options.data) {
            this.$select.querySelector('[data-type="dropdown"]').addEventListener('click', this.onClickOption)
            this.$select.querySelector('[data-type="value-container"]').addEventListener('click', this.toggleSelect)
            document.addEventListener('click', this.close)
            document.addEventListener('touchstart', this.close)
            this.$value.addEventListener('input', this.onInput)
        }
    }

    removeEvents () {
        this.$value.removeEventListener('input', this.onInput)
        document.removeEventListener('click', this.close)
        document.removeEventListener('touchstart', this.close)
        this.$select.querySelector('[data-type="dropdown"]').removeEventListener('click', this.onClickOption)
        this.$select.querySelector('[data-type="value-container"]').removeEventListener('click', this.toggleSelect)
    }

    // Render template
    render () {
        if (this.options.data) {
            this.$select.insertAdjacentHTML("afterbegin", getTemplate(this.options))
        }
    }

    // Open or close select
    toggleSelect (e) {
        e.stopPropagation()
        this.IS_OPEN ? this.close() : this.open()
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

    // Click on dropdown
    async onClickOption (e) {
        e.stopPropagation()
        const clickElem = e.target.dataset

        // Select item
        this.SET_SELECTED = +clickElem.id

        // Close
        this.close()
        // Callback
        if (this.options.onSelected) {
            this.showLoader()
            await this.options.onSelected(this.GET_SELECTED_OPTION.curValue)
            this.hideLoader()
        }
        // Remove events if once
        if (this.options.once) {
            this.removeEvents()
        }
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

    // Highlight selected item
    selectOption () {
        const { prevValue, curValue } = this.GET_SELECTED_OPTION

        if (prevValue) {
            this.$select.querySelector(`[data-value="${prevValue.value}"]`).classList.remove('selected')
        }

        if (curValue) {
            this.$select.querySelector(`[data-value="${curValue.value}"]`).classList.add('selected')
            this.$value.value = this.GET_SELECTED_OPTION.curValue.value
        }
    }

    // Input event
    async onInput (e) {
        const value = e.target.value
        if (this.options.onInput) {
            this.showLoader()
            const newData = await this.options.onInput(value)

            this.renderDropdownItems(newData)
            this.hideLoader()
        }
    }

    // Render NewData
    renderDropdownItems (data) {
        const itemList = getDropDownItems(data)
        const $dropdown = this.$select.querySelector('.select-dropdown-list')
        $dropdown.innerHTML = ''
        $dropdown.insertAdjacentHTML("afterbegin", itemList.join(''))
    }

    showLoader () {
        this.$select.querySelector('.select-arrow').classList.add('hide-control')
        this.$select.querySelector('.select-spinner').classList.add('show-control')
    }

    hideLoader () {
        this.$select.querySelector('.select-arrow').classList.remove('hide-control')
        this.$select.querySelector('.select-spinner').classList.remove('show-control')
    }

    // Rename second prop key to value
    renameData (options) {
        options.data = options.data.map(item => {
            if ('value' in item) return item
            const propList = Object.entries(item)
            propList.forEach(prop => {
                if (prop[0] === 'id') return
                else prop[0] = 'value'
            })
            return Object.fromEntries(propList)
        })
    }

    destroy () {
        this.removeEvents()
        this.$select.innerHTML = ''
    }

}

window.CustomSelect = CustomSelect
