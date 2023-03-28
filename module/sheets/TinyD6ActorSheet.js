import * as Dice from "../helpers/dice.js";

export default class TinyD6ActorSheet extends ActorSheet {
  getData() {
    const data = super.getData();

    data.config = CONFIG.tinyd6;
    data.config.heritageHeaderPath = `tinyd6.actor.${data.config.theme}.heritage.header`;
    data.config.characterHeaderPath = `tinyd6.actor.${data.config.theme}.character`;
    data.config.heritageTraitPath = `tinyd6.actor.${data.config.theme}.heritage.traits`;
    data.config.heritageDeleteTooltipPath = `tinyd6.actor.${data.config.theme}.heritage.delete`;

    // Determine optional element display based on settings
    data.config.enableCorruption = game.settings.get(
      "tinyd6",
      "enableCorruption"
    );
    data.config.enableDamageReduction = game.settings.get(
      "tinyd6",
      "enableDamageReduction"
    );
    data.config.advancementMethod = game.settings.get(
      "tinyd6",
      "enableAdvancement"
    );

    data.system.owner = this.actor.isOwner;
    data.system.traits = data.data.items.filter((item) => {
      return item.type === "trait";
    });
    data.system.weapons = data.data.items.filter((item) => {
      return item.type === "weapon" && item.data.equipped;
    });
    data.system.armor = data.data.items.filter((item) => {
      return item.type === "armor" && item.data.equipped;
    });
    data.system.gear = data.data.items.filter((item) => {
      return item.type !== "trait" && item.type !== "heritage";
    });

    return data;
  }

  activateListeners(html) {
    console.log("tinyd6 | activating listeners");
    console.log("tinyd6 | html", html.find(".roll-dice"));

    html.find(".item-add").click(this._onItemCreate.bind(this));
    html.find(".item-show").click(this._onItemShow.bind(this));
    html.find(".item-delete").click(this._onItemDelete.bind(this));
    html.find(".item-equip").click(this._onItemEquip.bind(this));
    html.find(".roll-dice").click(this._onDieRoll.bind(this));

    // html.find('.editor-content[data-edit]').each((i, div) => this._activateEditor(div));
    html
      .find(".health-box")
      .on("click change", this._setCurrentDamage.bind(this));

    super.activateListeners(html);
  }

  activateEditor(name, options = {}, initialContent = "") {
    const editor = this.editors[name];
    if (!editor) throw new Error(`${name} is not a registered editor name!`);
    options = mergeObject(editor.options, options);
    options.height = options.target.offsetHeight;
    TextEditor.create(options, initialContent || editor.initial).then((mce) => {
      editor.mce = mce;
      editor.changed = false;
      editor.active = true;
      mce.focus();
      mce.on("change", (ev) => (editor.changed = true));
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
    if (div.offsetHeight > 0) heights.push(div.offsetHeight);
    let height = Math.min(...heights.filter((h) => Number.isFinite(h)));

    // Get initial content
    const initialContent = getProperty(this.object, name);
    //console.log("tinyd6 | name: ", name);
    //console.log("tinyd6 | initialContent:", initialContent);
    const editorOptions = {
      target: div,
      height: height,
      save_onsavecallback: (mce) => this.saveEditor(name),
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
      initial: initialContent,
    };

    // If we are using a toggle button, delay activation until it is clicked
    if (hasButton)
      button.onclick = (event) => {
        button.style.display = "none";
        this.activateEditor(name, editorOptions, initialContent);
      };
    // Otherwise activate immediately
    else this.activateEditor(name, editorOptions, initialContent);
  }

  async _onDieRoll(event) {
    console.log("tinyd6 | onDieRoll");
    event.preventDefault();
    const element = event.currentTarget;

    const rollData = {
      numberOfDice: element.dataset.diceX,
      defaultThreshold: element.dataset.threshold,
      focusAction: element.dataset.enableFocus,
      marksmanTrait: element.dataset.enableMarksman,
    };

    //TinyD6System.emit('dieRoll', rollData);
    Dice.RollTest(rollData);
  }

  _onItemCreate(event) {
    event.preventDefault();
    let element = event.currentTarget;

    let itemData = {
      name: game.i18n.localize("tinyd6.sheet.newItem"),
      img: CONFIG.tinyd6.defaultItemImage,
      type: element.dataset.type,
    };

    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  _onItemDelete(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest("[data-item-id]").dataset.itemId;
    return this.actor.data.items.get(itemId).delete();
  }

  _onItemShow(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest("[data-item-id]").dataset.itemId;
    let item = this.actor.data.items.get(itemId);

    item.sheet.render(true);
  }

  _onItemEquip(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest("[data-item-id]").dataset.itemId;
    let item = this.actor.items.get(itemId);

    return item.update(this._toggleEquipped(itemId, item));
  }

  _toggleActionButton(event) {
    const element = event.element;
    element.getElementsByClassName(".hidden").toggleClass("hidden");
  }

  _toggleEquipped(id, item) {
    return {
      _id: id,
      data: {
        equipped: !item.system.equipped,
      },
    };
  }

  _setCurrentDamage(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const currentDamage = parseInt(this.actor.system.wounds.value ?? 0);
    if (element.checked) {
      this.actor.update({
        _id: this.actor.data._id,
        data: {
          wounds: {
            value: currentDamage + 1,
          },
          advancement: {
            max: 3,
          },
        },
      });
    } else if (currentDamage > 0) {
      this.actor.update({
        _id: this.actor.data._id,
        data: {
          wounds: {
            value: currentDamage - 1,
          },
        },
      });
    }
  }
}
