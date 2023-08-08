const Clubs = require('../models/Clubs');
const Club = require('../structures/club/Club');

exports.run = async (bot, channel) => {
    if (channel.type === 'dm') return null;
    // Find club
    const club = Club.getClub(channel.guild.id, channel.toString());
    if (!club) return null;

    club.clubChannels.map(clubChannel => {
        if (clubChannel === channel.id) return clubChannelDelete(club, channel);
    });
};

const clubChannelDelete = async (club, channel) => {
    if (club.clubChannels.length === 1) {
        Clubs.destroy({ where: { guildID: channel.guild.id, clubID: club.clubID } });
        return Club.deleteClub(channel.guild, club.id, 'FORCE');
    }

    // Delete channel from club cache
    const cacheIndex = club.clubChannels.indexOf(channel.id);
    club.clubChannels.splice(cacheIndex, 1);

    // Delete channel from Club Database
    const _club = await Clubs.findOne({ where: { guildID: channel.guild.id, clubID: club.clubID } });
    // If in club, remove from club
    const clubChannels = _club.clubChannels;
    // Get index of member
    const index = clubChannels.indexOf(channel.id);
    if (index === -1) return null;
    // Splice
    clubChannels.splice(index, 1);
    _club.clubChannels = clubChannels;
    await _club.save();
};