const { Command } = require('commando');
const GuildSettings = require('../../models/GuildSettings');

module.exports = class ClubCategoryCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setbotsrole',
            group: 'config',
            aliases: ['setbots', 'setbotrole', 'sbr'],
            memberName: 'setbotsrole',
            description: 'Sets the bots role.',
            guildOnly: true,
            ownerOnly: true,
            args: [
                {
                    key: 'bots',
                    prompt: 'What is the ID of the role for bots?\n',
                    type: 'role'
                }
            ]
        });
    }

    async run(msg, { bots }) {
        const settings = await GuildSettings.findOne({ where: { guildID: msg.guild.id } }) || await GuildSettings.create({ guildID: msg.guild.id });
        let id = settings.botsID;
        id = bots.id;
        settings.botsID = id;
        await settings.save().catch(this.client.log.error);
        return msg.reply(`I have successfully set ${bots} as the role for bots.`);
    }
};