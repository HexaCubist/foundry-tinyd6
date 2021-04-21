import TinyD6ActorSheet from "./TinyD6ActorSheet.js";
import * as Dice from "../helpers/dice.js";

export default class TinyD6HeroSheet extends TinyD6ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/tinyd6/templates/sheets/hero-sheet.hbs",
            classes: [ "tinyd6", "sheet", "hero", CONFIG.tinyd6.theme ]
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

    activateListeners(html)
    {
        html.find(".toggle-focus").click(this._setFocusAction.bind(this));
        html.find(".toggle-marksman").on('click change', this._setMarksmanTrait.bind(this));
        html.find(".health-box").on('click change', this._setCurrentDamage.bind(this));
        html.find(".increase-max-health").click(this._incrementMaxHealth.bind(this));

        super.activateListeners(html);
    }

    _incrementMaxHealth(event)
    {
        const currentMaxHealth = parseInt(this.actor.data.data.wounds.max);
        if (event.altKey)
        {
            this.actor.update({
                _id: this.actor._id,
                data: {
                    wounds: {
                        max: (currentMaxHealth - 1)
                    }
                }
            });
        }
        else
        {
            this.actor.update({
                _id: this.actor._id,
                data: {
                    wounds: {
                        max: (currentMaxHealth + 1)
                    }
                }
            });
        }
    }

    _setFocusAction(event)
    {
        const element = event.currentTarget;

        const form = $(element.closest("form"));
        Dice.setFocusOption(form, element);
    }

    _setMarksmanTrait(event)
    {
        const element = event.currentTarget;

        const form = $(element.closest("form"));
        Dice.setMarksmanOption(form, element);
    }

    _setCurrentDamage(event)
    {
        event.preventDefault();
        
        const element = event.currentTarget;
        const currentDamage = parseInt(this.actor.data.data.wounds.value);
        if (element.checked)
        {
            this.actor.update({
                _id: this.actor._id,
                data: {
                    wounds: {
                        value: (currentDamage + 1)
                    }
                }
            });
        }
        else if (currentDamage > 0)
        {
            this.actor.update({
                _id: this.actor._id,
                data: {
                    wounds: {
                        value: (currentDamage - 1)
                    }
                }
            });
        }
    }
}