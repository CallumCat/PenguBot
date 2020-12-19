const { Task, Colors, SnowflakeUtil } = require("../index");

// THRESHOLD equals to 30 minutes in milliseconds:
//     - 1000 milliseconds = 1 second
//     - 60 seconds        = 1 minute
//     - 10 minutes
const THRESHOLD = 1000 * 60 * 10;

module.exports = class MemorySweeper extends Task {

    constructor(...args) {
        super(...args);

        // The colors to stylise the console's logs
        this.colors = {
            red: new Colors({ text: "lightred" }),
            yellow: new Colors({ text: "lightyellow" }),
            green: new Colors({ text: "green" })
        };

        // The header with the console colors
        this.header = new Colors({ text: "lightblue" }).format("[CACHE CLEANUP]");
    }

    async run() {
        const OLD_SNOWFLAKE = SnowflakeUtil.generate(Date.now() - THRESHOLD);
        let guildMembers = 0, emojis = 0, lastMessages = 0, users = 0;

        // Per-Guild sweeper
        for (const guild of this.client.guilds.cache.values()) {
            // Clear members that haven't send a message in the last 30 minutes
            const { me } = guild;
            for (const [id, member] of guild.members.cache) {
                if (member === me) continue;
                if (member.voice.channelID) continue;
                if (member.lastMessageID && member.lastMessageID > OLD_SNOWFLAKE) continue;
                guildMembers++;
                guild.members.cache.delete(id);
            }

            // Clear emojis
            emojis += guild.emojis.cache.size;
            guild.emojis.cache.clear();
        }

        // Per-Channel sweeper
        for (const channel of this.client.channels.cache.values()) {
            if (!channel.lastMessageID) continue;
            channel.lastMessageID = null;
            lastMessages++;
        }

        // Per-User sweeper
        for (const user of this.client.users.cache.values()) {
            if (user.lastMessageID && user.lastMessageID > OLD_SNOWFLAKE) continue;
            this.client.users.cache.delete(user.id);
            users++;
        }

        // Emit a log
        this.client.console.verbose(`${this.header} ${
            this.setColor(guildMembers)} [GuildMember]s | ${
            this.setColor(users)} [User]s | ${
            this.setColor(emojis)} [Emoji]s | ${
            this.setColor(lastMessages)} [Last Message]s.`);
    }

    /**
	 * Set a colour depending on the amount:
	 * > 1000 : Light Red colour
	 * > 100  : Light Yellow colour
	 * < 100  : Green colour
	 * @since 3.0.0
	 * @param {number} number The number to colourise
	 * @returns {string}
	 */
    setColor(number) {
        const text = String(number).padStart(5, " ");
        // Light Red color
        if (number > 1000) return this.colors.red.format(text);
        // Light Yellow color
        if (number > 100) return this.colors.yellow.format(text);
        // Green color
        return this.colors.green.format(text);
    }

};
