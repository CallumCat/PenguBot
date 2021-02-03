/* eslint-disable no-unused-expressions */
const { Command, ModLog, Duration, Permissions: { FLAGS } } = require("../../index");

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            cooldown: 8,
            aliases: ["togglemute", "unmute"],
            permissionLevel: 3,
            requiredPermissions: ["USE_EXTERNAL_EMOJIS"],
            description: language => language.get("COMMAND_MUTE_DESCRPTION"),
            usage: "<member:membername> [reason:string] [...]",
            extendedHelp: "No extended help available."
        });
    }

    async run(msg, [member, ...reason]) {
        reason = reason ? reason.join(" ") : null;

        if (member.id === msg.author.id) return msg.reply(`${this.client.emotes.cross} ***You can not mute yourself...***`);
        if (member.id === this.client.user.id) return msg.reply(`${this.client.emotes.cross} ***Why would you want to mute Pengu?***`);

        const roleID = await this.dbQueryFetch(msg);
        if (!roleID || !msg.guild.roles.cache.has(roleID)) await this.createRole(msg);

        const role = await msg.guild.roles.fetch(await this.dbQueryFetch(msg)).catch(() => null);
        if (!role) return msg.sendMessage("There was an error, I couldn't find the Muted role! Please try again or contact us at: https://discord.gg/u8WYw5r");

        const myRole = msg.guild.me.roles.highest;
        if (role.position > myRole.positon) return msg.sendMessage(`${this.client.emotes.cross} ***The \`PENGUMUTED\` role is above my role in the hierarchy, please change the order and try again.***`);

        const highestRole = member.roles.highest;
        if (myRole.position < highestRole.positon) return msg.sendMessage(`${this.client.emotes.cross} ***That user has a role above my role in the hierarchy, please change the order and try again.***`);

        const time = msg.flagArgs.time || msg.flagArgs.duration || msg.flagArgs.tempmute;
        let duration = null;
        time ? duration = new Duration(time) : null;
        if (time && (duration.offset < 1 || duration.offset > 2592000000)) throw `${this.client.emotes.cross} ***Duration is invalid, try something like 1 hour, 1 day, etc. Maximum 30 days.***`;

        if (member.roles.cache.has(role.id)) {
            await member.roles.remove(role.id)
                .catch(e => msg.reply(`${this.client.emotes.cross} ***There was an error: ${e}***`));

            if (msg.guild.settings.get("channels.modlogs")) {
                await new ModLog(msg.guild)
                    .setType("unmute")
                    .setModerator(msg.author)
                    .setReason(reason)
                    .setUser(member.user)
                    .send();
            }

            return msg.sendMessage(`${this.client.emotes.check} ***${member.user.tag} ${msg.language.get("MESSAGE_UNMUTED")}***`);
        } else {
            await member.roles.add(role.id)
                .catch(e => msg.reply(`${this.client.emotes.cross} ***There was an error: ${e}***`));

            if (msg.guild.settings.get("channels.modlogs")) {
                await new ModLog(msg.guild)
                    .setType("mute")
                    .setModerator(msg.author)
                    .setReason(reason)
                    .setUser(member.user)
                    .send();
            }

            if (time) await this.client.schedule.create("timedMute", new Duration(time), { data: { guildID: msg.guild.id, userID: member.id }, catchUp: true });
            return msg.sendMessage(`${this.client.emotes.check} ***${member.user.tag} ${msg.language.get("MESSAGE_MUTED")}${time ? ` Temp Mute for: ${time}` : ""}***`);
        }
    }

    async createRole(msg) {
        if (!msg.guild.me.permissions.has("MANAGE_ROLES")) throw msg.sendMessage(`${this.client.emotes.cross} ***I do not have \`MANAGE ROLES\` permissions. Please assign the permission and try again.***`);

        const newRole = await msg.guild.roles.create({
            data: {
                name: "PENGUMUTED",
                permissions: [FLAGS.VIEW_CHANNEL]
            }
        }).catch(() => null);
        if (!newRole) throw msg.reply(`There was an error. Make sure Pengu has appropriate permissions and try again.`);

        await this.dbQueryUpdate(msg, newRole.id);

        const promises = [];
        for (const channel of msg.guild.channels.cache.values()) promises.push(channel.updateOverwrite(newRole, { SEND_MESSAGES: false, ADD_REACTIONS: false, CONNECT: false }, `Mute Command Executed By ${msg.author.tag}`));
        // Catching for channels that don't allow permission
        await Promise.all(promises).catch(() => null);
    }

    async dbQueryUpdate(msg, roleID) {
        const r = this.client.providers.default.db;
        const query = await r.table("guilds").get(msg.guild.id)
            .update({ roles: { muted: roleID } })
            .run()
            .catch(e => {
                console.error(`${this.name} error:\n${e}`);
                throw `There was an error, please contact us on our support server: <https://pengubot.com/support>\n${e}`;
            });

        await msg.guild.settings.sync(true);
        return query;
    }

    async dbQueryFetch(msg) {
        const r = this.client.providers.default.db;
        const query = await r.table("guilds").get(msg.guild.id)
            .getField("roles")
            .run()
            .catch(e => {
                console.error(`${this.name} error:\n${e}`);
                throw `There was an error, please contact us on our support server: <https://pengubot.com/support>\n${e}`;
            });

        if (!query.muted) return null;
        return query.muted;
    }

};
