const { Command } = require('commando');
const { stripIndents } = require('common-tags');

module.exports = class DonateCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'donate',
            group: 'util',
            memberName: 'donate',
            description: 'Support development and hosting for this bot!',
            details: `Support development and hosting for this bot!`,
            guildOnly: true
        });
    }

    async run(msg, args) {
        const embed = await new this.client.methods.Embed()
            .setTitle(`Donate to support development and hosting for all A-SS Bots`)
            .setColor('#8B008B')
            .setDescription(stripIndents`
                The development for all A-SS bots is entirely funded by the support from people like you. Any amount helps!
                Without people like you, these bots would never be able to be public or perform so well.
               
                If you would like to contribute to the development of these bots, feel free to contribute here:
                <https://www.patreon.com/a_ss>`)
            .setTimestamp(new Date())
            .setFooter(this.client.user.username, this.client.user.displayAvatarURL());
        msg.channel.send(embed);
    }
};