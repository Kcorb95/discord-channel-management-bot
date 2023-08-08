const { Command } = require('commando');
const stripIndents = require('common-tags').stripIndents;
const Club = require('../../models/Clubs');


module.exports = class ClubListCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'clubs',
            aliases: ['list', 'clublist', 'clubslist', 'listclubs'],
            group: 'util',
            memberName: 'clubs',
            description: 'Get a list of available clubs.',
            details: `Get a list of available clubs.`,
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3
            }
        });
    }

    async run(msg, args) {
        const clubs = await Club.findAll({
            where: {
                guildID: msg.guild.id
            }
        });
        if (clubs.length === 0) return null; // No clubs found

        const itemsPerPage = 5;
        let currentPage = 1;
        const totalPages = Math.ceil(clubs.length / itemsPerPage);
        let index = 0;
        let message = '';
        const embed = await new this.client.methods.Embed()
            .setFooter(`Page ${currentPage}/${totalPages}`, this.client.user.displayAvatarURL())
            .setTimestamp(new Date())
            .setColor('#8B008B')
            .setTitle(`Clubs Registered for ${msg.guild.name}`);
        if (clubs.length > itemsPerPage) {
            embed.setDescription(clubs.slice(index, index + itemsPerPage).map(club => `**Club:** ${club.clubName} -- **ClubID:** ${club.clubID}`).join('\n'));
            message = await msg.say(embed);
        } else {
            embed.setDescription(clubs.map(club => `**Club:** ${club.clubName} -- **ClubID:** ${club.clubID}`).join('\n'));
            return msg.say(embed);
        }

        await message.react('⬅');
        await message.react('➡');
        const filter = (reaction, user) => (!user.bot && user.id === msg.author.id && reaction.emoji.name === '⬅') || (!user.bot && user.id === msg.author.id && reaction.emoji.name === '➡');
        const collector = message.createReactionCollector(filter, { time: 60 * 1000 });
        collector.on('collect', async (reaction, user) => {
            if (reaction.emoji.name === '⬅') {
                if (currentPage !== 1) await generatePage('back');
            } else if (reaction.emoji.name === '➡') {
                if (currentPage !== totalPages) await generatePage('next');
            }
            await reaction.users.remove(user);
        });
        collector.on('end', () => message.reactions.removeAll());

        const generatePage = async pageControl => {
            if (pageControl === 'next') {
                index += itemsPerPage;
                currentPage++;
                if (index + itemsPerPage >= clubs.length) await embed.setDescription(clubs.slice(index, clubs.length).map(club => `**Club:** ${club.clubName} -- **ClubID:** ${club.clubID}`).join('\n'));
                else await embed.setDescription(clubs.slice(index, index + itemsPerPage).map(club => `**Club:** ${club.clubName} -- **ClubID:** ${club.clubID}`).join('\n'));
            } else if (pageControl === 'back') {
                index -= itemsPerPage;
                currentPage--;
                if (index + itemsPerPage >= clubs.length) await embed.setDescription(clubs.slice(index, clubs.length).map(club => `**Club:** ${club.clubName} -- **ClubID:** ${club.clubID}`).join('\n'));
                else await embed.setDescription(clubs.slice(index, index + itemsPerPage).map(club => `**Club:** ${club.clubName} -- **ClubID:** ${club.clubID}`).join('\n'));
            }
            await embed.setFooter(`Page ${currentPage}/${totalPages}`, msg.client.user.displayAvatarURL());
            message = await message.edit('', { embed });
        };
    }
};