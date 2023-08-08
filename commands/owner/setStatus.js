const { Command } = require('commando');
module.exports = class setStatusCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setstatus',
            aliases: ['status'],
            group: 'owner',
            memberName: 'setstatus',
            description: 'Changes the bot\'s status.',
            details: 'Changes the bot\'s status.',
            guildOnly: true,
            ownerOnly: true,
            args: [
                {
                    key: 'text',
                    prompt: 'what text should be used?\n',
                    type: 'string'
                }
            ]
        });
    }

    async run(msg, { text }) {
        this.client.user.setActivity(`${text}`);
    }
};