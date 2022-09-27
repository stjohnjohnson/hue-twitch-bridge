import dotenv from 'dotenv';
import tmi from 'tmi.js';
import { api } from 'node-hue-api'
import { convertColorToState } from './color'
import { RateLimiter } from 'limiter';
import { setTimeout } from 'timers/promises';

// Allow color changes every second
const limiterColor = new RateLimiter({
    tokensPerInterval: 1,
    interval: "second",
    fireImmediately: true
});
// Allow parties every minute
const limiterParty = new RateLimiter({
    tokensPerInterval: 1,
    interval: "minute",
    fireImmediately: true
});

// Load config from disk
dotenv.config();

// Validate we have all the required variables
const configErrors = ['TWITCH_CHANNEL', 'TWITCH_USERNAME', 'TWITCH_OAUTH', 'HUE_USERNAME', 'HUE_IPADDRESS', 'HUE_GROUPID'].map(key => {
    if (!process.env[key]) {
        return `${key} is a required environment variable`;
    }
}).join("\n").trim();
if (configErrors != "") {
    console.error(configErrors);
    process.exit(1);
}

// Create the Twitch client
const client = new tmi.Client({
    options: { debug: true, messagesLogLevel: "info" },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: `${process.env.TWITCH_USERNAME}`,
        // Don't forget to use https://twitchapps.com/tmi/ to get this value
        password: `${process.env.TWITCH_OAUTH}`
    },
    channels: [`${process.env.TWITCH_CHANNEL}`]
});

// Connect to Twitch!
client.connect().catch(console.error);

// Connect to Hue
let hueApi = await api.createLocal(`${process.env.HUE_IPADDRESS}`)
    .connect(`${process.env.HUE_USERNAME}`)
    .catch(console.error)

// Listen for messages
client.on('message', async (channel, tags, message, self) => {
    // Ignore self
    if (self) return;

    let [command, content] = message.toLowerCase().split(' ', 2);
    switch (command) {
        case '!party':
            const remainingMessages = await limiterParty.removeTokens(1);
            if (remainingMessages < 0) {
                client.say(channel, `Only one party per minute please`)
            } else {
                client.say(channel, `@${tags.username} started a PARTY!`)
                for ( let i = 0; i < 15; i++ ) {
                    await hueApi.groups.setGroupState(`${process.env.HUE_GROUPID}`, convertColorToState('random'));
                    await setTimeout(1000);
                }
                client.say(channel, `Alright, party's over...`)
            }
            break;

        case '!color':
            let newState = convertColorToState(content.trim());

            if (newState) {
                const remainingMessages = await limiterColor.removeTokens(1);
                if (remainingMessages < 0) {
                    client.say(channel, `One color change per second please`)
                } else {
                    hueApi.groups.setGroupState(`${process.env.HUE_GROUPID}`, newState).then(() => {
                        console.log('Color updated');
                    }).catch(console.error);
                }
            } else {
                client.say(channel, `Unknown color, please use cssname or #hex value`);
            }
            break;
    }
});
