const Clubs = require('../models/Clubs');

exports.run = async (bot, member) => {
    Clubs.clubs.map(club => {
        const memberIndex = club.clubMembers.indexOf(member.id);
        if (memberIndex === -1) return null;
        club.clubMembers.splice(memberIndex, 1);

        const staffIndex = club.clubStaff.indexOf(member.id);
        if (staffIndex === -1) return null;
        club.clubStaff.splice(staffIndex, 1);
    });

    // Delete channel from Club Database
    const clubs = await Clubs.findAll({ where: { guildID: member.guild.id } });
    clubs.map(async club => {
        const clubMembers = club.clubMembers;
        const memberIndex = clubMembers.indexOf(member.id);
        if (memberIndex === -1) return null;
        clubMembers.splice(memberIndex, 1);
        club.clubMembers = clubMembers;

        const clubStaff = club.clubStaff;
        const staffIndex = clubStaff.indexOf(member.id);
        if (staffIndex === -1) return null;
        clubStaff.splice(staffIndex, 1);
        club.clubStaff = clubStaff;

        await club.save();
    });
};