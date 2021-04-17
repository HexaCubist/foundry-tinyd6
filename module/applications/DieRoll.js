import * as Dice from "../helpers/dice.js";

export default class DieRoll extends FormApplication {
    static get defaultOptions() {
        console.log("TEST");
        return mergeObject(super.defaultOptions, {
            title: game.i18n.localize("tinyd6.system.dieRoller"),
            template: "systems/tinyd6/templates/applications/die-roll.hbs",
            classes: [ "tinyd6", "die-roller", game.settings.get("tinyd6", "theme") ]
        });
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