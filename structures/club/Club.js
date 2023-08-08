const GuildSettings = require('../../models/GuildSettings');
const Clubs = require('../../models/Clubs');
const _ = require('lodash');

module.exports = class Club {
    constructor(guild, owner, name) {
        this.guild = guild;
        this.guildID = guild.id;
        this.owner = owner;
        this.clubOwner = owner.id;
        this.clubName = name.toLowerCase();
        this.clubID = null;
        this.clubMembers = [];
        this.clubStaff = [];
        this.clubChannels = [];
        this.clubPrivate = false;
    }

    static async initializeClubs() {
        Clubs.clubs = await this.getClubs();
    }

    async createClub() {
        // Check if club name exists
        if (Club.getClub(this.guildID, this.clubName)) throw new Error('`Error: Club with this name already exists!`');
        // if not exist, get clubID
        await this.initClubID(this.guildID); // Initialises the clubID
        // set staff and members to include owner
        this.clubMembers = [this.clubOwner];
        this.clubStaff = [this.clubOwner];
        // create channel
        const channel = await Club.createChannel(this.guild, this.clubOwner, this.clubName);
        // set channels to include current channel
        this.clubChannels = [channel.id];
        // init into database
        const club = await Clubs.create({
            guildID: this.guildID,
            clubOwner: this.clubOwner,
            clubName: this.clubName,
            clubID: this.clubID,
            clubMembers: this.clubMembers,
            clubStaff: this.clubStaff,
            clubChannels: this.clubChannels,
            clubPrivate: this.clubPrivate
        });
        Clubs.clubs.push(club);
        return club;
    }

    static async createChannel(guild, clubOwner, name) {
        const settings = await GuildSettings.findOne({ where: { guildID: guild.id } });

        if (!settings.botsID || !settings.clubCategoryID || !settings.managersID) throw new Error('`Error: Please set-up your roles! You must have a bots role, club category AND club manager role set!`');
        const bots = await guild.roles.get(settings.botsID);
        const owner = await guild.members.get(clubOwner);
        const clubCategory = await guild.channels.get(settings.clubCategoryID);
        const clubManagers = await guild.roles.get(settings.managersID);
        const everyone = await guild.roles.find(role => role.name === '@everyone');

        if (!bots || !clubCategory || !clubManagers) throw new Error('`Error: Please re-configure this guild. You need to tell me what you changed your roles/channels to!`');

        const channel = await guild.channels.create(`club-${name}`, {
            type: 'text',
            parent: clubCategory,
            permissionOverwrites: [{
                id: bots,
                allow: [
                    'MANAGE_CHANNELS',
                    'MANAGE_ROLES',
                    'VIEW_CHANNEL',
                    'SEND_MESSAGES',
                    'MANAGE_MESSAGES',
                    'MENTION_EVERYONE'
                ]
            }, {
                id: clubManagers,
                allow: [
                    'MANAGE_CHANNELS',
                    'MANAGE_ROLES',
                    'VIEW_CHANNEL',
                    'SEND_MESSAGES',
                    'MANAGE_MESSAGES',
                    'MENTION_EVERYONE'
                ]
            }, {
                id: everyone,
                deny: [
                    'MANAGE_CHANNELS',
                    'MANAGE_ROLES',
                    'MANAGE_WEBHOOKS',
                    'VIEW_CHANNEL',
                    'SEND_TTS_MESSAGES',
                    'MANAGE_MESSAGES',
                    'MENTION_EVERYONE'
                ],
                allow: [
                    'EMBED_LINKS',
                    'ATTACH_FILES',
                    'READ_MESSAGE_HISTORY',
                    'ADD_REACTIONS',
                    'USE_EXTERNAL_EMOJIS'
                ]
            }, {
                id: owner,
                allow: [
                    'VIEW_CHANNEL',
                    'SEND_MESSAGES',
                    'MANAGE_MESSAGES'
                ]
            }]
        });
        return channel;
    }

    // Method to get club by clubID and guildID
    static getClub(guildID, clubIdentifier) {
        let clubID = '';
        let type = '';
        if (clubIdentifier.includes('<#')) { // This is a channel Object, return the club name portion
            clubID = clubIdentifier.replace(/\D/g, '');
            type = 'CHANNEL';
        } else if (isNaN(clubIdentifier)) { // This is not a number, so it's a name
            clubID = clubIdentifier.toLowerCase();
            type = 'CLUBNAME';
        } else { // This is a number, join code
            clubID = clubIdentifier;
            type = 'JOINCODE';
        }

        if (type === 'CHANNEL') // This is a channel, search for channels with this name
            return Clubs.clubs.find(club => club.clubChannels.includes(clubID));
        else if (type === 'CLUBNAME') // This is a club name, check clubs with this name in this guild
            return Clubs.clubs.find(club => club.clubName === clubID && club.guildID === guildID);
        return Clubs.clubs.find(club => club.clubID === clubID && club.guildID === guildID); // This is the clubID
    }

    // Method to fetch all clubs by provided options
    static getClubs(options) {
        if (!options)
            return Clubs.findAll({ order: [['clubID', 'ASC']] });
        return Clubs.findAll(options);
    }

    // Method to initialize clubID based off last created club's ID
    initClubID(guildID) {
        const clubs = Clubs.clubs.filter(club => club.guildID === guildID); // Filter clubs by guildID
        const clubID = clubs.length > 0 ? parseInt(clubs[clubs.length - 1].clubID) + 1 : 1; // Get last index's club ID or if none, id is 1
        this.clubID = clubID; // init
        return clubID;
    }

    // Method to get members of club by guildID and clubID
    getMembers(guildID, clubID) {
        const club = Clubs.clubs.filter(fClub => fClub.guildID === guildID && fClub.clubID === clubID); // Filter clubs by guildID
        this.clubMembers = club.clubMembers;
        return club.clubMembers;
    }

    getStaff(guildID, clubID) {
        const club = Clubs.clubs.filter(fClub => fClub.guildID === guildID && fClub.clubID === clubID); // Filter clubs by guildID
        this.clubStaff = club.clubStaff;
        return club.clubStaff;
    }

    // Adds user to club
    static async addUser(guild, club, member) {
        if (typeof club.clubID === 'undefined')
            club = this.getClub(guild.id, club);
        // Okay so this block here is tricky. Basically we need to fetch the DB and update the status of the DB here AND do it for the array of clubs at the bottom of this block
        const _club = await Clubs.findOne({ where: { guildID: guild.id, clubID: club.clubID } });
        // If not in club, add to club
        const clubMembers = _club.clubMembers;
        clubMembers.push(member.id);
        _club.clubMembers = clubMembers;
        await _club.save();

        const channelIDs = club.clubChannels;
        for (const channelID of channelIDs) {
            const channel = await guild.channels.get(channelID);
            await channel.updateOverwrite(member, {
                'VIEW_CHANNEL': true
            });
        }
        Clubs.clubs.find(foundClub => {
            if (foundClub.clubID === club.clubID)
                foundClub.clubMembers.push(member.id);
        });
    }

    // Removes user from club
    static async removeUser(guild, club, member) {
        if (typeof club.clubID === 'undefined')
            club = this.getClub(guild.id, club);
        // Okay so this block here is tricky. Basically we need to fetch the DB and update the status of the DB here AND do it for the array of clubs at the bottom of this block
        const _club = await Clubs.findOne({ where: { guildID: guild.id, clubID: club.clubID } });
        // Check if User is in club
        if (!club.clubMembers.includes(member.id)) throw new Error('Error: This user is not a member of this club!');
        // If in club, remove from club
        const clubMembers = _club.clubMembers;
        // Get index of member
        const index = clubMembers.indexOf(member.id);
        // Splice
        clubMembers.splice(index, 1);
        _club.clubMembers = clubMembers;
        await _club.save();

        const channelIDs = club.clubChannels;
        for (const channelID of channelIDs) {
            const channel = await guild.channels.get(channelID);
            await channel.permissionOverwrites.map(overwrites => {
                if (overwrites.id === member.id) overwrites.delete();
            });
        }
        Clubs.clubs.find(foundClub => {
            if (foundClub.clubID === club.clubID) {
                const index = foundClub.clubMembers.indexOf(member.id);
                foundClub.clubMembers.splice(index, 1);
            }
        });
    }

    static async promoteUser(guild, club, member) {
        if (typeof club.clubID === 'undefined')
            club = this.getClub(guild.id, club);
        // Okay so this block here is tricky. Basically we need to fetch the DB and update the status of the DB here AND do it for the array of clubs at the bottom of this block
        const _club = await Clubs.findOne({ where: { guildID: guild.id, clubID: club.clubID } });
        // If not in club, add to club
        const clubStaff = _club.clubStaff;
        clubStaff.push(member.id);
        _club.clubStaff = clubStaff;
        await _club.save();

        const channelIDs = club.clubChannels;
        for (const channelID of channelIDs) {
            const channel = await guild.channels.get(channelID);
            await channel.updateOverwrite(member, {
                'VIEW_CHANNEL': true,
                'MANAGE_MESSAGES': true
            });
        }
        Clubs.clubs.find(foundClub => {
            if (foundClub.clubID === club.clubID)
                foundClub.clubStaff.push(member.id);
        });
    }

    static async demoteUser(guild, club, member) {
        if (typeof club.clubID === 'undefined')
            club = this.getClub(guild.id, club);
        // Okay so this block here is tricky. Basically we need to fetch the DB and update the status of the DB here AND do it for the array of clubs at the bottom of this block
        const _club = await Clubs.findOne({ where: { guildID: guild.id, clubID: club.clubID } });
        // Check if User is in club
        if (!club.clubStaff.includes(member.id)) throw new Error('Error: This user is not staff in this club!');
        // Check if User is in club
        if (!club.clubMembers.includes(member.id)) throw new Error('Error: This user is not a member of this club!');
        // If in club, remove from club
        const clubStaff = _club.clubStaff;
        // Get index of member
        const index = clubStaff.indexOf(member.id);
        // Splice
        clubStaff.splice(index, 1);
        _club.clubStaff = clubStaff;
        await _club.save();

        const channelIDs = club.clubChannels;
        for (const channelID of channelIDs) {
            const channel = await guild.channels.get(channelID);
            await channel.updateOverwrite(member, {
                'VIEW_CHANNEL': true,
                'MANAGE_MESSAGES': false
            });
        }
        Clubs.clubs.find(foundClub => {
            if (foundClub.clubID === club.clubID) {
                const index = foundClub.clubStaff.indexOf(member.id);
                foundClub.clubStaff.splice(index, 1);
            }
        });
    }

    static async transferOwner(guild, club, newOwner) {
        if (typeof club.clubID === 'undefined')
            club = this.getClub(guild.id, club);
        // Okay so this block here is tricky. Basically we need to fetch the DB and update the status of the DB here AND do it for the array of clubs at the bottom of this block
        const _club = await Clubs.findOne({ where: { guildID: guild.id, clubID: club.clubID } });
        let owner = _club.clubOwner;
        owner = newOwner.id;
        _club.clubOwner = owner;
        await _club.save();

        const channelIDs = club.clubChannels;
        for (const channelID of channelIDs) {
            const channel = await guild.channels.get(channelID);
            await channel.updateOverwrite(newOwner, {
                'VIEW_CHANNEL': true,
                'MANAGE_MESSAGES': true
            });
        }

        Clubs.clubs.find(foundClub => {
            if (foundClub.clubID === club.clubID)
                foundClub.clubOwner = newOwner.id;
        });
    }

    static async toggleClubPrivacy(guild, club) {
        if (typeof club.clubID === 'undefined')
            club = this.getClub(guild.id, club);
        // Okay so this block here is tricky. Basically we need to fetch the DB and update the status of the DB here AND do it for the array of clubs at the bottom of this block
        const _club = await Clubs.findOne({ where: { guildID: guild.id, clubID: club.clubID } });
        let clubPrivate = _club.clubPrivate;
        clubPrivate = !clubPrivate;
        _club.clubPrivate = clubPrivate;
        await _club.save();

        Clubs.clubs.find(foundClub => {
            if (foundClub.clubID === club.clubID)
                foundClub.clubPrivate = !foundClub.clubPrivate;
        });
    }

    static async deleteClub(guild, clubID, owner) {
        // Delete all club channels
        const doDestroy = async club => {
            if (club !== null) {
                const channelIDs = club.clubChannels;
                for (const channelID of channelIDs) {
                    const channel = await guild.channels.get(channelID);
                    await channel.delete({ reason: `Club Deleted by ${owner}` });
                }
            }
            // Delete club entry in DB
            const destroyed = await Clubs.destroy({
                where: {
                    guildID: guild.id,
                    clubID: clubID
                }
            });

            Clubs.clubs.find(foundClub => {
                if (foundClub.clubID === clubID) {
                    const index = Clubs.clubs.indexOf(foundClub);
                    Clubs.clubs.splice(index, 1);
                }
            });

            return destroyed; // Returns number of rows destroyed
        };
        // Get club
        const club = await Clubs.findOne({ where: { guildID: guild.id, clubID: clubID } });
        // ONLY delete club IF owner is equal to the club owner OR set to "FORCE"
        if (owner === 'FORCE' || owner.id === club.clubOwner)
            return doDestroy(club);
        throw new Error('Error: You do not have permission to delete this club!'); // If doDestroy(club) was never run, that means no perms
    }
};