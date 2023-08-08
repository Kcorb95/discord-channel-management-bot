const { Command } = require('commando');
const Club = require('../../structures/club/Club');

module.exports = class ForceAddToClubCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'force-add-to-club',
            aliases: ['fatc', 'fact', 'fadd'],
            group: 'moderation',
            memberName: 'force-add-to-club',
            description: `Force adds a user to a club`,
            details: `Force adds a user to a club`,
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'who should be added to the given club?\n',
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

    async run(msg, { member, clubIdentifier }) {
        // Find club
        const club = Club.getClub(msg.guild.id, clubIdentifier.toString());
        if (!club) return msg.reply('`Error: Club Not Found! Please verify the code or name of the club provided.`').then(reply => {
            msg.delete({ timeout: 5000 });
            reply.delete({ timeout: 5000 });
        });
        await Club.addUser(msg.guild, club, member).catch(e => msg.reply(e.message));
        return msg.channel.send(`User added to club!`);
    }
};