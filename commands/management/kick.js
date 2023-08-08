const { Command } = require('commando');
const Club = require('../../structures/club/Club');

module.exports = class KickFromClubCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'kick-from-club',
            aliases: ['kick'],
            group: 'management',
            memberName: 'kick-from-club',
            description: 'Kick a user from a Club!',
            details: `Kick a user from a Club!`,
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'Who are you trying to kick?\n',
                    type: 'member'
                },
                {
                    key: 'clubIdentifier',
                    prompt: 'Enter the clubID for the club you wish to kick this user from.\n',
                    type: 'string'
                }
            ]
        });
    }

    async run(msg, { member, clubIdentifier }) {
        // Find club
        const club = Club.getClub(msg.guild.id, clubIdentifier);
        if (!club) return msg.reply('`Error: Club Not Found! Please verify the code or name of the club provided.`').then(reply => {
            msg.delete({ timeout: 5000 });
            reply.delete({ timeout: 5000 });
        });
        // Check if user has permission to kick
        if (!club.clubStaff.includes(msg.member.id)) return msg.reply('`Error: You do not have permission to do this!`').then(reply => {
            msg.delete({ timeout: 5000 });
            reply.delete({ timeout: 5000 });
        });
        // Check if user is part of club
        if (!club.clubMembers.includes(member.id)) return msg.reply('`Error: This user is not a member of this club!`').then(reply => {
            msg.delete({ timeout: 5000 });
            reply.delete({ timeout: 5000 });
        });
        if (club.clubStaff.includes(member.id)) await Club.demoteUser(msg.guild, club.clubID, member).catch(e => msg.reply(e.message));
        await Club.removeUser(msg.guild, club.clubID, member);

        return msg.reply(`${member} kicked!`).then(reply => {
            msg.delete({ timeout: 5000 });
            reply.delete({ timeout: 5000 });
        });
    }
};