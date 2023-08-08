const { Command } = require('commando');
const Club = require('../../structures/club/Club');
const { stripIndents } = require('common-tags');

module.exports = class RequestJoinCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'request',
            aliases: ['join'],
            group: 'management',
            memberName: 'request',
            description: 'Request to join a club!',
            details: `Request to join a club!`,
            guildOnly: true,
            args: [
                {
                    key: 'clubIdentifier',
                    prompt: 'Enter the invite code for the club that you would like to join\n',
                    type: 'string'
                }
            ]
        });
    }

    async run(msg, { clubIdentifier }) {
        // Get club
        const club = Club.getClub(msg.guild.id, clubIdentifier);
        if (!club) return msg.reply('`Error: Club Not Found! Please verify the code or name of the club provided.`').then(reply => {
            msg.delete({ timeout: 5000 });
            reply.delete({ timeout: 5000 });
        });
        // Check if User is in club
        if (club.clubMembers.includes(msg.member.id)) return msg.reply('`Error: You are already in this club!`').then(reply => {
            msg.delete({ timeout: 5000 });
            reply.delete({ timeout: 5000 });
        });

        if (!club.clubPrivate) {
            await Club.addUser(msg.guild, club, msg.member);
            return msg.reply(`Joined club ${club.clubName}!`).then(reply => {
                msg.delete({ timeout: 5000 });
                reply.delete({ timeout: 5000 });
            });
        }

        // If not in club, request permission to join
        const channel = await msg.guild.channels.get(club.clubInviteChannel !== null ? club.clubInviteChannel : club.clubChannels[0]);
        const _clubStaff = await club.clubStaff.map(async staffID => msg.guild.members.get(staffID));
        const clubStaff = await Promise.all(_clubStaff);
        const message = await channel.send(stripIndents`${clubStaff.join(' **-** ')},
        
        ${msg.member} wishes to join your club!
        React to approve/deny!
        `);
        await message.react('✅');
        await message.react('❌');
        let approved;
        const filter = (reaction, user) => !user.bot && (reaction.emoji.name === '✅' || reaction.emoji.name === '❌') && club.clubStaff.includes(user.id);
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
            message.delete({ reason: `Automated: Club join request removed.` });
            if (approved)
                await Club.addUser(msg.guild, club, msg.member);
            channel.send(`Request to join club ${club.clubName} has been ${approved ? 'accepted' : 'rejected'}!`);
        };
    }
};