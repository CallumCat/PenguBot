const { Task } = require("klasa");
const ModLog = require("../lib/structures/ModLog");

module.exports = class extends Task {

    async run({ guildID, userID }) {
        const guild = this.client.guilds.cache.get(guildID);
        const user = await this.client.users.fetch(userID).catch(() => null);
        if (!guild || !user) return;

        const unban = await guild.members.unban(user).catch(() => null);
        if (!unban) return;

        if (guild.settings.get("channels.modlogs")) {
            await new ModLog(guild)
                .setType("unban")
                .setModerator(this.client.user)
                .setReason("Timed Ban Limit Over")
                .setUser(user)
                .send();
        }
    }

};
