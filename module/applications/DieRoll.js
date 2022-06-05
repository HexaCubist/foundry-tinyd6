import * as Dice from "../helpers/dice.js";

export default class DieRoll extends FormApplication {
    constructor(options) {
	    super(options);

        Hooks.on('canvasReady', () => {
            this.render(true);
        });
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "die-roller",
            title: game.i18n.localize("tinyd6.system.dieRoller"),
            template: "systems/tinyd6/templates/applications/die-roll.hbs",
            classes: [ "tinyd6", "die-roller", game.settings.get("tinyd6", "theme") ],
            popout: false,
            buttons: [],
        });
    }

    /** @override */
    getData(options)
    {
        const data = super.getData();
        data.config = CONFIG.tinyd6;
        data.config.heritageHeaderPath = `tinyd6.actor.${data.config.theme}.heritage.header`;

        let pos = this.getPos();
        data.pos = pos;
console.log(data);
        return data;
    }

    getPos() {
        this.pos = game.settings.get("tinyd6", "dieRollerPosition");
console.log(this.pos);
        //if (this.pos === null) {
            let hbpos = $('#hotbar').position();
            let width = $('#hotbar').width();
            this.pos = { left: hbpos.left + width + 4, right: '', top: '', bottom: 10 };
            game.settings.set("tinyd6", "dieRollerPosition", this.pos);
        //}

        let result = '';
        if (this.pos != undefined) {
            result = Object.entries(this.pos).filter(k => {
                return k[1] != null;
            }).map(k => {
                return k[0] + ":" + k[1] + 'px';
            }).join('; ');
        }

        return result;
    }

    setPos() {
        this.pos = game.settings.get("tinyd6", "dieRollerPosition");

        if (this.pos == undefined) {
            let hbpos = $('#hotbar').position();
            let width = $('#hotbar').width();
            this.pos = { left: hbpos.left + width + 4, right: '', top: '', bottom: 10 };
            game.user.setFlag("tinyd6", "dieRollerPosition", this.pos);
        }

        log('Setting position', this.pos, this.element);
        $(this.element).css(this.pos);

        return this;
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