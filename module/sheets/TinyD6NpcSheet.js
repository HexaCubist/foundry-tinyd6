export default class TinyD6NpcSheet extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/tinyd6/templates/sheets/npc-sheet.hbs",
            classes: [ "tinyd6", "sheet", "npc" ]
        });
    }
}