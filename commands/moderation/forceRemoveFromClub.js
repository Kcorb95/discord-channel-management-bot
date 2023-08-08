const { Command } = require('commando');
const Club = require('../../structures/club/Club');

module.exports = class ForceRemoveFromClubCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'force-remove-from-club',
            aliases: ['frfc', 'fremove', 'fkick'],
            group: 'moderation',
            memberName: 'force-remove-from-club',
            description: `Force removes a user from a club`,
            details: `Force removes a user from a club`,
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'who should be removed from the given club?\n',
                    type: 'member'
                },
                {
                    key: 'clubIdentifier',
                    prompt: 'what is the club that you would like to manage?\n',
                    type: 'channel'
                }
            ]
        });
    }

    async run(msg, { clubIdentifier, member }) {
        try {
            // Find club
            const club = Club.getClub(msg.guild.id, clubIdentifier.toString());
            if (!club) return msg.reply('`Error: Club Not Found! Please verify the code or name of the club provided.`').then(reply => {
                msg.delete({ timeout: 5000 });
                reply.delete({ timeout: 5000 });
            });
            await Club.removeUser(msg.guild, club.clubID, member);
            return msg.channel.send(`User removed from club!`);
        } catch (e) {
            return msg.reply(e.message);
        }
    }
};