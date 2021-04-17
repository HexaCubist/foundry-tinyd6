import {tinyd6} from "./config.js";
import TinyD6ItemSheet from "./sheets/TinyD6ItemSheet.js";
import TinyD6HeroSheet from "./sheets/TinyD6HeroSheet.js";
import TinyD6NpcSheet from "./sheets/TinyD6NpcSheet.js";
import DieRoll from "./applications/DieRoll.js";

async function preloadHandlebarsTemplates() {
    const templatePaths = [
        "systems/tinyd6/templates/partials/trait-block.hbs",
        "systems/tinyd6/templates/partials/roll-bar.hbs"
    ];

    return loadTemplates(templatePaths);
};

async function displayFloatingDieRollApplication() {
    new DieRoll(DieRoll.defaultOptions, {}).render(true);
}

function registerGameSettings()
{
    game.settings.register("tinyd6", "theme", {
        name: game.i18n.localize("tinyd6.settings.theme.name"),
        hint:  game.i18n.localize("tinyd6.settings.theme.hint"),
        scope: "world",
        config: false,
        default: "tiny-cthulhu",
        type: String
    })
}

Hooks.once("init", () => {
    console.log("tinyd6 | Initializing Tiny D6 system");

    CONFIG.tinyd6 = tinyd6;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("tinyd6", TinyD6HeroSheet, { makeDefault: true });
    Actors.registerSheet("tinyd6", TinyD6NpcSheet);

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("tinyd6", TinyD6ItemSheet, { makeDefault: true });

    registerGameSettings();

    preloadHandlebarsTemplates();
    //displayFloatingDieRollApplication();
    
    Handlebars.registerHelper("times", function(n, content)
    {
        let result = "";
        for (let i = 0; i < n; ++i)
        {
            result += content.fn(i);
        }

        return result;
    });
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
                corruptionThreshold: item.data.corruptionThreshold
            }
        });
    }
});
