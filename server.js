require('dotenv').config(); // dados criptografados
const Discord = require("discord.js"); // integração discord
const { Player } = require("discord-music-player"); // biblioteca player
const { RepeatMode } = require('discord-music-player'); // modo repeat
const mongoose = require('mongoose');
const birthdaySchema = require('./birthday-schema')
const schedule = require('node-schedule');
const COOKIE = process.env.YOUTUBE_COOKIE
const YOUTUBE_ID_TOKEN = process.env.YOUTUBE_ID_TOKEN

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
    deafenOnJoin: true,
    ytdlRequestOptions: {headers:{
        Cookie: COOKIE,
        'x-youtube-identity-token': YOUTUBE_ID_TOKEN
    }}
});

discord.player = player;

discord.on("ready", () => {
    mongoose.connect(
        process.env.MONGO_URI,
        {
            keepAlive: true
        }
    )

    console.log("Pai ta on 😎");

    const guild = discord.guilds.cache.get(process.env.DISCORD_GUILDID)
    const channel = guild.channels.cache.get(process.env.DISCORD_CHANNELID);

    var j = schedule.scheduleJob('00 00 12 * * 0-6', async () => {
        var listBirthday = checkBirthday()

        listBirthday.then(total => {

            if (total.length >= 1) {
                console.log(total)
                channel.send('Gostaria de desejar em nome da familia monster um feliz aniversário a @' + total[0].username + ', muitas felicidades e saúde!');
            }   
            
        })
    });

    if (guild) {
        commands = guild.commands
    } else [
        commands = client.application?.commands
    ]


    // comandos aniversário

    commands?.create({
        name: 'birthdayadd',
        description: 'Adiciona um usuário a lista de aniversariantes',
        options: [
            {
                name: 'username',
                description: 'Nome do usuário',
                required: true,
                type: Discord.Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'data',
                description: 'Dia/Mes/Ano',
                required: true,
                type: Discord.Constants.ApplicationCommandOptionTypes.STRING
            },
        ]
    })

    commands?.create({
        name: 'birthdayremove',
        description: 'Remove um usuário da lista de aniversariantes',
        options: [
            {
                name: 'username',
                description: 'Nome do usuário',
                required: true,
                type: Discord.Constants.ApplicationCommandOptionTypes.STRING
            },
        ]
    })

    commands?.create({
        name: 'birthdaylist',
        description: 'Mostra a lista de aniversariantes',
    })

    commands?.create({
        name: 'birthdaynext',
        description: 'Indica o próximo aniversariante',
    })

    // comandos música

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

discord.on('error', (queue, err) => {
    console.error(err);
});

discord.on('uncaughtException', function (error) {
    console.error(error);
});

discord.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        return
    }
    
    const { commandName, options } = interaction

    const Guild = discord.guilds.cache.get(interaction.guildId);
    const Member = Guild.members.cache.get(interaction.user.id);

    let guildQueue = discord.player.getQueue(interaction.guildId);


    if (commandName === 'birthdayadd') {
        await interaction.deferReply();

        let usernameInput = options.getString('username');
        let birthdateInput = options.getString('data');
        let birthdateConverted = birthdateInput.replace(/\//g, "-").split("-").reverse().join("-");

        await new birthdaySchema({
            username: usernameInput,
            birthdate: birthdateConverted + 'T00:00:00.000Z' 
        }).save()

        await interaction.editReply({
            content: '**' + usernameInput + '** foi adicionado a lista de aniversariantes 📝',
            ephemeral: false
        })
    }

    if (commandName === 'birthdaylist') {
        await interaction.deferReply();


        let birthdayDoc = await birthdaySchema.aggregate([
            {
              $project: {
                username: 1,
                birthdate: {
                  $dateToString: {
                    format: "%d/%m/%Y",
                    date: "$birthdate"
                  }
                },
                month: { "$month": "$birthdate" },
                day: { "$dayOfMonth": "$birthdate" }
              }
            },
            {
                $sort: { "month": 1, 'day': 1 },
            },
            
        ])

        let birthdayList = ''
        let count = 0

        birthdayDoc.forEach(birthday => {
            birthdayList += count + '. ' + birthday.username + ' - ' + birthday.birthdate + '\n';
            count++
        });

        await interaction.editReply({
            content: '```' + birthdayList + '```',
            ephemeral: true
        })
    }

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
            if(!guildQueue){
                interaction.channelId.send('Ocorreu algum problema, xinga o preud 😡')
                queue.stop(); 
            }
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
            },
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

async function checkBirthday() {
    console.log('check niver')

    var dt = new Date();dt.setHours(dt.getHours() - 3 );
    let dayMonth = dt.getDate();
    let monthYear = dt.getMonth() + 1;

    let birthdayDoc = await birthdaySchema.aggregate([
        {
          $project: {
            username: 1,
            birthdate: {
              $dateToString: {
                format: "%d/%m/%Y",
                date: "$birthdate"
              }
            },
            month: { "$month": "$birthdate" },
            day: { "$dayOfMonth": "$birthdate" }
          }
        },
        {$match: {month: monthYear, day: dayMonth}}
        
    ])

    return birthdayDoc
}
