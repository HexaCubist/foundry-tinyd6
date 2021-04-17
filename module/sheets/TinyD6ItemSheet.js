export default class TinyD6ItemSheet extends ItemSheet {
    get template() {
        console.log(this.entity);
        return `systems/tinyd6/templates/sheets/${this.entity.data.type}-sheet.hbs`;
    }

    getData() {
        const data = super.getData();
        data.traits = {};

        console.log(data);
        data.config = CONFIG.tinyd6;

        return data;
    }
}