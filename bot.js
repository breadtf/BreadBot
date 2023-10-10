const { Client, Intents, GatewayIntentBits, SlashCommandBuilder, REST, Routes, Events, EmbedBuilder } = require('discord.js');
const config = require("./config.json");
const { inspect } = require('util');
const express = require('express');

// const util = require('util');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
	    GatewayIntentBits.GuildMessages,
	    GatewayIntentBits.GuildMembers,
	    GatewayIntentBits.GuildPresences,
	    GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildPresences
    ]
});


const prefix = "!";
var latestMessage = "";
var latestMessageAuthor = "";
function randomRange(myMin, myMax) {

    return Math.floor(Math.random() * (myMax - myMin + 1)) + myMin;
}
async function cleanText(text, client) {
    if ( text && text.constructor.name == "Promise" )
        text = await text;

    if ( typeof text !== "string" )
        text = inspect(text, {depth: 1});

    return text.replace(client.BOT_TOKEN, "[REDACTED]");
}

client.on("messageCreate", function(message) {
    latestMessage = message.content.toString();
    latestMessageAuthor = message.author.tag.toString();
    console.log(message.author.tag + " - " + message.content)
    if (message.author.bot) return;
    logToLogs(message.author.tag + " - " + message.content)

    if (!message.content.startsWith(prefix)) return;
    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ', 1);
    const command = args.shift().toLowerCase();

    if (command === "ping") {
        message.reply(`fuck off`);                 
    } 
    else if (command === "rr") {
        random = randomRange(1, 6);
        if (random == 4){
            message.reply("*BANG*");
            try {
                let testRole = message.guild.roles.cache.find(role => role.id == config.RR_LOSSROLE)
                message.member.roles.add(testRole)
            } catch (e){
                console.log(e);
            }
        } else {
            message.reply("*click*")
        }
    }
    else if (command == "avatar"){
        if (args.indexOf("<@") == 0){
            message.reply("you gotta give me a user dude (mention them)");
            return
        }
        const user = args.toString().replace("<@", "").replace(">", "")

    }
    else if (command == "hex"){
        const text = args.toString();
        const buffer = Buffer.from(text, "utf8");
        const hex = buffer.toString("hex").match(/.{1,2}/g).join(" ");

        message.reply(`\`\`\`${hex}\`\`\``);
    }
    else if (command == "eval"){
        if (!message.member.roles.cache.has(config.EVALPERMROLE)){
            message.reply("you dont have perms.")
        } else{
            try{
                const util = require('util');
        
                const script = args;
        
                let result = '';
                const cons = {
                log: (...args) => result += (util.format(...args) + '\n'),
                };
                eval(`((console) => { ${script} })`)(cons);
                result = result.replace(client.BOT_TOKEN, "[token]")

                // const content = message.content;
                // let code = content.match(/^```[^\n]*\n(.+)\n```$/sm);
                // code = code ? code[1] : content;
        
                // const eval_func = eval(`${code}`);
                
                // const result = eval(args);
                // const clean = (cleanText(result || "", message.client));
                
                result = result.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '').replace("`", "'");
                const embed = new EmbedBuilder()
                    .setTitle("Output")
                    .setDescription(`\`\`\`${result}\`\`\``)
                    .setColor("Blue");

                message.reply({
                    embeds: [embed]
                });
            } catch (err){
                const embed = new EmbedBuilder()
                    .setTitle("Error, you fucked up... noob")
                    .setDescription(`\`\`\`${err}\`\`\``)
                    .setColor("Red");

                message.reply({
                    embeds: [embed]
                });               
            }
        }

    }
    else if (command == "run"){
        if (message.author.tag.toString() == config.OWNER_TAG){
            var spawn = require('child_process').spawn;
            var ls  = spawn(args.toString().split(" ")[0], args.toString().split(" ", 1)[1]);
            ls.stdout.on('data', function (data) {
               console.log(data);
            });
        }
        else{
            message.reply("no");
        }
    }
});

client.on("ready", () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    logToLogs(`${client.user.tag} is in your walls (bot started)`)
});


process.on("unhandledException", err => {
	console.error(err);

	client.channels.cache.get(config.LOGS_CHNNL).send("```xl\n" + err + "\n```");

});
process.on("uncaughtException", err => {
	console.error(err);

	client.channels.cache.get(config.LOGS_CHNNL).send("```xl\n" + `${err.message}\n\n${err.stack}` + "\n```");

});

function logToLogs(message){
    var stripped = message.toString().replace("`", "'")
    client.channels.cache.get(config.LOGS_CHNNL).send("```\n" + `${stripped}` + "\n```");
}

client.login(config.BOT_TOKEN);
