const { Command } = require('commando');
const Club = require('../../structures/club/Club');

module.exports = class PromoteClubStaffCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'toggle-club-privacy',
            aliases: ['setclubprivacy', 'scp', 'privacy', 'toggleprivacy', 'tcp', 'toggleclubprivacy'],
            group: 'management',
            memberName: 'set-club-privacy',
            description: 'Promotes a club user to club staff.',
            details: `Promotes a club user to club staff.`,
            guildOnly: true,
            args: [
                {
                    key: 'clubIdentifier',
                    prompt: 'What is the channel for the club that you are trying to manage?\n',
                    type: 'channel'
                }
            ]
        });
    }

    async run(msg, { clubIdentifier }) {
        // Find club
        const club = Club.getClub(msg.guild.id, clubIdentifier.toString());
        if (!club) return msg.reply('`Error: Club Not Found! Please verify the code or name of the club provided.`').then(reply => {
            msg.delete({ timeout: 5000 });
            reply.delete({ timeout: 5000 });
        });
        // Check if user has permission to do this
        if (club.clubOwner !== msg.member.id) return msg.reply('`Error: You do not have permission to do this!`').then(reply => {
            msg.delete({ timeout: 5000 });
            reply.delete({ timeout: 5000 });
        });
        await Club.toggleClubPrivacy(msg.guild, club);
        return msg.reply(`Club is now ${club.clubPrivate ? '**Invite Only!**' : '**Open!**'}`).then(reply => {
            msg.delete({ timeout: 5000 });
            reply.delete({ timeout: 5000 });
        });
    }
};