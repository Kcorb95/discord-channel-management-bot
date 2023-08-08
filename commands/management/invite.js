const { Command } = require('commando');
const Club = require('../../structures/club/Club');
const { stripIndents } = require('common-tags');

module.exports = class InviteToClubCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'invite-to-club',
            aliases: ['invite'],
            group: 'management',
            memberName: 'invite-to-club',
            description: 'Invite a user to a Club!',
            details: `Invite a user to a Club!`,
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'Who would you like to invite to this club?\n',
                    type: 'member'
                },
                {
                    key: 'clubIdentifier',
                    prompt: 'Enter the clubID for the club that you would like to invite this user to.\n',
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
        // Check if user has permission to invite
        if (!club.clubStaff.includes(msg.member.id)) return msg.reply('`Error: You do not have permission to do this!`').then(reply => {
            msg.delete({ timeout: 5000 });
            reply.delete({ timeout: 5000 });
        });
        // Check if User is in club
        if (club.clubMembers.includes(member.id)) return msg.reply('`Error: This person is already in this club!`').then(reply => {
            msg.delete({ timeout: 5000 });
            reply.delete({ timeout: 5000 });
        });
        const channel = await msg.guild.channels.get(club.clubInviteChannel !== null ? club.clubInviteChannel : club.clubChannels[0]);
        // If not in club, send request to join
        const message = await member.send(stripIndents`Hey!
        
        ${member} invites you to join club **${club.clubName}** in **${msg.guild.name}**!
        React to accept/reject this request!
        `);
        await message.react('✅');
        await message.react('❌');
        let approved;
        const filter = (reaction, user) => !user.bot && (reaction.emoji.name === '✅' || reaction.emoji.name === '❌') && user.id === member.id;
        const collector = message.createReactionCollector(filter, { time: 8 * 60 * 60 * 1000 });
        collector.on('collect', reaction => {
            if (reaction.emoji.name === '✅')
                approved = true;
            else if (reaction.emoji.name === '❌')
                approved = false;
            collector.stop(`Responded`);
        });
        collector.on('end', () => handleResponse());
        msg.reply(`Request Sent!`).then(reply => {
            msg.delete({ timeout: 5000 });
            reply.delete({ timeout: 5000 });
        });
        const handleResponse = async () => {
            message.delete({ reason: `Automated: Club invite request removed.` });
            if (approved)
                await Club.addUser(msg.guild, club, member);
            member.send(`Request ${approved ? 'Accepted' : 'Denied'}!`);
            channel.send(`Invitation to ${member} for club ${club.clubName} has been ${approved ? 'accepted' : 'rejected'}!`);
        };
    }
};
// Do we want this disabled to prevent abuse?