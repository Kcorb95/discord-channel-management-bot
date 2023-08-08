const { Command } = require('commando');
const Clubs = require('../../models/Clubs');
const Club = require('../../structures/club/Club');

module.exports = class EchoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'register',
            group: 'owner',
            memberName: 'register',
            description: 'Registers a club in the new database',
            details: `Registers a club in the new database`,
            guildOnly: true,
            ownerOnly: true,
            args: [
                {
                    key: 'clubChannel',
                    prompt: 'What is the channel for the club that you are trying to register?\n',
                    type: 'channel'
                },
                {
                    key: 'clubOwner',
                    prompt: 'Who are you trying to promote?\n',
                    type: 'member'
                },
                {
                    key: 'clubName',
                    prompt: 'What is the name of this club?\n',
                    type: 'string'
                }
            ]
        });
    }

    async run(msg, { clubChannel, clubOwner, clubName }) {
        const _club = new Club(msg.guild, clubOwner.id, clubName);
        const clubID = _club.initClubID(msg.guild.id);
        const club = await Clubs.create({
            guildID: msg.guild.id,
            clubOwner: clubOwner.id,
            clubName: clubName.toLowerCase(),
            clubID: clubID,
            clubMembers: [clubOwner.id],
            clubStaff: [clubOwner.id],
            clubChannels: [clubChannel.id],
            clubPrivate: false
        });
        Clubs.clubs.push(club);
    }
};