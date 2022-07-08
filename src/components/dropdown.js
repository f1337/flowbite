import config from '../core/config'
import { getPrefixedDataAttributes } from '../helpers/data-attribute'
import { createPopper } from '@popperjs/core';
import { getPrefixedClassName } from '../helpers/class-name'

const Default = {
    placement: 'bottom',
    triggerType: 'click',
    onShow: () => { },
    onHide: () => { }
}

class Dropdown {
    constructor(targetElement = null, triggerElement = null, options = {}) {
        this._targetEl = targetElement
        this._triggerEl = triggerElement
        this._options = { ...Default, ...options }
        this._popperInstance = this._createPopperInstace()
        this._visible = false
        this._init()
    }

    _init() {
        if (this._triggerEl) {
            this._triggerEl.addEventListener('click', () => {
                this.toggle()
            })
        }
    }

    _createPopperInstace() {
        return createPopper(this._triggerEl, this._targetEl, {
            placement: this._options.placement,
            modifiers: [
                {
                    name: 'offset',
                    options: {
                        offset: [0, 10],
                    },
                },
            ],
        });
    }

    _handleClickOutside(ev, targetEl) {
        const clickedEl = ev.target
        if (clickedEl !== targetEl && !targetEl.contains(clickedEl) && !this._triggerEl.contains(clickedEl) && this._visible) {
            this.hide()
        }
        document.body.removeEventListener('click', this._handleClickOutside, true)
    }

    toggle() {
        if (this._visible) {
            this.hide()
            document.body.removeEventListener('click', this._handleClickOutside, true)
        } else {
            this.show()
        }
    }

    show() {
        this._targetEl.classList.remove(getPrefixedClassName('%p%hidden'))
        this._targetEl.classList.add(getPrefixedClassName('%p%block'))

        // Enable the event listeners
        this._popperInstance.setOptions(options => ({
            ...options,
            modifiers: [
                ...options.modifiers,
                { name: 'eventListeners', enabled: true },
            ],
        }));

        document.body.addEventListener('click', (ev) => { this._handleClickOutside(ev, this._targetEl) }, true)

        // Update its position
        this._popperInstance.update()
        this._visible = true

        // callback function
        this._options.onShow(this)
    }

    hide() {
        this._targetEl.classList.remove(getPrefixedClassName('%p%block'))
        this._targetEl.classList.add(getPrefixedClassName('%p%hidden'))

        // Disable the event listeners
        this._popperInstance.setOptions(options => ({
            ...options,
            modifiers: [
                ...options.modifiers,
                { name: 'eventListeners', enabled: false },
            ],
        }))

        this._visible = false

        // callback function
        this._options.onHide(this)
    }
}

window.Dropdown = Dropdown;

const initDropdown = (selectors) => {
    document.querySelectorAll(`[${selectors.main}]`).forEach(triggerEl => {
        const targetEl = document.getElementById(triggerEl.getAttribute(selectors.main))
        const placement = triggerEl.getAttribute(selectors.placement)

        new Dropdown(targetEl, triggerEl, {
            placement: placement ? placement : Default.placement
        })
    })
}

const selectors = {
	main: 'dropdown-toggle',
	placement: 'dropdown-placement'
}

const baseSelectors = getPrefixedDataAttributes(selectors, '') // we need this to make legacy selectors with no prefix work pre v1.5
const prefixSelectors = getPrefixedDataAttributes(selectors, config.getSelectorsPrefix())

if (document.readyState !== 'loading') {
	// DOMContentLoaded event were already fired. Perform explicit initialization now
	initDropdown(baseSelectors)
	initDropdown(prefixSelectors)
} else {
	// DOMContentLoaded event not yet fired, attach initialization process to it
	document.addEventListener('DOMContentLoaded', initDropdown(baseSelectors))
	document.addEventListener('DOMContentLoaded', initDropdown(prefixSelectors))
}

export default Dropdown