const { Command } = require('commando');
const Club = require('../../structures/club/Club');

module.exports = class LeaveClubCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'leave-club',
            aliases: ['leave'],
            group: 'management',
            memberName: 'leave-club',
            description: 'Leave a Club!',
            details: `Leave a Club!`,
            guildOnly: true,
            args: [
                {
                    key: 'clubIdentifier',
                    prompt: 'Enter the clubID for the club you wish to leave.\n',
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
        // Check if user is part of club
        if (!club.clubMembers.includes(msg.member.id)) return msg.reply('`Error: You are not part of this club!`').then(reply => {
            msg.delete({ timeout: 5000 });
            reply.delete({ timeout: 5000 });
        });
        if (club.clubStaff.includes(msg.member.id)) await Club.demoteUser(msg.guild, club.clubID, msg.member).catch(e => msg.reply(e.message));
        await Club.removeUser(msg.guild, club.clubID, msg.member).catch(e => msg.reply(e.message));

        return msg.reply(`Club ${club.clubName} left!`).then(reply => {
            msg.delete({ timeout: 5000 });
            reply.delete({ timeout: 5000 });
        });
    }
};