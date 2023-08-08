const { Command } = require('commando');

module.exports = class DeleteElliotCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'deletescrub',
            group: 'owner',
            memberName: 'deletescrub',
            description: 'Loads entire server messages from all channels (Warning, will take time)',
            details: `Loads entire server messages from all channels (Warning, will take time)`,
            guildOnly: true
        });
    }

    hasPermission(msg) {
        return msg.author.id === this.client.options.owner;
    }

    async run(msg) {
        let complete = false;
        let messageTotal = 0;
		let deleteCounter = 0;
        await msg.reply(`Beginning Scan....`);
        let progressTracker = await msg.reply(`Tracking Progress....`);
        let progressTracker2 = await msg.reply(`Tracking Progress....`);
        let saveProgressTracker = await msg.reply(`Tracking Save Progress...`);
        let progressCounter = 0;
        await loopChannels();
        msg.reply(`Job Complete!`);
		msg.reply(`Deleted ${deleteCounter} messages owo`);

        async function loopChannels() {
            const guildChannels = await msg.guild.channels.array().filter(channel => {
                return channel.type === 'text';
            });

            for (let i = 0; i < guildChannels.length; i++) {
		if (guildChannels[i].id !== '217529761805762560' && 
		    guildChannels[i].id !== '459398049131659264' && 
		    guildChannels[i].id !== '411625890213265418' && 
		    guildChannels[i].id !== '360751772215803905' && 
		    guildChannels[i].id !== '511735246530805771' && 
		    guildChannels[i].id !== '266838453210185728' && 
		    guildChannels[i].id !== '412983769264553994' && 
		    guildChannels[i].id !== '279526053242732544' && 
		    guildChannels[i].id !== '330310349490487296' && 
		    guildChannels[i].id !== '478699536563306506' && 
		    guildChannels[i].id !== '336512561698701321' && 
		    guildChannels[i].id !== '245053785121095680' && 
		    guildChannels[i].id !== '217578870226812928' && 
		    guildChannels[i].id !== '442512139714822144' && 
		    guildChannels[i].id !== '260108637580689408' && 
		    guildChannels[i].id !== '336589921781415936' && 
		    guildChannels[i].id !== '478696004896423939' && 
		    guildChannels[i].id !== '244939297969537024' && 
		    guildChannels[i].id !== '367607902623760385' && 
		    guildChannels[i].id !== '532616285192978462' && 
		    guildChannels[i].id !== '229796117657812994' && 
		    guildChannels[i].id !== '361019818805297153' && 
		    guildChannels[i].id !== '495584124887629833' && 
		    guildChannels[i].id !== '547619541069463556' && 
		    guildChannels[i].id !== '410832535967367169' && 
		    guildChannels[i].id !== '549329521342677008' && 
		    guildChannels[i].id !== '330333430355329024' && // Bots
		    guildChannels[i].id !== '410832535967367169' && // event logs
		    guildChannels[i].id !== '253750333422043137' && // logs
		    guildChannels[i].id !== '331012124018999296'){
                  const firstMessage = await guildChannels[i].messages.fetch({ limit: 1 });
                  if (firstMessage.array().length > 0) {
                    await fetchMessages(firstMessage.last().id, guildChannels[i], 50);
                    await progressTracker2.edit(`Scanned Channel: ${guildChannels[i]}\n${i + 1} channels scanned out of ${guildChannels.length}`);
                  }
		}
            }
            complete = true;
        }

        async function fetchMessages(messageID, channel) {
            if (progressCounter === 25) {
                await progressTracker.edit(`Scanning ${channel}, ${messageID}...`);
                progressCounter = 0;
            } else {
                progressCounter++;
            }
            try {
                const messages = await channel.messages.fetch({ limit: 50, before: messageID });
                await deleteMessages(messages.array());
                await fetchMessages(messages.last().id, channel);
            } catch (err) {
                await fetchMessagesSingle(messageID, channel);
            }
        }

        async function fetchMessagesSingle(messageID, channel) {
            try {
                const messages = await channel.messages.fetch({ limit: 1, before: messageID });
                await deleteMessages(messages.array());
                await fetchMessagesSingle(messages.last().id, channel);
            } catch (err) {
                if (complete)
                    return null;
            }
        }

        async function deleteMessages(messages) {
            messageTotal += messages.length;
            if (progressCounter === 25)
                await saveProgressTracker.edit(`Processing ${messages.length} messages. Total processed: ${messageTotal}\nTotal deleted: ${deleteCounter}...`);
            await messages.forEach(message => {
                if (message.author.id === '136246612140883968'){
                    message.delete();
		    deleteCounter++;
		}
            });
        }
    }
};
