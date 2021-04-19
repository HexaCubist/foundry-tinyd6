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
        data.config = CONFIG.tinyd6;
        data.config.heritageHeaderPath = `tinyd6.actor.${data.config.theme}.heritage.header`;

        return data;
    }

    activateListeners(html)
    {
        html.find(".roll-dice").click(this._onDieRoll.bind(this));
        html.find(".toggle-focus").click(this._setFocusAction.bind(this));
        html.find(".toggle-marksman").on('click change', this._setMarksmanTrait.bind(this));

        super.activateListeners(html);
    }
    
    _onDieRoll(event)
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
}