const { Command } = require('commando');
const GuildSettings = require('../../models/GuildSettings');

module.exports = class ClubCategoryCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setclubcategory',
            group: 'config',
            aliases: ['setcategory', 'setcat'],
            memberName: 'setclubcategory',
            description: 'Sets the category for clubs.',
            guildOnly: true,
            ownerOnly: true,
            args: [
                {
                    key: 'categoryID',
                    prompt: 'What is the ID of the category for clubs?\n',
                    type: 'string'
                }
            ]
        });
    }

    async run(msg, { categoryID }) {
        const settings = await GuildSettings.findOne({ where: { guildID: msg.guild.id } }) || await GuildSettings.create({ guildID: msg.guild.id });
        const channel = await msg.guild.channels.get(categoryID);
        if (!channel) return msg.reply(`Error: Please check provided category ID`);
        let category = settings.clubCategoryID;
        category = channel.id;
        settings.clubCategoryID = category;
        await settings.save().catch(this.client.log.error);
        return msg.reply(`I have successfully set ${channel} as the destination category for clubs.`);
    }
};