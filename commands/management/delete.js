const { Command } = require('commando');
const Club = require('../../structures/club/Club');

module.exports = class DeleteClubCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'destroy-club',
            aliases: ['dc', 'delete', 'deleteclub', 'clubdelete', 'clubdestroy', 'destroyclub', 'destroy'],
            group: 'management',
            memberName: 'destroy-club',
            description: `Deleted a club (Club Owner Only!)`,
            details: `Deleted a club (Club Owner Only!)`,
            guildOnly: true,
            args: [
                {
                    key: 'clubIdentifier',
                    prompt: 'What is the channel of the club you wish to **Force Delete**?\n',
                    type: 'channel'
                }
            ]
        });
    }

    async run(msg, { clubIdentifier }) {
        try {
            // Find club
            const club = Club.getClub(msg.guild.id, clubIdentifier.toString());
            if (!club) return msg.reply('`Error: Club Not Found! Please verify the code or name of the club provided.`').then(reply => {
                msg.delete({ timeout: 5000 });
                reply.delete({ timeout: 5000 });
            });

            if (club.clubOwner !== msg.member.id) return msg.reply('`Error: You do not have permission to do this!`').then(reply => {
                msg.delete({ timeout: 5000 });
                reply.delete({ timeout: 5000 });
            });

            const message = await msg.reply(`You are trying to delete club ${club.clubName}.\nAre you sure you wish to do this?`);
            await message.react('✅');
            await message.react('❌');
            let approved;

            const handleResponse = async () => {
                message.delete({ reason: `Automated: Club Deleted.` });
                if (approved) {
                    await Club.deleteClub(msg.guild, club.clubID, msg.member);
                    return msg.channel.send(`Club Deleted!`);
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
        } catch (e) {
            return msg.reply(e.message);
        }
    }
};