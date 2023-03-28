import { registerGameSettings } from "./settings.js";
import { tinyd6 } from "./config.js";
import TinyD6ItemSheet from "./sheets/TinyD6ItemSheet.js";
import TinyD6HeroSheet from "./sheets/TinyD6HeroSheet.js";
import TinyD6NpcSheet from "./sheets/TinyD6NpcSheet.js";
import DieRoller from "./applications/DieRoller.js";
import * as Dice from "./helpers/dice.js";

export class TinyD6System {
  static SYSTEM = "tinyd6";
  static SOCKET = "system.tinyd6";

  static init() {
    console.log("tinyd6 | Initializing Tiny D6 system");

    CONFIG.tinyd6 = tinyd6;
    // CONFIG.debug.hooks = true;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet(TinyD6System.SYSTEM, TinyD6HeroSheet, {
      makeDefault: true,
      types: ["hero"],
    });
    Actors.registerSheet(TinyD6System.SYSTEM, TinyD6NpcSheet, {
      types: ["npc"],
    });

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet(TinyD6System.SYSTEM, TinyD6ItemSheet, {
      makeDefault: true,
    });

    registerGameSettings();
    this._preloadHandlebarsTemplates();

    Handlebars.registerHelper("times", function (n, content) {
      let result = "";
      for (let i = 0; i < n; ++i) {
        result += content.fn(i);
      }

      return result;
    });

    Handlebars.registerHelper("face", Dice.diceToFaces);
  }

  static ready() {
    console.log("tinyd6 | ready");
    //game.socket.on(TinyD6System.SOCKET, TinyD6System.onMessage);
    TinyD6System.displayFloatingDieRollerApplication();
  }

  static async displayFloatingDieRollerApplication() {
    new DieRoller(DieRoller.defaultOptions, { excludeTextLabels: true }).render(
      true
    );
  }

  static async _preloadHandlebarsTemplates() {
    const templatePaths = [
      "systems/tinyd6/templates/partials/trait-block.hbs",
      "systems/tinyd6/templates/partials/roll-bar.hbs",
      "systems/tinyd6/templates/partials/item-header.hbs",
      "systems/tinyd6/templates/partials/inventory-card.hbs",
    ];

    return loadTemplates(templatePaths);
  }

  static emit(action, args = {}) {
    console.log(action, TinyD6System.SOCKET);
    args.action = action;
    args.senderId = game.user.id;
    game.socket.emit(TinyD6System.SOCKET, args, (resp) => {
      console.log(resp);
    });
  }

  static onMessage(data) {
    switch (data.action) {
      case "dieRoll":
        {
          Dice.RollTest(data);
        }
        break;
    }
  }
}

Hooks.once("init", () => {
  TinyD6System.init();
});

Hooks.on("ready", TinyD6System.ready);

Hooks.on("createItem", (item, temporary) => {
  console.log("tinyd6 | handling owned item");

  console.log("ACTOR:", item.actor);
  console.log("ITEM:", item);

  if (item.type === "heritage") {
    item.actor.system.update({
      _id: item.actor._id,
      system: {
        wounds: {
          value: item.system.startingHealth,
          max: item.system.startingHealth,
        },
        corruptionThreshold: {
          value: 0,
          max: item.system.corruptionThreshold,
        },
      },
    });
  }
});
