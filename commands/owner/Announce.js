const { Command } = require('commando');
module.exports = class AnnounceCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'announce',
            aliases: ['say', 'send'],
            group: 'owner',
            memberName: 'announce',
            description: 'Makes Yuudachi echo a message to a specified channel',
            details: `Makes Yuudachi echo a message to a specified channel`,
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3
            },
            args: [
                {
                    key: 'channel',
                    prompt: 'what channel should this be sent to?\n',
                    type: 'channel'
                },
                {
                    key: 'text',
                    prompt: 'what text should be echoed?\n',
                    type: 'string'
                }
            ]
        });
    }

    hasPermission(msg) {
        return msg.author.id === this.client.options.owner;
    }

    async run(msg, args) {
        msg.guild.channels.get(args.channel.id).send(args.text);
    }
};