const { Command, MessageEmbed, config } = require("../../index");

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            cooldown: 15,
            aliases: ["counterstrike"],
            requiredPermissions: ["EMBED_LINKS", "ATTACH_FILES"],
            description: language => language.get("COMMAND_CSGO_DESCRIPTION"),
            usage: "<Username:string>",
            extendedHelp: "No extended help available."
        });
    }

    async run(msg, [username]) {
        try {
            const userData = await this.fetchURL(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/`, {
                query: { key: config.apis.csgo, vanityurl: username }
            });

            if (userData.response.success !== 1) throw `${this.client.emotes.cross} ***${msg.language.get("CMD_CSGO_NF")}***`;
            const steamID = userData.response.steamid;

            const userStats = await this.fetchURL(`http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/`, {
                query: { key: config.apis.csgo, appid: 730, steamid: steamID }
            });

            const { stats } = userStats.playerstats;
            return msg.sendMessage(new MessageEmbed()
                .setAuthor("Counter Strike : Global Offensive - PenguBot", "https://i.imgur.com/0S2t2qQ.png")
                .setFooter("© PenguBot.com")
                .setThumbnail("https://i.imgur.com/0S2t2qQ.png")
                .setColor("#FB9E01")
                .setTimestamp()
                .addField("❯ Steam Username", username, true)
                .addField("❯ KDR", (stats ? stats.find(a => a.name === "total_kills").value / stats.find(a => a.name === "total_deaths").value : 0).toFixed(2), true)
                .addField("❯ Total Kills", stats.find(a => a.name === "total_kills") ? stats.find(a => a.name === "total_kills").value.toLocaleString() : 0, true)
                .addField("❯ Total Deaths", stats.find(a => a.name === "total_deaths") ? stats.find(a => a.name === "total_deaths").value.toLocaleString() : 0, true)
                .addField("❯ Total Wins", stats.find(a => a.name === "total_wins") ? stats.find(a => a.name === "total_wins").value.toLocaleString() : 0, true)
                .addField("❯ Total MVPs", stats.find(a => a.name === "total_mvps") ? stats.find(a => a.name === "total_mvps").value.toLocaleString() : 0, true)
                .addField("❯ Time Played (Not Idle)", `${stats ? (stats.find(a => a.name === "total_time_played").value / 60 / 60).toFixed(2) : 0} Hour(s)`, true)
                .addField("❯ Knife Kills", stats.find(a => a.name === "total_kills_knife") ? stats.find(a => a.name === "total_kills_knife").value.toLocaleString() : 0, true));
        } catch (e) {
            return msg.reply("Oopsie! I came across an error, please try again or contact us!");
        }
    }

};
