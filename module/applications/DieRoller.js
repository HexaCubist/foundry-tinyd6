import * as Dice from "../helpers/dice.js";
import { TinyD6System } from "../tinyd6.js";

export default class DieRoller extends FormApplication {
    constructor(options) {
	    super(options);

        console.log("tinyd6 | building DieRoller");
        //game.user.setFlag(TinyD6System.SYSTEM, "dieRollerPosition", null);
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "die-roller",
            title: game.i18n.localize("tinyd6.system.dieRoller"),
            template: "systems/tinyd6/templates/applications/die-roll.hbs",
            classes: [ TinyD6System.SYSTEM, "die-roller", game.settings.get(TinyD6System.SYSTEM, "theme") ],
            popout: false,
            buttons: [],
        });
    }

    /** @override */
    getData(options)
    {
        console.log("tinyd6 | getData");
        const data = super.getData();
        //console.log(data);

        data.config = CONFIG.tinyd6;
        data.config.heritageHeaderPath = `tinyd6.actor.${data.config.theme}.heritage.header`;

        //let pos = this.getPos();
        //console.log("tinyd6 | getData", pos);        
        //data.pos = pos;
        this.setPos();
    
        return data;
    }

    getPos() {
        this.pos = game.user.getFlag(TinyD6System.SYSTEM, "dieRollerPosition");

        if ((this.pos === null) || (this.pos.length === 0)) {
            let hbpos = $('#hotbar').position();
            let width = $('#hotbar').width();
            this.pos = { left: hbpos.left + width + 4, right: '', top: '', bottom: 110 };

            game.user.setFlag(TinyD6System.SYSTEM, "dieRollerPosition", this.pos);
        }

        console.log("tinyd6 | getting position", this.pos);

        let result = '';
        if (this.pos != undefined) {
            result = Object.entries(this.pos).filter(k => {
                return (''+ k[1]) !== '';
            }).map(k => {
                return k[0] + ":" + k[1] + ((''+ k[1]).indexOf('px') > 1 ? '' : 'px');
            }).join('; ') + ';';
        }

        return result;
    }

    setPos() {
        console.log("tinyd6 | setting position", this.pos);

        let cssPosition = this.getPos();
        let position = this.pos;
        // if ((position === null) || (position.length === 0)) {
        //     this.getPos();
        //     position = game.user.getFlag(TinyD6System.SYSTEM, "dieRollerPosition");
        // }

        $(this.element).css(cssPosition);
        
        this.position.left = position.left || null;
        if (this.position.left) { Math.round(this.position.left); }

        if (position.bottom) {
            this.position.top = Math.round(window.innerHeight - position.bottom);
        } else if (position.top) {
            this.position.top = Math.round(position.top);
        }

        return this;
    }

    activateListeners(html)
    {
        console.log("tinyd6 | activating listeners");
        //console.log("tinyd6 | html", html.find(".toggle-marksman"));

        html.find(".roll-dice").on('click', this._onDieRoll.bind(this));
        html.find(".toggle-focus").on('click', this._setFocusAction.bind(this));
        html.find(".toggle-marksman").on('click', this._setMarksmanTrait.bind(this));
        html.find(".toggle-marksman").on('change', this._setMarksmanTrait.bind(this));

        let elmnt = html.find("#die-roller-move-handle");
        let dieRoller = elmnt.closest('.window-app');
        //console.log("tinyd6 | element", dieRoller);
        let newPosX = 0, newPosY = 0, startPosX = 0, startPosY = 0;

        elmnt.on("mousedown", e => {
            e = e || window.event;
            e.preventDefault();
    
            // get the starting position of the cursor
            startPosX = e.clientX;
            startPosY = e.clientY;

            // Set settings if they don't exist
        
            dieRoller[0].style = dieRoller[0].style ?? { top: (''+ math.round(startPosY) + 'px'), left: (''+ Math.round(startPosX) + 'px') };
            //console.log("tinyd6 | element", dieRoller[0].style);

            document.onmousemove = mouseMove;
            document.onmouseup = () => {
                this.pos = { top: newPosY, left: newPosX };
                game.user.setFlag(TinyD6System.SYSTEM, 'dieRollerPosition', this.pos);

                document.onmousemove = null;
                document.onmouseup = null;
            };

        });

        let mouseMove = e => {
            e = e || window.event;

            // calculate the new position
            newPosX = startPosX - e.movementX;
            newPosY = startPosY - e.movementY;

            // with each move we also want to update the start X and Y
            startPosX = e.clientX;
            startPosY = e.clientY;
        
            // set the element's new position:
            dieRoller[0].style.top = ''+ newPosY + "px";
            dieRoller[0].style.left = ''+ newPosX + "px";
        };

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

        //TinyD6System.emit('dieRoll', rollData);
        Dice.RollTest(rollData);
    }

    _setFocusAction(event)
    {
        const element = event.currentTarget;
        //console.log("tinyd6 | _setFocusAction", element);

        const form = $(element.closest("form"));
        Dice.setFocusOption(form, element);
    }

    _setMarksmanTrait(event)
    {
        const element = event.currentTarget;
        //console.log("tinyd6 | _setMarksmanTrait", element);

        const form = $(element.closest("form"));
        Dice.setMarksmanOption(form, element);
    }
}