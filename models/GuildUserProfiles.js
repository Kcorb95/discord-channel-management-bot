const { DataTypes, Model } = require('sequelize');
const Database = require('../structures/PostgreSQL');

class GuildUserProfiles extends Model {
}

GuildUserProfiles.init({
    guildID: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    userID: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    walletBalance: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    bankBalance: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    experience: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    rankTokens: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    inventory: {
        type: DataTypes.STRING,
        defaultValue: '[]'
    }
}, {
    sequelize: Database.db,
    indexes: [
        {
            fields: ['userID']
        }
    ]
});

module.exports = GuildUserProfiles;