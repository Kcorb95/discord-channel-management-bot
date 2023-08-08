const Redis = require('../Redis');
const GuildSettings = require('../../models/GuildSettings');

class GuildCurrency {
    static _changeBalance(guild, user, amount) {
        Redis.db.hgetAsync(`guildCurrency:${guild}`, user).then(balance => {
            const bal = parseInt(balance) || 0;
            return Redis.db.hsetAsync(`guildCurrency:${guild}`, user, amount + parseInt(bal));
        });
    }

    static changeBalance(guild, user, amount) {
        GuildCurrency._changeBalance(guild, user, amount);
        GuildCurrency._changeBalance('bank', -amount);
    }

    static add(guild, user, amount) {
        GuildCurrency._changeBalance(guild, user, amount);
    }

    static remove(guild, user, amount) {
        GuildCurrency._changeBalance(guild, user, -amount);
    }

    static async getBalance(guild, user) {
        const money = await Redis.db.hgetAsync(`guildCurrency:${guild}`, user) || 0;
        return parseInt(money);
    }

    static async convert(guildID, amount, text = false) {
        if (isNaN(amount)) amount = parseInt(amount);
        if (!text) return `${amount.toLocaleString()} ${Math.abs(amount) === 1 ? await GuildCurrency.singular(guildID) : await GuildCurrency.plural(guildID)}`;
        return `${amount.toLocaleString()} ${Math.abs(amount) === 1 ? await GuildCurrency.textSingular(guildID) : await GuildCurrency.textPlural(guildID)}`;
    }

    static async singular(guildID) {
        const guild = await GuildSettings.findOne({ where: { guildID: guildID } });
        return `${guild.currencyEmoji}`;
    }

    static async plural(guildID) {
        const guild = await GuildSettings.findOne({ where: { guildID: guildID } });
        return `${guild.currencyEmoji}s`;
    }

    static async textSingular(guildID) {
        const guild = await GuildSettings.findOne({ where: { guildID: guildID } });
        return guild.currencyName.singular;
    }

    static async textPlural(guildID) {
        const guild = await GuildSettings.findOne({ where: { guildID: guildID } });
        return guild.currencyName.plural;
    }
}

module.exports = GuildCurrency;