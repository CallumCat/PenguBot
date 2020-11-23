const { Command, RichDisplay, MessageEmbed } = require("../../../index");

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            cooldown: 5,
            aliases: ["configure", "setup"],
            permissionLevel: 6,
            requiredPermissions: ["USE_EXTERNAL_EMOJIS"],
            description: "Configure PenguBot on your server.",
            extendedHelp: "No extended help available.",
            usage: "[general|music|autoroles|levelroles|selfroles|automod|logs|moderation|customcommands|greetings] [setting:string] [value:string] [...]",
            usageDelim: " ",
            subCommands: true
        });
    }

    async run(msg, [type, ...params]) {
        if (type) return this[type](msg, params);

        const prefix = msg.guild.settings.get("prefix") || "p!";
        const embed = new MessageEmbed()
            .setTitle("Settings Menu")
            .addField("⚙️ General", `${prefix}settings general`, true)
            .addField("🎵 Music", `${prefix}settings music`, true)
            .addField("🧑‍🦱 Auto Join Roles", `${prefix}settings autoroles`, true)
            .addField("⬆️ Level Based Roles", `${prefix}settings levelroles`, true)
            .addField("🙇 Self Assignable Roles", `${prefix}settings selfroles`, true)
            .addField("🤖 Auto and AI Moderation", `${prefix}settings automod`, true)
            .addField("🗨️ Logging", `${prefix}settings logs`, true)
            .addField("⚔️ Moderation", `${prefix}settings moderation`, true)
            .addField("🛠️ Custom Commands", `${prefix}settings customcommands`, true)
            .addField("💁 Welcome and Leave Messages", `${prefix}settings greetings`, true)
            .setFooter("PenguBot.com")
            .setTimestamp();

        return msg.sendEmbed(embed);
    }

    // --- GENERAL SETTINGS ---
    async general(msg, [setting, value]) {
        if (!setting) {
            const prefix = msg.guild.settings.get("prefix") || "p!";
            const embed = new MessageEmbed()
                .setTitle("⚙️ General - Settings")
                .addField("Prefix", `${prefix}settings general prefix <prefix>`)
                .addField("Toggle a Command", `${prefix}settings general togglecmd <command>`)
                .addField("Toggle a Command Category", `${prefix}settings general togglecategory <category>`)
                .addField("Change Language", `${prefix}settings general language <language>`)
                .setFooter("PenguBot.com")
                .setTimestamp();

            return msg.sendEmbed(embed);
        }

        setting = setting.toLowerCase();
        switch (setting) {
            case "prefix": {
                await this.client.commands.get("prefix").run(msg, [value]);
                break;
            }
            case "togglecmd": {
                const arg = await this.client.arguments.get("command").run(value);
                await this.client.commands.get("disablecmd").run(msg, [arg]);
                break;
            }
            case "togglecategory": {
                await this.client.commands.get("togglecategory").run(msg, [value]);
                break;
            }
            case "language": {
                await this.client.commands.get("setlanguage").run(msg, [value]);
                break;
            }
            default: {
                await msg.reply("That setting is not a valid option, please select a valid setting to update.");
            }
        }
    }

    // --- MUSIC SETTINGS ---
    async music(msg, [setting, ...value]) {
        if (!setting) {
            const prefix = msg.guild.settings.get("prefix") || "p!";
            const embed = new MessageEmbed()
                .setTitle("🎵 Music - Settings")
                .addField("Volume", `${prefix}settings music volume [volume]`)
                .addField("Toggle DJ Mode", `${prefix}settings music toggledj`)
                .addField("Add DJ Member/Role", `${prefix}managedj add <role|user>`)
                .addField("Remove DJ Member/Role", `${prefix}managedj remove <role|user>`)
                .addField("List DJ Members/Roles", `${prefix}managedj list`)
                .setFooter("PenguBot.com")
                .setTimestamp();

            return msg.sendEmbed(embed);
        }

        setting = setting.toLowerCase();
        switch (setting) {
            case "volume": {
                await this.client.commands.get("volume").run(msg, [value.length ? value[0] : ""]);
                break;
            }
            case "toggledj": {
                await this.client.commands.get("toggledj").run(msg);
                break;
            }
            default: {
                await msg.reply("That setting is not a valid option, please select a valid setting to update.");
            }
        }
    }

    // --- AUTOROLES SETTINGS ---
    async autoroles(msg, [setting]) {
        if (!setting) {
            const prefix = msg.guild.settings.get("prefix") || "p!";
            const embed = new MessageEmbed()
                .setTitle("🧑‍🦱 Auto Join Roles - Settings")
                .setDescription("**Info:** These roles get added to a user as soon as they join the server.")
                .addField("Add Auto Role", `${prefix}addautorole <role>`)
                .addField("Remove Auto Role", `${prefix}removeautorole <role>`)
                .addField("Toggle Auto Roles", `${prefix}settings autoroles toggle`)
                .addField("List Auto Roles", `${prefix}settings autoroles list`)
                .setFooter("PenguBot.com")
                .setTimestamp();

            return msg.sendEmbed(embed);
        }

        setting = setting.toLowerCase();
        switch (setting) {
            case "toggle": {
                await this.client.commands.get("toggleautoroles").run(msg);
                break;
            }
            case "list": {
                const roles = msg.guild.settings.get("roles.autorole");
                if (!roles.length) return msg.sendMessage(`${this.client.emotes.cross} There are currently no auto join roles set for this server.`);
                const pages = new RichDisplay(new MessageEmbed()
                    .setTitle("Use the reactions to change pages, select a page, or stop viewing the roles")
                    .setAuthor("List of Auto Join Roles", msg.guild.iconURL())
                    .setDescription("Scroll between pages to see the self assignable roles.")
                    .setColor("#428bca")
                );
                pages.addPage(t => t.setDescription(roles.map(role => `\`-\` ${msg.guild.roles.cache.get(role) || "Role Removed"}`).join("\n")));

                pages.run(await msg.sendMessage(`${this.client.emotes.loading} ***Loading Roles...***`), {
                    time: 120000,
                    filter: (reaction, user) => user === msg.author
                });
                break;
            }
            default: {
                await msg.reply("That setting is not a valid option, please select a valid setting to update.");
            }
        }
    }

    // --- LEVEL ROLES SETTINGS ---
    async levelroles(msg, [setting]) {
        if (!setting) {
            const prefix = msg.guild.settings.get("prefix") || "p!";
            const embed = new MessageEmbed()
                .setTitle("⬆️ Level Roles - Settings")
                .setDescription("**Info:** These roles get added to a user as soon as they level up to a particular level on the server.")
                .addField("Add Level Role", `${prefix}managelevelrole add <role> <level>`)
                .addField("Remove Level Role", `${prefix}managelevelrole remove <role> <level>`)
                .addField("Toggle Level Roles", `${prefix}settings levelroles toggle`)
                .addField("List Level Roles", `${prefix}settings levelroles list`)
                .setFooter("PenguBot.com")
                .setTimestamp();

            return msg.sendEmbed(embed);
        }

        setting = setting.toLowerCase();
        switch (setting) {
            case "toggle": {
                await this.client.commands.get("togglelevelroles").run(msg);
                break;
            }
            case "list": {
                await this.client.commands.get("listlevelroles").run(msg);
                break;
            }
            default: {
                await msg.reply("That setting is not a valid option, please select a valid setting to update.");
            }
        }
    }

    // --- WELCOME AND LEAVE MESSAGE SETTINGS ---
    async greetings(msg, [setting, ...value]) {
        if (!setting) {
            const prefix = msg.guild.settings.get("prefix") || "p!";
            const embed = new MessageEmbed()
                .setTitle("💁 Welcome and Leave Messages - Settings")
                .setDescription("**Tip:** You can use the following in your Welcome and Leave messages and they'll be replaced with the value automatically: `{mention}`, `{server}`, `{username}`, `{user.tag}`, `{user.id}` and `{members}`.")
                .addField("Toggle Welcome Messages", `${prefix}settings greetings togglewelcome`)
                .addField("Toggle Leave Messages", `${prefix}settings greetings toggleleave`)
                .addField("Welcome Message", `${prefix}settings greetings welcomemsg <message>`)
                .addField("Leave Message", `${prefix}settings greetings leavemsg <message>`)
                .addField("Welcome Channel", `${prefix}settings greetings welcomechannel <channel>`)
                .addField("Leave Channel", `${prefix}settings greetings leavechannel <channel>`)
                .setFooter("PenguBot.com")
                .setTimestamp();

            return msg.sendEmbed(embed);
        }

        setting = setting.toLowerCase();
        switch (setting) {
            case "togglewelcome": {
                await this.client.commands.get("togglewelcome").run(msg);
                break;
            }
            case "toggleleave": {
                await this.client.commands.get("toggleleave").run(msg);
                break;
            }
            case "welcomemsg": {
                console.log(value);
                await this.client.commands.get("setwelcomemsg").run(msg, [value.join(" ")]);
                break;
            }
            case "leavemsg": {
                await this.client.commands.get("setleavemsg").run(msg, [value.join(" ")]);
                break;
            }
            case "welcomechannel": {
                if (!value.length) return msg.reply("You must provide a channel to use this setting.");
                const arg = await this.client.arguments.get("channelname").run(value[0], null, msg);
                await this.client.commands.get("setwelcomechannel").run(msg, [arg]);
                break;
            }
            case "leavechannel": {
                if (!value.length) return msg.reply("You must provide a channel to use this setting.");
                const arg = await this.client.arguments.get("channelname").run(value[0], null, msg);
                await this.client.commands.get("setleavechannel").run(msg, [arg]);
                break;
            }
            default: {
                await msg.reply("That setting is not a valid option, please select a valid setting to update.");
            }
        }
    }

};
