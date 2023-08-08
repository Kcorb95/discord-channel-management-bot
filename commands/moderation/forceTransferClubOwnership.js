const { Command } = require('commando');
const Club = require('../../structures/club/Club');

module.exports = class ForceTransferOwnershipCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'force-transfer-club-ownership',
            aliases: ['forcetransfer', 'ftransfer', 'ftransferclub', 'fnewowner'],
            group: 'management',
            memberName: 'force-transfer-club-ownership',
            description: 'FORCE transfer the ownership in a club',
            details: `FORCE transfer the ownership in a club`,
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'what user would you like to transfer ownership to?\n',
                    type: 'member'
                },
                {
                    key: 'clubIdentifier',
                    prompt: 'Enter the clubID for the club that you would like to transfer ownership.\n',
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
        // Check if user is part of club
        if (!club.clubMembers.includes(member.id)) return msg.reply('`Error: This user is not a member of this club!\nPlease make sure they have joined the club first AND are staff before transferring ownership.`').then(reply => {
            msg.delete({ timeout: 5000 });
            reply.delete({ timeout: 5000 });
        });
        // Check if User is in club
        if (!club.clubStaff.includes(member.id)) return msg.reply('`Error: This person is not staff in this club!`').then(reply => {
            msg.delete({ timeout: 5000 });
            reply.delete({ timeout: 5000 });
        });
        const message = await msg.reply(`You are trying to transfer ownership of club ${club.clubName} to ${member}.\nAre you sure you wish to do this?`);
        await message.react('✅');
        await message.react('❌');
        let approved;

        const handleResponse = async () => {
            message.delete({ reason: `Automated: Club Ownership Transferred.` });
            if (approved) {
                await Club.transferOwner(msg.guild, club.clubID, member);
                return msg.channel.send(`Transferred!`);
            } else {
                return msg.channel.send(`Cancelled!`);
            }
        };

        const filter = (reaction, user) => !user.bot && (reaction.emoji.name === '✅' || reaction.emoji.name === '❌') && user.id === msg.member.id;
        const collector = message.createReactionCollector(filter, { time: 8 * 60 * 60 * 1000 });
        collector.on('collect', reaction => {
            if (reaction.emoji.name === '✅')
                approved = true;
            else if (reaction.emoji.name === '❌')
                approved = false;
            collector.stop(`Responded`);
        });
        collector.on('end', () => handleResponse());
    }
};