const { Command } = require('commando');
module.exports = class PlanAdCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'planad',
            aliases: ['planadvert', 'postad', 'postadvert'],
            group: 'owner',
            memberName: 'planad',
            description: 'Schedules an advertisement to be posted in a specific channel every X amount of hours.',
            details: `Schedules an advertisement to be posted in a specific channel every X amount of hours.`,
            guildOnly: true,
            ownerOnly: true,
            args: [
                {
                    key: 'text',
                    prompt: 'What is the advert to be posted?\n',
                    type: 'string'
                },
                {
                    key: 'channel',
                    prompt: 'What channel should this ad be posted?\n',
                    type: 'channel'
                },
                {
                    key: 'time',
                    prompt: 'This should be posted every how many hours?\n',
                    type: 'string'
                }
            ]
        });
    }

    async run(msg, { text, channel, time }) {
        await channel.send(`${text}`);
        const postMessage = async () => {
            await channel.send(`${text}`);
        };
        setInterval(() => postMessage(), time * 60 * 60 * 1000);
    }
};