import TinyD6ActorSheet from "./TinyD6ActorSheet.js";

export default class TinyD6HeroSheet extends TinyD6ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/tinyd6/templates/sheets/hero-sheet.hbs",
            classes: [ "tinyd6", "sheet", "hero" ]
        });
    }

    getData() {
        const data = super.getData();

        data.heritage = data.items.filter(item => { return item.type === "heritage" })[0];
        data.data.xp.remaining = data.data.xp.max - data.data.xp.spent;

        data.armorTotal = 0;
        data.armor.forEach((item, n) => {
            data.armorTotal += item.data.damageReduction;
        });

        return data;
    }

}