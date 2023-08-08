const { Command } = require('commando');
const Club = require('../../structures/club/Club');

module.exports = class ClubInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'info',
            aliases: ['clubinfo', 'ci', 'club'],
            group: 'util',
            memberName: 'info',
            description: 'Get info on a club.',
            details: `Get detailed information on the specified club.`,
            guildOnly: true,
            args: [
                {
                    key: 'clubIdentifier',
                    prompt: 'What is the club you wish to view? (Name or clubID)\n',
                    type: 'string'
                }
            ]
        });
    }

    async run(msg, { clubIdentifier }) {
        // Find club
        const club = Club.getClub(msg.guild.id, clubIdentifier);
        if (!club) return msg.reply('`Error: Club Not Found! Please verify the code or name of the club provided.`').then(reply => {
            msg.delete({ timeout: 5000 });
            reply.delete({ timeout: 5000 });
        });
        const clubOwner = await msg.guild.members.get(club.clubOwner);
        const embed = await new this.client.methods.Embed()
            .setAuthor(`To Join this club, use ${this.client.commandPrefix}join ${club.clubID}`, this.client.user.displayAvatarURL())
            .addField(`Club Name`, `${club.clubName}`, true)
            .addField(`Join Code`, `${club.clubID}`, true)
            .addField(`Club Availability`, `${club.clubPrivate ? 'Invite Only' : 'Open!'}`, true)
            .addField(`Club Owner`, `${clubOwner}`, true)
            .addField(`Staff`, `${club.clubStaff.length}`, true)
            .addField(`Members`, `${club.clubMembers.length}`, true)
            .addField(`Main Channel`, `${await msg.guild.channels.get(club.clubChannels[0])}`)
            .setThumbnail(clubOwner.user.displayAvatarURL())
            .setColor(`#654DCF`)
            .setFooter(`Check out A-SS Premium to unlock some super cool features!`, `https://i.imgur.com/hkLEp1b.png`);

        msg.channel.send(embed);
    }
};