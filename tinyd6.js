import {tinyd6} from "./module/config.js";
import TinyD6ItemSheet from "./module/sheets/TinyD6ItemSheet.js";
import TinyD6HeroSheet from "./module/sheets/TinyD6HeroSheet.js";
import TinyD6NpcSheet from "./module/sheets/TinyD6NpcSheet.js";

async function preloadHandlebarsTemplates() {
    const templatePaths = [
        "systems/tinyd6/templates/partials/trait-block.hbs",
        "systems/tinyd6/templates/partials/roll-bar.hbs"
    ];

    return loadTemplates(templatePaths);
};

Hooks.once("init", () => {
    console.log("tinyd6 | Initializing Tiny D6 system");

    CONFIG.tinyd6 = tinyd6;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("tinyd6", TinyD6HeroSheet, { makeDefault: true });
    Actors.registerSheet("tinyd6", TinyD6NpcSheet);

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("tinyd6", TinyD6ItemSheet, { makeDefault: true });

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
});