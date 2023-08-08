const { DataTypes, Model } = require('sequelize');
const Database = require('../structures/PostgreSQL');

class Clubs extends Model {
}

Clubs.init({
    guildID: DataTypes.STRING,
    clubID: {
        type: DataTypes.BIGINT,
        primaryKey: true
    },
    clubName: DataTypes.STRING,
    clubOwner: DataTypes.STRING,
    clubChannels: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    clubStaff: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    clubMembers: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    clubPrivate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    clubInviteChannel: DataTypes.STRING
}, {
    sequelize: Database.db
});

Clubs.clubs = [];

module.exports = Clubs;