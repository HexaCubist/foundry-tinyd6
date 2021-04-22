export function localizeAll(objectToLocalize)
{
    return Object.keys(objectToLocalize).reduce((i18nCfg, key) => {
            i18nCfg[key] = game.i18n.localize(objectToLocalize[key]);
            return i18nCfg;
        }, {}
    );
}
