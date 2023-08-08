const { Command } = require('commando');
const Club = require('../../structures/club/Club');

module.exports = class PromoteClubStaffCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'promote-club-staff',
            aliases: ['promote'],
            group: 'management',
            memberName: 'promote-club-staff',
            description: 'Promotes a club user to club staff.',
            details: `Promotes a club user to club staff.`,
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'Who are you trying to promote?\n',
                    type: 'member'
                },
                {
                    key: 'clubIdentifier',
                    prompt: 'What is the channel for the club that you are trying to manage?\n',
                    type: 'channel'
                }
            ]
        });
    }

    async run(msg, { member, clubIdentifier }) {
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
        // Check if User is in club
        if (club.clubStaff.includes(member.id)) return msg.reply('`Error: This person is already staff in this club!`').then(reply => {
            msg.delete({ timeout: 5000 });
            reply.delete({ timeout: 5000 });
        });
        // Check if user is part of club
        if (!club.clubMembers.includes(member.id)) return msg.reply('`Error: This user is not a member of this club!\nPlease make sure they have joined the club first.`').then(reply => {
            msg.delete({ timeout: 5000 });
            reply.delete({ timeout: 5000 });
        });
        await Club.promoteUser(msg.guild, club.clubID, member);
        return msg.reply(`${member} promoted!`).then(reply => {
            msg.delete({ timeout: 5000 });
            reply.delete({ timeout: 5000 });
        });
    }
};