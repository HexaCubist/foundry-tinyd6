import { TinyD6System } from "../tinyd6.js";

export default class TinyD6ItemSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: [
        TinyD6System.SYSTEM,
        "sheet",
        "item",
        game.settings.get(TinyD6System.SYSTEM, "theme"),
      ],
    });
  }

  get template() {
    return `systems/tinyd6/templates/sheets/${this.document.data.type}-sheet.hbs`;
  }

  getData() {
    const context = super.getData();

    // context.actor.system.traits = {};
    context.config = CONFIG.tinyd6;

    //console.log("tinyd6 | ITEM DATA (after)", data);
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
  }
}
