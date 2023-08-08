const { Command } = require('commando');
const Club = require('../../structures/club/Club');
const { stripIndents } = require('common-tags');

module.exports = class CreateClubCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'create',
            aliases: ['createclub', 'cc'],
            group: 'moderation',
            memberName: 'create',
            description: 'Registers a club within the bot',
            details: `Registers a club and assigns it an ID.`,
            guildOnly: true,
            args: [
                {
                    key: 'name',
                    prompt: 'what is the name of the club that you would like to register?\n',
                    type: 'string',
                    max: 50,
                    validate: name => {
                        if (/[^a-z_-]/i.test(name)) {
                            return `That is not a valid club name.\nClub Names must be lowercase and not contain any numbers special characters besides '-' and '_'`;
                        }
                        return true;
                    }
                },
                {
                    key: 'owner',
                    prompt: 'who owns the club that you are trying to register?\n',
                    type: 'member'
                }
            ]
        });
    }

    async run(msg, { name, owner }) {
        try {
            const prefix = this.client.commandPrefix;
            const club = new Club(msg.guild, owner, name);
            const createdClub = await club.createClub();
            const channel = await msg.guild.channels.get(createdClub.clubChannels[0]);
            await channel.send(stripIndents`${owner}\ So the format for commands is as follows:
        \`\`\`
        ${prefix}clubs -- View the list of clubs in the guild.
        ${prefix}club <clubID/#club-name/clubname> -- View information on a club
        ${prefix}invite @user #club-name -- Invite a user to join your club (Club Staff+)
        ${prefix}join <clubID/clubname> -- Join a club or if it's private, request to join
        ${prefix}promote @user #club-name -- Promote a club member to club staff (Club Owners)
        ${prefix}demote @user #club-name -- Demote a club staff member to regular club memebr (Club Owners)
        ${prefix}kick @user #club-name -- Kick a user from a club (Club Staff+)
        ${prefix}leave #club-name -- Leaves a club
        ${prefix}privacy #club-name -- Toggles the privacy setting for a club. Open means people do not have to request to join (Club Owners)
        ${prefix}delete #club-name -- Deletes a club (Club Owners)
        ${prefix}transfer @user #club-name -- Transfer the ownership of a club to a club staff member (Club Owners)
        \`\`\`
        **Your unique clubID is:** ${createdClub.clubID}
        Please update your club description to include this code and this channel so people can more easily join.
        You may now start inviting members and promoting moderators`);
            return msg.reply(`Club ${name} has been successfully created! ${channel}`);
        } catch (e) {
            return msg.reply(e.message);
        }
    }
};