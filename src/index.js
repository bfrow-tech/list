/**
 * Build styles
 */
require('./index.css').toString();

/**
 * @typedef {object} ListData
 * @property {string} style - can be ordered or unordered
 * @property {array} items - li elements
 */

/**
 * List Tool for the Editor.js 2.0
 */
class List {
  /**
   * Allow to use native Enter behaviour
   * @returns {boolean}
   * @public
   */
  static get enableLineBreaks() {
    return true;
  }

  /**
   * Get Tool toolbox settings
   * icon - Tool icon's SVG
   * title - title to show in toolbox
   *
   * @return {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.75 6C2.75 5.17 3.42 4.5 4.25 4.5C5.08 4.5 5.75 5.17 5.75 6C5.75 6.83 5.08 7.5 4.25 7.5C3.42 7.5 2.75 6.83 2.75 6ZM2.75 12C2.75 11.17 3.42 10.5 4.25 10.5C5.08 10.5 5.75 11.17 5.75 12C5.75 12.83 5.08 13.5 4.25 13.5C3.42 13.5 2.75 12.83 2.75 12ZM4.25 16.5C3.42 16.5 2.75 17.18 2.75 18C2.75 18.82 3.43 19.5 4.25 19.5C5.07 19.5 5.75 18.82 5.75 18C5.75 17.18 5.08 16.5 4.25 16.5ZM21.25 19H7.25V17H21.25V19ZM7.25 13H21.25V11H7.25V13ZM7.25 7V5H21.25V7H7.25Z" fill="currentColor"/></svg>',
      title: 'List'
    };
  }

  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {{data: ListData, config: object, api: object}}
   *   data — previously saved data
   *   config - user config for Tool
   *   api - Editor.js API
   */
  constructor({data, config, api}) {
    /**
     * HTML nodes
     * @private
     */
    this._elements = {
      wrapper : null,
    };

    this.settings = [
      {
        name: 'unordered',
        title: 'Unordered',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="3 2 18 20" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.75 6C2.75 5.17 3.42 4.5 4.25 4.5C5.08 4.5 5.75 5.17 5.75 6C5.75 6.83 5.08 7.5 4.25 7.5C3.42 7.5 2.75 6.83 2.75 6ZM2.75 12C2.75 11.17 3.42 10.5 4.25 10.5C5.08 10.5 5.75 11.17 5.75 12C5.75 12.83 5.08 13.5 4.25 13.5C3.42 13.5 2.75 12.83 2.75 12ZM4.25 16.5C3.42 16.5 2.75 17.18 2.75 18C2.75 18.82 3.43 19.5 4.25 19.5C5.07 19.5 5.75 18.82 5.75 18C5.75 17.18 5.08 16.5 4.25 16.5ZM21.25 19H7.25V17H21.25V19ZM7.25 13H21.25V11H7.25V13ZM7.25 7V5H21.25V7H7.25Z" fill="currentColor"/></svg>',
        default: false
      },
      {
        name: 'ordered',
        title: 'Ordered',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="1 1.5 15 15" fill="none"><path id="icon/editor/format_list_numbered_24px" fill-rule="evenodd" clip-rule="evenodd" d="M3.375 6H2.625V3.75H1.875V3H3.375V6ZM3.375 13.125V12.75H1.875V12H4.125V15H1.875V14.25H3.375V13.875H2.625V13.125H3.375ZM1.875 8.25H3.225L1.875 9.825V10.5H4.125V9.75H2.775L4.125 8.175V7.5H1.875V8.25ZM5.625 5.25V3.75H16.125V5.25H5.625ZM5.625 14.25H16.125V12.75H5.625V14.25ZM16.125 9.75H5.625V8.25H16.125V9.75Z" fill="currentColor"/></svg>',
        default: true
      }
    ];

    /**
     * Tool's data
     * @type {ListData}
     * */
    this._data = {
      style: this.settings.find( tune => tune.default === true ).name,
      items: []
    };

    this.api = api;
    this.data = data;
  }

  /**
   * Returns list tag with items
   * @return {Element}
   * @public
   */
  render() {
    const style = this._data.style === 'ordered' ? this.CSS.wrapperOrdered : this.CSS.wrapperUnordered;

    this._elements.wrapper = this._make('ul', [this.CSS.baseBlock, this.CSS.wrapper, style], {
      contentEditable: true
    });

    // fill with data
    if (this._data.items.length) {
      this._data.items.forEach( item => {
        this._elements.wrapper.appendChild(this._make('li', this.CSS.item, {
          innerHTML: item
        }));
      });
    } else {
      this._elements.wrapper.appendChild(this._make('li', this.CSS.item));
    }

    // detect keydown on the last item to escape List
    this._elements.wrapper.addEventListener('keydown', (event) => {
      const [ENTER, BACKSPACE] = [13, 8]; // key codes

      switch (event.keyCode) {
        case ENTER:
          this.getOutofList(event);
          break;
        case BACKSPACE:
          this.backspace(event);
          break;
      }
    }, false);

    return this._elements.wrapper;
  }

  /**
   * @return {ListData}
   * @public
   */
  save() {
    return this.data;
  }

  /**
   * Allow List Tool to be converted to/from other block
   */
  static get conversionConfig() {
    return {
      /**
       * To create exported string from list, concatenate items by dot-symbol.
       * @param {ListData} data
       * @return {string}
       */
      export: (data) => {
        return data.items.join('. ');
      },
      /**
       * To create a list from other block's string, just put it at the first item
       * @param string
       * @return {ListData}
       */
      import: (string) => {
        return {
          items: [ string ],
          style: 'unordered'
        };
      }
    };
  }

  /**
   * Sanitizer rules
   */
  static get sanitize() {
    return {
      style: {},
      items: {
        br: true,
      }
    };
  }

  /**
   * Settings
   * @public
   */
  renderSettings() {
    const wrapper = this._make('div', [ this.CSS.settingsWrapper ], {});

    this.settings.forEach( (item) => {
      const itemEl = this._make('div', this.CSS.settingsButton, {
        innerHTML: item.icon
      });

      itemEl.addEventListener('click', () => {
        this.toggleTune(item.name);

        // clear other buttons
        const buttons = itemEl.parentNode.querySelectorAll('.' + this.CSS.settingsButton);

        Array.from(buttons).forEach( button => button.classList.remove(this.CSS.settingsButtonActive));

        // mark active
        itemEl.classList.toggle(this.CSS.settingsButtonActive);
      });

      if (this._data.style === item.name) {
        itemEl.classList.add(this.CSS.settingsButtonActive);
      }

      wrapper.appendChild(itemEl);
    });

    return wrapper;
  }

  /**
   * On paste callback that is fired from Editor
   *
   * @param {PasteEvent} event - event with pasted data
   */
  onPaste(event) {
    const list = event.detail.data;

    this.data = this.pasteHandler(list);
  }

  /**
   * List Tool on paste configuration
   * @public
   */
  static get pasteConfig() {
    return {
      tags: ['OL', 'UL', 'LI'],
    };
  }

  /**
   * Toggles List style
   * @param {string} style - 'ordered'|'unordered'
   */
  toggleTune(style) {
    this._elements.wrapper.classList.toggle(this.CSS.wrapperOrdered, style === 'ordered');
    this._elements.wrapper.classList.toggle(this.CSS.wrapperUnordered, style === 'unordered');

    this._data.style = style;
  }

  /**
   * Styles
   * @private
   */
  get CSS() {
    return {
      baseBlock: this.api.styles.block,
      wrapper: 'cdx-list',
      wrapperOrdered: 'cdx-list--ordered',
      wrapperUnordered: 'cdx-list--unordered',
      item: 'cdx-list__item',
      settingsWrapper: 'cdx-list-settings',
      settingsButton: this.api.styles.settingsButton,
      settingsButtonActive: this.api.styles.settingsButtonActive,
    };
  };

  /**
   * List data setter
   * @param {ListData} listData
   */
  set data(listData) {
    if (!listData) {
      listData = {};
    }

    this._data.style = listData.style || this.settings.find( tune => tune.default === true ).name;
    this._data.items = listData.items || [];

    const oldView = this._elements.wrapper;

    if (oldView) {
      oldView.parentNode.replaceChild(this.render(), oldView);
    }
  }

  /**
   * Return List data
   * @return {ListData}
   */
  get data() {
    this._data.items = [];

    const items = this._elements.wrapper.querySelectorAll(`.${this.CSS.item}`);

    for (let i = 0; i < items.length; i++) {
      const value = items[i].innerHTML.replace('<br>', ' ').trim();

      if (value) {
        this._data.items.push(items[i].innerHTML);
      }
    }

    return this._data;
  }

  /**
   * Helper for making Elements with attributes
   *
   * @param  {string} tagName           - new Element tag name
   * @param  {array|string} classNames  - list or name of CSS classname(s)
   * @param  {Object} attributes        - any attributes
   * @return {Element}
   */
  _make(tagName, classNames = null, attributes = {}) {
    let el = document.createElement(tagName);

    if (Array.isArray(classNames)) {
      el.classList.add(...classNames);
    } else if (classNames) {
      el.classList.add(classNames);
    }

    for (let attrName in attributes) {
      el[attrName] = attributes[attrName];
    }

    return el;
  }

  /**
   * Returns current List item by the caret position
   * @return {Element}
   */
  get currentItem(){
    let currentNode = window.getSelection().anchorNode;

    if (currentNode.nodeType !== Node.ELEMENT_NODE) {
      currentNode = currentNode.parentNode;
    }

    return currentNode.closest(`.${this.CSS.item}`);
  }

  /**
   * Get out from List Tool
   * by Enter on the empty last item
   * @param {KeyboardEvent} event
   */
  getOutofList(event) {
    const items = this._elements.wrapper.querySelectorAll('.' + this.CSS.item);

    /**
     * Save the last one.
     */
    if (items.length < 2) {
      return;
    }

    const lastItem = items[items.length - 1];
    const currentItem = this.currentItem;

    /** Prevent Default li generation if item is empty */
    if (currentItem === lastItem && !lastItem.textContent.trim().length) {
      /** Insert New Block and set caret */
      currentItem.parentElement.removeChild(currentItem);
      this.api.blocks.insertNewBlock();
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * Handle backspace
   * @param {KeyboardEvent} event
   */
  backspace(event) {
    const items = this._elements.wrapper.querySelectorAll('.' + this.CSS.item),
      firstItem = items[0];

    if (!firstItem) {
      return;
    }

    /**
     * Save the last one.
     */
    if (items.length < 2 && !firstItem.innerHTML.replace('<br>', ' ').trim()) {
      event.preventDefault();
    }
  }

  /**
   * Select LI content by CMD+A
   * @param {KeyboardEvent} event
   */
  selectItem(event){
    event.preventDefault();

    const selection = window.getSelection(),
      currentNode = selection.anchorNode.parentNode,
      currentItem = currentNode.closest('.' + this.CSS.item),
      range = new Range();

    range.selectNodeContents(currentItem);

    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * Handle UL, OL and LI tags paste and returns List data
   *
   * @param {HTMLUListElement|HTMLOListElement|HTMLLIElement} element
   * @returns {ListData}
   */
  pasteHandler(element) {
    const {tagName: tag} = element;
    let type;

    switch(tag) {
      case 'OL':
        type = 'ordered';
        break;
      case 'UL':
      case 'LI':
        type = 'unordered';
    }

    const data = {
      type,
      items: []
    };

    if (tag === 'LI') {
      data.items = [ element.innerHTML ];
    } else {
      const items = Array.from(element.querySelectorAll('LI'));

      data.items = items.map(li => li.innerHTML).filter(item => !!item.trim());
    }

    return data;
  }
}

module.exports = List;
