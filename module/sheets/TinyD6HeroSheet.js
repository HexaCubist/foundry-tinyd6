import TinyD6ActorSheet from "./TinyD6ActorSheet.js";
import * as Dice from "../helpers/dice.js";

export default class TinyD6HeroSheet extends TinyD6ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/tinyd6/templates/sheets/hero-sheet.hbs",
            classes: [ "tinyd6", "sheet", "hero", game.settings.get("tinyd6", "theme") ]
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
        html.find(".corruption-box").on('click change', this._setCurrentCorruption.bind(this));
        html.find(".advancement-progress-box").on('click change', this._setAdvancementProgress.bind(this));

        super.activateListeners(html);
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
        const currentDamage = parseInt(this.actor.data.data.wounds.value ?? 0);
        if (element.checked)
        {
            this.actor.update({
                _id: this.actor._id,
                data: {
                    wounds: {
                        value: (currentDamage + 1)
                    },
                    advancement: {
                        max: 3
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

    _setCurrentCorruption(event)
    {
        event.preventDefault();

        const element = event.currentTarget;
        const currentCorruption = parseInt(this.actor.data.data.corruptionThreshold.value ?? 0);
        console.log(currentCorruption);
        if (element.checked)
        {
            this.actor.update({
                _id: this.actor._id,
                data: {
                    corruptionThreshold: {
                        value: (currentCorruption + 1)
                    }
                }
            });
        }
        else if (currentCorruption > 0)
        {
            this.actor.update({
                _id: this.actor._id,
                data: {
                    corruptionThreshold: {
                        value: (currentCorruption - 1)
                    }
                }
            });
        }
    }

    _setAdvancementProgress(event)
    {
        event.preventDefault();

        const element = event.currentTarget;
        const currentProgress = parseInt(this.actor.data.data.advancement.value ?? 0);
        console.log(currentProgress);
        if (element.checked)
        {
            this.actor.update({
                _id: this.actor._id,
                data: {
                    advancement: {
                        value: (currentProgress + 1)
                    }
                }
            });
        }
        else if (currentProgress > 0)
        {
            this.actor.update({
                _id: this.actor._id,
                data: {
                    advancement: {
                        value: (currentProgress - 1)
                    }
                }
            });
        }
    }
}