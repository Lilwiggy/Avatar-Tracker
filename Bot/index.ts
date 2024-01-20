import { fetchUser } from './utils';
import { CommandClient, GatewayClientEvents, ShardClient } from 'detritus-client';
import { parse } from "./parseIconData.js";
import { ChannelGuildText, ChannelGuildVoice } from 'detritus-client/lib/structures';
import { ActivityTypes, ClientEvents } from 'detritus-client/lib/constants';
import pgPromise from 'pg-promise';
import config from './config';

const pgp = pgPromise();


const cmdClient = new CommandClient(config.token, {
    gateway: {
        intents: 33539
    }
});

let gender = 'female';


(async () => {
    const client = await cmdClient.run();

    const db = pgp(config.postgres);
          db.connect().catch(error => {
            console.error('Error connecting to the database:', error);
        });

    // These are used for personal use. Please ignore if you fork this bot and make it for yourself
    await client.rest.fetchGuild('1079483049445687418');
    let tracker: ChannelGuildVoice = await client.rest.fetchChannel('1079483050628501557');
    let count: ChannelGuildVoice = await client.rest.fetchChannel('1092514036605779988');
    let name: string = tracker.name.split(': ')[1];
    let n: number = parseInt(count.name.split(': ')[1]);
    gender = name;

    console.log('lmfao we gaming'); // Bot is up and running

    // Watch for all user changes that the bot can see
    client.on(ClientEvents.USERS_UPDATE, async (differences) => {
        if (differences && differences.differences.avatar) {
            let user = await fetchUser(db, differences.user.id);
            if (!user.track) return; // I do be respecting people's privacy
            await parse(db, differences.user); // Parse and store data about the avatar changed

            if (differences.user.id === '282018830992277504') {
                client.rest.createMessage('1079483050628501556', 'Hey @everyone! Lexi just changed they icon. Rolling for a new gender...');

                let coin = Math.floor(Math.random() * 2);
                if (coin === 1) gender = 'male';
                else gender = 'female';
                client.rest.editChannel('1079483050628501557', {
                    name: `Lexi is: ${gender}`,
                });

                client.rest.createMessage('1079483050628501556',`Coin: Flipped. Landed on ${coin === 1 ? 'Heads' : 'Tails'} which means that Lexi is now a ${coin === 1 ? 'Male' : 'Female'}.`);
            } else if (differences.user.id === '232614905533038593') {
                client.rest.editChannel('1092514036605779988', {
                    name: `Belle changes: ${++n}`,
                });
                client.rest.createMessage('1092514036605779988', `Hey so fuckin, Belle changed her icon AGAIN... This makes ${n} times since I have been watching...`)
            }
        }
    });

    client.on(ClientEvents.MESSAGE_CREATE, async (paylaod: GatewayClientEvents.MessageCreate) => {
        let msg = paylaod.message;
        if (msg.content.toLowerCase() === '!test') {
            msg.channel.createMessage('yo');
        }
    });
})();