const { Task } = require("klasa");
const ModLog = require("../lib/structures/ModLog");

module.exports = class extends Task {

    async run({ guildID, userID }) {
        const guild = this.client.guilds.cache.get(guildID);
        const member = await guild.members.fetch(userID).catch(() => null);
        if (!guild || !member) return;

        const roleID = guild.settings.get("roles.muted");
        const role = await guild.roles.cache.get(roleID);

        if (!role) return;
        const myRole = guild.me.roles.highest;
        if (role.position > myRole.positon) return;

        const unmute = await member.roles.remove(role).catch(() => null);

        if (!unmute) return;

        if (guild.settings.get("channels.modlogs")) {
            await new ModLog(guild)
                .setType("unmute")
                .setModerator(this.client.user)
                .setReason("Timed Mute Limit Over")
                .setUser(member.user)
                .send();
        }
    }

};
