# hue-twitch-bridge
Let your twitch viewers control your Hue lights

## Running

```bash
$ docker run --rm -it --env-file .env stjohnjohnson/hue-twitch-bridge:latest
> hue-twitch-bridge@1.0.0 start
> node --experimental-specifier-resolution=node app.js

[15:19] info: Connecting to irc-ws.chat.twitch.tv on port 443..
[15:19] info: Sending authentication to server..
[15:19] info: Connected to server.
[15:19] info: Executing command: JOIN #stjohnjohnson
[15:19] info: Joined #stjohnjohnson
```

## Configuration

Set the following environment variables:

- `TWITCH_USERNAME`: Your Bot's Username
- `TWITCH_OAUTH`: The code from https://twitchapps.com/tmi/
- `TWITCH_CHANNEL`: The Twitch channel to sit in
- `HUE_IPADDRESS`: IP Address of your Hue Bridge
- `HUE_USERNAME`: The local username to auth against your Hue Bridge
- `HUE_GROUPID`: Hue Group to change the color of

## Features

The bot reads in the color from chat using `!color <name>`

### CSS Color

You can use most of the CSS colors like `!color lightblue` or `!color orange`.

### Hex Color

Additionally, you can pass the hex string of your choice `!color #112233`

### Random

If you don't have a preference, you can use `!color random`.

### Party

And if you want to make it really silly, you can use `!party` which changes to a random color every second for 15 seconds.

### Rate Limiting

Right now we have color changes limited to 1 per second (that's also the limit on the Hue API).  And parties are limited to 1 per minute (just because).