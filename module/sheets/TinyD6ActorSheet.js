import * as Dice from "../helpers/dice.js";
import { TinyD6System } from "../tinyd6.js";

export default class TinyD6ActorSheet extends ActorSheet {
  getData() {
    const context = super.getData();

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = this.actor.system;
    context.flags = this.actor.flags;

    context.config = CONFIG.tinyd6;
    const theme = game.settings.get(TinyD6System.SYSTEM, "theme");
    context.config.heritageHeaderPath = `tinyd6.actor.${theme}.heritage.header`;
    context.config.characterHeaderPath = `tinyd6.actor.${theme}.character`;
    context.config.heritageTraitPath = `tinyd6.actor.${theme}.heritage.traits`;
    context.config.heritageDeleteTooltipPath = `tinyd6.actor.${theme}.heritage.delete`;

    // Determine optional element display based on settings
    context.config.enableCorruption = game.settings.get(
      TinyD6System.SYSTEM,
      "enableCorruption"
    );
    context.config.enableDamageReduction = game.settings.get(
      TinyD6System.SYSTEM,
      "enableDamageReduction"
    );
    context.config.advancementMethod = game.settings.get(
      TinyD6System.SYSTEM,
      "enableAdvancement"
    );

    context.system.owner = this.actor.isOwner;
    context.system.traits = context.items.filter((item) => {
      return item.type === "trait";
    });
    context.system.weapons = context.items.filter((item) => {
      return item.type === "weapon" && item.system.equipped;
    });
    context.system.armor = context.items.filter((item) => {
      return item.type === "armor" && item.system.equipped;
    });
    context.system.gear = context.items.filter((item) => {
      return item.type !== "trait" && item.type !== "heritage";
    });

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
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
  }

  // activateEditor(name, options = {}, initialContent = "") {
  //   const editor = this.editors[name];
  //   if (!editor) throw new Error(`${name} is not a registered editor name!`);
  //   options = mergeObject(editor.options, options);
  //   options.height = options.target.offsetHeight;
  //   TextEditor.create(options, initialContent || editor.initial).then((mce) => {
  //     editor.mce = mce;
  //     editor.changed = false;
  //     editor.active = true;
  //     mce.focus();
  //     mce.on("change", (ev) => (editor.changed = true));
  //   });
  // }

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
    return this.actor.items.get(itemId).delete();
  }

  _onItemShow(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest("[data-item-id]").dataset.itemId;
    let item = this.actor.items.get(itemId);

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
        _id: this.actor._id,
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
        _id: this.actor._id,
        data: {
          wounds: {
            value: currentDamage - 1,
          },
        },
      });
    }
  }
}
