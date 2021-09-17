require('dotenv').config(); // dados criptografados
const PastebinAPI = require('pastebin-ts'); // pastebin
const tmi = require('tmi.js'); // integração twitch
const Discord = require("discord.js"); // integração discord
const { Player } = require("discord-music-player"); // biblioteca player
const { RepeatMode } = require('discord-music-player'); // modo repeat

// config pastebin
const pastebin = new PastebinAPI({
    'api_dev_key': process.env.PASTEBIN_API_KEY,
    'api_user_name': process.env.PASTEBIN_USERNAME,
    'api_user_password': process.env.PASTEBIN_PASSWORD
});

// INICIO TWITCH //

// comandos chat twitch
const commandsTwitch = {
    sr: {
        response: (argument) => `A música ${argument} foi adicionada à playlist!`
    },
    song: {
        response: (argument) => `A música ${argument} foi adicionada à playlist!`
    },
    songlist: {
        response: (argument) => `A música ${argument} foi adicionada à playlist!`
    },
    kit: {
        response: 'Aqui nós 🧘 temos o kit mito 🇧🇷 bonézinho 🧢 calendário 📆 o copo 🥤 do mito 🇧🇷 o adesivo do mito 🇧🇷 já 🕑 é 🦧 pra 2022 🎆 todo mundo colocando no celular 📱 o óculos 🕶️ do mito 🇧🇷 a camisa do mito 👕 🇧🇷 o abridor do mito 🤗 🇧🇷 o mitoclock 🇧🇷 ⌚ que é sucesso 👌'
    }
}

// obj twitch bot
const twitchBot = new tmi.Client({
    connection: {
        reconnect: true
    },
    channels: ['AnaTheMonster'],
    identity: {
        username: process.env.TWITCH_BOT_USERNAME,
        password: process.env.TWITCH_OAUTH_TOKEN
    },
});

// conecta no chat da twitch 
twitchBot.connect();

// evento de mensagem no chat da twitch
twitchBot.on('message', async (channel, context, message) => {

    // verifica se é mensagem do bot
    const isNotBot = context.username.toLowerCase() !== process.env.TWITCH_BOT_USERNAME.toLowerCase();
    console.log(`${message}`);
    if (!isNotBot) return;


    const [raw, command, argument] = message.match(regexpCommand);

    const {
        response
    } = commandsTwitch[command] || {};

    // funções twitch
    if (typeof response === 'function') {
        if (command == 'sr') {
            discord.channels.cache.get('753397528753602592').send(`${prefix}play ${argument}`);
        } else if (command == 'song') {
            client.say(`#anathemonster`, `A música atual é ${songQueue[0].title}`);
        } else if (command == 'songlist') {
            songList()
        }
    } else if (typeof response === 'string') {
        client.say(channel, response);
    }
});

// songlist do chat da twitch (pastebin)
function songList() {
    var fs = require('fs');


    let count = 1;
    let jsonText = '';

    // escreve no arquivo de texto
    for (const [key, value] of Object.entries(songQueue)) {
        jsonText += count + '. ' + value.title + ' - ' + value.url + '\r\n';
        count++;
    }


    fs.writeFile("test.txt", jsonText, function (err) {
        if (err) {
            console.log(err);
        }
        pastebin
            .createPasteFromFile({
                'file': './test.txt',
                'title': 'songlist'
            })
            .then((data) => {
                // we have succesfully pasted it. Data contains the id
                console.log(data);
                client.say(`#anathemonster`, `Link para a playlist atual: ${data}`);
            })
            .catch((err) => {
                console.log(err);
            });
    });
}

// FIM TWITCH //

// INICIO DISCORD //

const discord = new Discord.Client({
    intents: [ 'GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES']
});

const settings = {
    prefix: '-',
    token: process.env.DISCORDJS_BOT_TOKEN
};


const player = new Player(discord, {
    leaveOnEmpty: false,
});

discord.player = player;

discord.on("ready", () => {
    console.log("Pai ta on 😎");
});

discord.login(settings.token);

discord.on('messageCreate', async (message) => {
    const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
    const command = args.shift();
    let guildQueue = discord.player.getQueue(message.guild.id);

    if(command === 'play' || command === 'p') {
        let queue = discord.player.createQueue(message.guild.id, {
            data: {
                queueInitMessage: message,
            }
        });
        await queue.join(message.member.voice.channel);
        let song = await queue.play(args.join(' ')).catch(_ => {
            if(!guildQueue)
                message.channel.send('Ocorreu algum problema, xinga o preud 😡')
                queue.stop(); 
        });



        console.log('song', song);
        console.log('msg', message);
        console.log('msg', args);

        message.channel.send('🎵  **Procurando** 🔎' + '`' + args + '`' + '\n' + 
        '**Adicionada a queue 🎶 **`' + song + '`');
        
    }

    if(command === 'playlist') {
        let queue = discord.player.createQueue(message.guild.id, {
            data: {
                queueInitMessage: message,
            }
        });
        await queue.join(message.member.voice.channel);
        let song = await queue.playlist(args.join(' ')).catch(_ => {
            if(!guildQueue)
                message.channel.send('Ocorreu algum problema, xinga o preud 😡')
                queue.stop();
        });

        message.channel.send(`🎶 **Playlist adicionada!** 👍`);
    }

    if(command === 'skip') {
        guildQueue.skip();
        message.channel.send('⏩ **Skipado** 👍');
    }

    if(command === 'stop') {
        guildQueue.stop();
        message.channel.send('⏩ **Skipado** 👍');
    }

    if(command === 'disableLoop') {
        guildQueue.setRepeatMode(RepeatMode.DISABLED); 
        message.channel.send('🔂 **Loop desabilitado** ⛔️');
    }

    if(command === 'loop') {
        guildQueue.setRepeatMode(RepeatMode.SONG);
        message.channel.send('🔁 **Loop habilitado** ✅');
    }

    if(command === 'queueLoop') {
        guildQueue.setRepeatMode(RepeatMode.QUEUE);
        message.channel.send('🔁 **Loop da queue habilitado** ✅');
    }

    if(command === 'setVolume') {
        guildQueue.setVolume(parseInt(args[0]));
        message.channel.send('🔊 **Volume alterado** 👍');
    }

    if(command === 'seek') {
        guildQueue.seek(parseInt(args[0]) * 1000);
    }

    if(command === 'clear') {
        guildQueue.clearQueue();
        message.channel.send('🗑 **Queue limpa** 👍');
    }

    if(command === 'shuffle') {
        guildQueue.shuffle();
        message.channel.send('🔀 **Shuffle realizado** 👍');
    }

    if(command === 'queue' || command === 'q') {

        let songList = '';
        let count = 0;
        
        console.log(guildQueue.songs)

        guildQueue.songs.forEach(song => {

            if (count == 0) {
                songList += count + '. ' + song.name + ' - **tocando agora** 🎵' + '\n';
            } else {
                songList += count + '. ' + song.name + '\n';
            }
            
            count++
        });

        message.channel.send('```' + songList + '```');
    }

    if(command === 'volume') {
        console.log(guildQueue.volume)
        message.channel.send('🔊 **Volume atual**' + '`' + guildQueue.volume + '`');
    }

    if(command === 'song') {
        message.channel.send('🎵 **Tocando agora**' + '`' + guildQueue.nowPlaying + '`');
    }

    if(command === 'pause') {
        guildQueue.setPaused(true);
        message.channel.send('⏸ **Queue pausada**');
    }

    if(command === 'resume') {
        guildQueue.setPaused(false);
        message.channel.send('▶️ **Queue despausada**');
    }

    if(command === 'remove') {
        message.channel.send('**✂️ Removido da queue** `' + guildQueue.songs[args[0]].name + '`' );
        guildQueue.remove(parseInt(args[0]));
    }
})