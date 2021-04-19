import * as Dice from "../helpers/dice.js";

export default class TinyD6ActorSheet extends ActorSheet {
    getData() {
        const data = super.getData();

        data.config = CONFIG.tinyd6;
        data.config.heritageHeaderPath = `tinyd6.actor.${data.config.theme}.heritage.header`;
        data.owner = this.actor.owner;
        data.traits = data.items.filter(item => { return item.type === "trait" });
        data.weapons = data.items.filter(item => { return item.type === "weapon" && item.data.equipped });
        data.armor = data.items.filter(item => { return item.type === "armor" && item.data.equipped });
        data.gear = data.items.filter(item => { return item.type !== "trait" && item.type !== "heritage" });

        return data;
    }

    activateListeners(html)
    {
        html.find(".item-add").click(this._onItemCreate.bind(this));
        html.find(".item-show").click(this._onItemShow.bind(this));
        html.find(".item-delete").click(this._onItemDelete.bind(this));
        html.find(".item-equip").click(this._onItemEquip.bind(this));
        html.find(".roll-dice").click(this._onDieRoll.bind(this));

        super.activateListeners(html);
    }

    async _onDieRoll(event)
    {
        event.preventDefault();
        const element = event.currentTarget;

        const rollData = {
            numberOfDice: element.dataset.diceX,
            defaultThreshold: element.dataset.threshold,
            focusAction: element.dataset.enableFocus,
            marksmanTrait: element.dataset.enableMarksman
        };

        Dice.RollTest(rollData);
    }

    _onItemCreate(event)
    {
        event.preventDefault();
        let element = event.currentTarget;

        let itemData = {
            name: game.i18n.localize("tinyd6.sheet.newItem"),
            img: CONFIG.tinyd6.defaultItemImage,
            type: element.dataset.type
        };

        return this.actor.createOwnedItem(itemData);
    }

    _onItemDelete(event)
    {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest("[data-item-id]").dataset.itemId;
        return this.actor.deleteOwnedItem(itemId);
    }

    _onItemShow(event)
    {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".actor-item").dataset.itemId;
        let item = this.actor.getOwnedItem(itemId);

        item.sheet.render(true);
    }

    _onItemEquip(event)
    {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".actor-item").dataset.itemId;
        let item = this.actor.getOwnedItem(itemId);

        return this.actor.updateOwnedItem(this._toggleEquipped(itemId, item));
    }

    _toggleEquipped(id, item) {
        return {
            _id: id,
            data: {
                equipped: !item.data.data.equipped,
            },
        };
    }
}
