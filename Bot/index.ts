import config from './config';
import { CommandClient, GatewayClientEvents } from 'detritus-client';
const cmdClient = new CommandClient(config.token, {
    gateway: {
        intents: 33539
    }
});
import { parse } from "./parseIconData.js";
import { ChannelGuildText } from 'detritus-client/lib/structures';
import { ClientEvents } from 'detritus-client/lib/constants';
let gender = 'female';

(async () => {
    const client = await cmdClient.run();

    // These are used for personal use. Please ignore if you fork this bot and make it for yourself
    await client.rest.fetchGuild('1079483049445687418');
    let tracker: ChannelGuildText = await client.rest.fetchChannel('1079483050628501557');
    let count: ChannelGuildText = await client.rest.fetchChannel('1092514036605779988');
    let genChat: ChannelGuildText = await client.rest.fetchChannel('1079483050628501556');
    let name: string = tracker.name.split(': ')[1];
    let n: number = parseInt(count.name.split(': ')[1]);
    gender = name;

    console.log('lmfao we gaming'); // Bot is up and running

    // Watch for all user changes that the bot can see
    client.on(ClientEvents.USERS_UPDATE, (differences) => {
        if (differences && differences.differences.avatar) {
            parse(differences.user); // Parse and store data about the avatar changed

            if (differences.user.id === '282018830992277504') {
                genChat.createMessage('Hey @everyone! Lexi just changed they icon. Rolling for a new gender...');

                let coin = Math.floor(Math.random() * 2);
                if (coin === 1) gender = 'male';
                else gender = 'female';
                tracker.edit({
                    name: `Lexi is: ${gender}`,
                });

                genChat.createMessage(`Coin: Flipped. Landed on ${coin === 1 ? 'Heads' : 'Tails'} which means that Lexi is now a ${coin === 1 ? 'Male' : 'Female'}.`);
            } else if (differences.user.id === '232614905533038593') {
                count.edit({
                    name: `Belle changes: ${++n}`
                });
                genChat.createMessage(`Hey so fuckin, Belle changed her icon AGAIN... This makes ${n} times since I have been watching...`);
            }
        }
    });

    client.on(ClientEvents.MESSAGE_CREATE, async (paylaod: GatewayClientEvents.MessageCreate) => {
        let msg = paylaod.message;
        if (msg.content.toLowerCase() === '!test') {
            msg.channel.createMessage('yo');
            parse(msg.member);
        }
    });
})();