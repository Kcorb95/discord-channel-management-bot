const { Command } = require('commando');
const GuildSettings = require('../../models/GuildSettings');

module.exports = class ClubCategoryCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setmanagersrole',
            group: 'config',
            aliases: ['setmanagers', 'setmanager', 'smr', 'scm', 'setclubmanager', 'setclubmanagers'],
            memberName: 'setmanagersrole',
            description: 'Sets the managers role.',
            guildOnly: true,
            ownerOnly: true,
            args: [
                {
                    key: 'managers',
                    prompt: 'What is the ID of the role for club managers?\n',
                    type: 'role'
                }
            ]
        });
    }

    async run(msg, { managers }) {
        const settings = await GuildSettings.findOne({ where: { guildID: msg.guild.id } }) || await GuildSettings.create({ guildID: msg.guild.id });
        let id = settings.managersID;
        id = managers.id;
        settings.managersID = id;
        await settings.save().catch(this.client.log.error);
        return msg.reply(`I have successfully set ${managers} as the role for club managers.`);
    }
};