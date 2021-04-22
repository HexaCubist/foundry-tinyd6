import TinyD6ActorSheet from "./TinyD6ActorSheet.js";

export default class TinyD6NpcSheet extends TinyD6ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            height: null,
            template: "systems/tinyd6/templates/sheets/npc-sheet.hbs",
            classes: [ "tinyd6", "sheet", "npc", game.settings.get("tinyd6", "theme") ]
        });
    }
}