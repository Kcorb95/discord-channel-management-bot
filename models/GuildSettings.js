const { DataTypes, Model } = require('sequelize');
const Database = require('../structures/PostgreSQL');

class GuildSettings extends Model {
}

GuildSettings.init({
    guildID: DataTypes.STRING,
    clubCategoryID: DataTypes.STRING,
    botsID: DataTypes.STRING,
    managersID: DataTypes.STRING,
    currencyName: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    currencyEmoji: DataTypes.STRING
}, { sequelize: Database.db });

module.exports = GuildSettings;