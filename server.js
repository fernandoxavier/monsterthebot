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
    token: process.env.DISCORDJS_BOT_TOKEN
};

const player = new Player(discord, {
    leaveOnEmpty: true,
    leaveOnEnd: false,
    deafenOnJoin: true
});

discord.player = player;

discord.on("ready", () => {
    console.log("Pai ta on 😎");

    const guild = discord.guilds.cache.get(process.env.DISCORD_GUILDID)

    if (guild) {
        commands = guild.commands
    } else [
        commands = client.application?.commands
    ]

    commands?.create({
        name: 'play',
        description: 'Toca uma música',
        options: [
            {
                name: 'query',
                description: 'Nome ou link da música',
                required: true,
                type: Discord.Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    })

    commands?.create({
        name: 'playlist',
        description: 'Toca uma playlist',
        options: [
            {
                name: 'query',
                description: 'Link da playlist',
                required: true,
                type: Discord.Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    })

    commands?.create({
        name: 'stop',
        description: 'Para a playlist',
    })

    commands?.create({
        name: 'skip',
        description: 'Pula a música atual',
    })

    commands?.create({
        name: 'disableloop',
        description: 'Desabilita o loop',
    })

    commands?.create({
        name: 'loop',
        description: 'Habilita o loop da música atual',
    })

    commands?.create({
        name: 'queueloop',
        description: 'Habilita o loop da playlist atual',
    })

    commands?.create({
        name: 'setvolume',
        description: 'Muda o volume da música de 0 a 100, exemplo "/setvolume 50"',
        options: [
            {
                name: 'volume',
                description: 'O valor do volume',
                required: true,
                type: Discord.Constants.ApplicationCommandOptionTypes.NUMBER
            }
        ]
    })

    commands?.create({
        name: 'clear',
        description: 'Limpa a queue atual',
    })

    commands?.create({
        name: 'shuffle',
        description: 'Randomiza a ordem da queue atual',
    })

    commands?.create({
        name: 'queue',
        description: 'Mostra a queue atual de músicas',
    })

    commands?.create({
        name: 'volume',
        description: 'Mostra o volume atual da música',
    })

    commands?.create({
        name: 'song',
        description: 'Mostra a música atual tocando',
    })

    commands?.create({
        name: 'pause',
        description: 'Pausa a música atual',
    })

    commands?.create({
        name: 'resume',
        description: 'Retoma a música atual',
    })

    commands?.create({
        name: 'remove',
        description: 'Remove o som indicado, verificar id da música com "/queue"',
        options: [
            {
                name: 'songid',
                description: 'O id da música',
                required: true,
                type: Discord.Constants.ApplicationCommandOptionTypes.NUMBER
            }
        ]
    })

});

discord.login(settings.token);

discord.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        return
    }
    
    const { commandName, options } = interaction

    const Guild = discord.guilds.cache.get(interaction.guildId);
    const Member = Guild.members.cache.get(interaction.user.id);

    let guildQueue = discord.player.getQueue(interaction.guildId);

    if (commandName === 'ping') {
        interaction.reply({
            content: 'pong',
            ephemeral: false
        })
    }

    if (commandName === "play") {
        await interaction.deferReply();

        const query = options.getString('query');

        let queue = discord.player.createQueue(interaction.guildId, {
            data: {
                queueInitMessage: interaction,
            }
        });

        await queue.join(Member.voice.channel);
        
        let song = await queue.play(query).catch(_ => {
            if(!guildQueue)
                interaction.channelId.send('Ocorreu algum problema, xinga o preud 😡')
                queue.stop(); 
        }); 

        await interaction.editReply({
            content: '🎵  **Procurando** 🔎' + '`' + query + '`' + '\n' + 
            '**Adicionada a queue 🎶 **`' + song + '`',
            ephemeral: false
        })
        
    }

    if (commandName === 'playlist') {
        await interaction.deferReply();

        const query = options.getString('query');

        let queue = discord.player.createQueue(interaction.guildId, {
            data: {
                queueInitMessage: interaction,
            }
        });

        await queue.join(Member.voice.channel);

        let song = await queue.playlist(query).catch(_ => {
            if(!guildQueue)
                interaction.channelId.send('Ocorreu algum problema, xinga o preud 😡')
                queue.stop();
        });

        await interaction.editReply({
            content: '🎶 **Playlist adicionada!** 👍',
            ephemeral: false
        })

    }

    if (commandName === 'skip') {
        guildQueue.skip();
        await interaction.reply({
            content: '⏩ **Skipado** 👍',
            ephemeral: false
        })
    }

    if (commandName === 'stop') {
        guildQueue.stop();
        message.channel.send('⏩ **Skipado** 👍');
        await interaction.reply({
            content: '⏩ **Skipado** 👍',
            ephemeral: false
        })
    }

    if (commandName === 'disableloop') {
        guildQueue.setRepeatMode(RepeatMode.DISABLED); 
        await interaction.reply({
            content: '🔂 **Loop desabilitado** ⛔️',
            ephemeral: false
        })
    }

    if (commandName === 'loop') {
        guildQueue.setRepeatMode(RepeatMode.SONG);
        await interaction.reply({
            content: '🔁 **Loop habilitado** ✅',
            ephemeral: false
        })
    }

    if (commandName === 'queueloop') {
        guildQueue.setRepeatMode(RepeatMode.QUEUE);
        await interaction.reply({
            content: '🔁 **Loop da queue habilitado** ✅',
            ephemeral: false
        })
    }

    if (commandName === 'setvolume') {
        let volume = interaction.options.getNumber('volume');

        guildQueue.setVolume(volume);

        await interaction.reply({
            content: '🔊 **Volume alterado** 👍',
            ephemeral: false
        })
    }

    if (commandName === 'clear') {
        guildQueue.clearQueue();
        message.channel.send('');
        await interaction.reply({
            content: '🗑 **Queue limpa** 👍',
            ephemeral: false
        })
    }

    if(commandName === 'shuffle') {
        guildQueue.shuffle();
        await interaction.reply({
            content: '🔀 **Shuffle realizado** 👍',
            ephemeral: false
        })
    }

    if(commandName === 'queue') {
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

        await interaction.reply({
            content: '```' + songList + '```',
            ephemeral: false
        })
    }

    if(commandName === 'volume') {
        await interaction.reply({
            content: '🔊 **Volume atual**' + '`' + guildQueue.volume + '`',
            ephemeral: false
        })
    }

    if(commandName === 'song') {
        await interaction.reply({
            content: '🎵 **Tocando agora**' + '`' + guildQueue.nowPlaying + '`',
            ephemeral: false
        })
    }

    if(commandName === 'pause') {
        guildQueue.setPaused(true);
        
        await interaction.reply({
            content: '⏸ **Queue pausada**',
            ephemeral: false
        })
    }

    if(commandName === 'resume') {
        guildQueue.setPaused(false);

        await interaction.reply({
            content: '▶️ **Queue despausada**',
            ephemeral: false
        })
    }

    if(commandName === 'remove') {
        let songId = interaction.options.getNumber('songid');

        guildQueue.setVolume(volume);

        await interaction.reply({
            content: '**✂️ Removido da queue** `' + guildQueue.songs[songId].name + '`',
            ephemeral: false
        })

        guildQueue.remove(parseInt(volume));
        
    }

})
