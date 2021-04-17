import * as Dice from "../helpers/dice.js";

export default class DieRoll extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            title: game.i18n.localize("tinyd6.system.dieRoller"),
            template: "systems/tinyd6/templates/applications/die-roll.hbs",
            classes: [ "tinyd6", "die-roller", game.settings.get("tinyd6", "theme") ]
        });
    }

    getData()
    {
        const data = super.getData();
console.log(data);
        data.config = CONFIG.tinyd6;
        data.config.heritageHeaderPath = `tinyd6.actor.${data.config.theme}.heritage.header`;

        return data;
    }

    activateListeners(html)
    {
        html.find(".roll-dice").click(this._onDieRoll.bind(this));

        super.activateListeners(html);
    }
    
    _onDieRoll(event)
    {
        event.preventDefault();
        const element = event.currentTarget;

        Dice.RollTest({ numberOfDice: element.dataset.diceX, threshold: element.dataset.threshold })
    }
}