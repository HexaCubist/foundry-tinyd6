export default class TinyD6ItemSheet extends ItemSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: [ "tinyd6", "sheet", "item", CONFIG.tinyd6.theme ]
        });
    }

    get template() {
        return `systems/tinyd6/templates/sheets/${this.entity.data.type}-sheet.hbs`;
    }

    activateListeners(html)
    {
        html.find('.editor-content[data-edit]').each((i, div) => this._activateEditor(div));
    }


    activateEditor(name, options={}, initialContent="") {
        const editor = this.editors[name];
        if ( !editor ) throw new Error(`${name} is not a registered editor name!`);
        options = mergeObject(editor.options, options);
        options.height = options.target.offsetHeight;
        TextEditor.create(options, initialContent || editor.initial).then(mce => {
            editor.mce = mce;
            editor.changed = false;
            editor.active = true;
            mce.focus();
            mce.on('change', ev => editor.changed = true);
        });
    }

    /**
     * Activate a TinyMCE editor instance present within the form
     * @param div {HTMLElement}
     * @private
     */
    _activateEditor(div) {
        // Get the editor content div
        const name = div.getAttribute("data-edit");
        const button = div.nextElementSibling;
        const hasButton = button && button.classList.contains("editor-edit");
        const wrap = div.parentElement.parentElement;
        const wc = $(div).parents(".window-content")[0];

        // Determine the preferred editor height
        const heights = [wrap.offsetHeight, wc ? wc.offsetHeight : null];
        if ( div.offsetHeight > 0 ) heights.push(div.offsetHeight);
        let height = Math.min(...heights.filter(h => Number.isFinite(h)));

        // Get initial content
        const data = this.object instanceof Entity ? this.object.data : this.object;
        const initialContent = getProperty(data, name);
        const editorOptions = {
            target: div,
            height: height,
            save_onsavecallback: mce => this.saveEditor(name)
        };

        // Add record to editors registry
        this.editors[name] = {
            target: name,
            button: button,
            hasButton: hasButton,
            mce: null,
            active: !hasButton,
            changed: false,
            options: editorOptions,
            initial: initialContent
        };

        // If we are using a toggle button, delay activation until it is clicked
        if (hasButton) button.onclick = event => {
            button.style.display = "none";
            this.activateEditor(name, editorOptions, initialContent);
        };
        // Otherwise activate immediately
        else this.activateEditor(name, editorOptions, initialContent);
    }

    getData() {
        const data = super.getData();
        data.traits = {};

        data.config = CONFIG.tinyd6;

        return data;
    }
}