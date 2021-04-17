export function RollTest({
    numberOfDice = 2,
    threshold = 5 } = {}) {
    let rollForumla = `${numberOfDice}d6cs>=${threshold}`;
    
    const rollData = {
        actionValue: "Test"
    };

    const messageData = {
        speaker: ChatMessage.getSpeaker()
    };

    new Roll(rollForumla, rollData).roll().toMessage(messageData);
}