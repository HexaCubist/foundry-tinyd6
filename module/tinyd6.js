import { tinyd6 } from "./config.js";
import TinyD6ItemSheet from "./sheets/TinyD6ItemSheet.js";
import TinyD6HeroSheet from "./sheets/TinyD6HeroSheet.js";
import TinyD6NpcSheet from "./sheets/TinyD6NpcSheet.js";
import DieRoll from "./applications/DieRoll.js";
import { localizeAll } from "./helpers/utils.js";

async function preloadHandlebarsTemplates() {
    const templatePaths = [
        "systems/tinyd6/templates/partials/trait-block.hbs",
        "systems/tinyd6/templates/partials/roll-bar.hbs",
        "systems/tinyd6/templates/partials/inventory-card.hbs"
    ];

    return loadTemplates(templatePaths);
};

async function displayFloatingDieRollApplication() {
    new DieRoll(DieRoll.defaultOptions, { excludeTextLabels: true }).render(true);
}

function registerGameSettings()
{
    game.settings.register("tinyd6", "theme", {
        name: game.i18n.localize("tinyd6.settings.theme.name"),
        hint:  game.i18n.localize("tinyd6.settings.theme.hint"),
        scope: "world",
        config: false,
        choices: localizeAll(CONFIG.tinyd6.themes),
        default: "tiny-cthulhu",
        type: String
    });

    game.settings.register("tinyd6", "enableCorruption", {
        name: game.i18n.localize("tinyd6.settings.enableCorruption.name"),
        hint:  game.i18n.localize("tinyd6.settings.enableCorruption.hint"),
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("tinyd6", "enableAdvancement", {
        name: game.i18n.localize("tinyd6.settings.enableAdvancement.name"),
        hint:  game.i18n.localize("tinyd6.settings.enableAdvancement.hint"),
        scope: "world",
        config: true,
        choices: localizeAll(CONFIG.tinyd6.advancementMethods),
        default: "none",
        type: String
    });

    game.settings.register("tinyd6", "enableItemTracking", {
        name: game.i18n.localize("tinyd6.settings.enableItemTracking.name"),
        hint:  game.i18n.localize("tinyd6.settings.enableItemTracking.hint"),
        scope: "world",
        config: false,
        default: false,
        type: Boolean
    });

    game.settings.register("tinyd6", "enableDepletionPoints", {
        name: game.i18n.localize("tinyd6.settings.enableDepletionPoints.name"),
        hint:  game.i18n.localize("tinyd6.settings.enableDepletionPoints.hint"),
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("tinyd6", "enableVariableWeaponDamage", {
        name: game.i18n.localize("tinyd6.settings.enableVariableWeaponDamage.name"),
        hint:  game.i18n.localize("tinyd6.settings.enableVariableWeaponDamage.hint"),
        scope: "world",
        config: false,
        default: false,
        type: Boolean
    });

    game.settings.register("tinyd6", "enableCriticalHits", {
        name: game.i18n.localize("tinyd6.settings.enableCriticalHits.name"),
        hint:  game.i18n.localize("tinyd6.settings.enableCriticalHits.hint"),
        scope: "world",
        config: false,
        default: false,
        type: Boolean
    });

    game.settings.register("tinyd6", "enableDamageReduction", {
        name: game.i18n.localize("tinyd6.settings.enableDamageReduction.name"),
        hint:  game.i18n.localize("tinyd6.settings.enableDamageReduction.hint"),
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });
}

Hooks.once("init", () => {
    console.log("tinyd6 | Initializing Tiny D6 system");

    CONFIG.tinyd6 = tinyd6;
    // CONFIG.debug.hooks = true;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("tinyd6", TinyD6HeroSheet, { makeDefault: true });
    Actors.registerSheet("tinyd6", TinyD6NpcSheet);

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("tinyd6", TinyD6ItemSheet, { makeDefault: true });

    registerGameSettings();
    preloadHandlebarsTemplates();

    Handlebars.registerHelper("times", function(n, content)
    {
        let result = "";
        for (let i = 0; i < n; ++i)
        {
            result += content.fn(i);
        }

        return result;
    });

    Handlebars.registerHelper("face", function(value, content)
    {
        switch (value)
        {
            case 1:
                return "fa-dice-one";
            case 2:
                return "fa-dice-two";
            case 3:
                return "fa-dice-three";
            case 4:
                return "fa-dice-four";
            case 5:
                return "fa-dice-five";
            case 6:
                return "fa-dice-six";
        }

        return "fa-dice-d6";
    });
});

Hooks.once("setup", event => {
    displayFloatingDieRollApplication();
});

Hooks.on("createOwnedItem", (actor, item) => {
    console.log("tinyd6 | handling owned item");

    if (item.type === "heritage")
    {
        actor.update({
            _id: actor._id,
            data: {
                wounds: {
                    max: item.data.startingHealth
                },
                corruptionThreshold: {
                    max: item.data.corruptionThreshold
                }
            }
        });
    }
});
