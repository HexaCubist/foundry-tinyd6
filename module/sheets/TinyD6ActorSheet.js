export default class TinyD6ActorSheet extends ActorSheet {
    getData() {
        const data = super.getData();

        data.config = CONFIG.tinyd6;
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

    _onDieRoll(event)
    {
        event.preventDefault();
        //TODO: Send die roll to chat
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
        let itemId = element.closest(".actor-item").dataset.itemId;
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
