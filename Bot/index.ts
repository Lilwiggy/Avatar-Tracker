import { RETURN_CODES, addAvatar, fetchUser } from './utils';
import { CommandClient, GatewayClientEvents, InteractionCommandClient } from 'detritus-client';
import { ChannelGuildVoice } from 'detritus-client/lib/structures';
import { ClientEvents, InteractionCallbackTypes } from 'detritus-client/lib/constants';
import pgPromise from 'pg-promise';
import config from './config';

const pgp = pgPromise();

const cmdClient = new CommandClient(config.token, {
    gateway: {
        intents: 33539
    }
});
const interactionClient = new InteractionCommandClient(config.token);

let gender = 'female';


(async () => {
    interactionClient.add({
        description: 'Subscribe to start tracking your avatar changes.',
        name: 'track',
        run: async (context) => {
            let user = await fetchUser(db, context.userId);
            if (user) {
                return context.respond(InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE, 'You are already being tracked! If you would like to unsubscribe please type `/unsub`.');
            } else {
                await db.query('INSERT INTO users (id, track) VALUES ($1, true)', context.userId);
                context.user.track = true;
                let res = await addAvatar(db, context.user);
                if (res === RETURN_CODES.IMGUR_FAILED)
                    return context.respond(InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE, 'I apologize, an issue occured with imgur\'s API. You are still set to be tracked in the future but your avatar did not upload to our database. Please try the /check command in a few minutes to retry uploading your avatar.');
                else
                    return context.respond(InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE, 'Thank you for subscribing! Your current avatar has been added to the database and I will add your new ones automatically!');
            }
        },
      });

    const client = await cmdClient.run();
    await interactionClient.run();
    await interactionClient.uploadApplicationCommands().catch(console.error);

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
            if (!user || !user.track) return; // I do be respecting people's privacy
            await addAvatar(db, differences.user); // Parse and store data about the avatar changed

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
                await client.rest.editChannel('1092514036605779988', {
                    name: `Belle changes: ${++n}`,
                });
                await client.rest.createMessage('1079483050628501556', `Hey so fuckin, Belle changed her icon AGAIN... This makes ${n} times since I have been watching...`)
            }
        }
    });

    client.on(ClientEvents.MESSAGE_CREATE, async (paylaod: GatewayClientEvents.MessageCreate) => {
        let msg = paylaod.message;
        if (msg.content.toLowerCase() === '!test') {
            msg.channel.createMessage('yo');
        }


        if (msg.content.toLocaleLowerCase() === '!check') {
            let res = await addAvatar(db, msg.author);
            if (res === RETURN_CODES.ALREADY_IN_DB)
                msg.channel.createMessage('This avatar is already logged!');
            else
                msg.channel.createMessage('The avatar was not logged... but it is now!') 
        }
    });
})();