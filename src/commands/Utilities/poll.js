const { Command } = require("../../index");

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            cooldown: 10,
            aliases: ["strawpoll", "createpoll"],
            requiredPermissions: ["EMBED_LINKS", "USE_EXTERNAL_EMOJIS"],
            description: language => language.get("COMMAND_POLL_DESCRIPTION"),
            usage: "<Question:string> <Options:string{2,30}> [...]",
            usageDelim: "|",
            extendedHelp: "No extended help available."
        });
    }

    async run(msg, [title, ...options]) {
        try {
            const data = await this.fetchURL("https://www.strawpoll.me/api/v2/polls", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    options,
                    multi: "multi" in msg.flagArgs ? msg.flagArgs.multi : true,
                    captcha: "captcha" in msg.flagArgs ? msg.flagArgs.captcha : true
                })
            });
            return msg.sendMessage(`<:penguCheck1:431440099675209738> ***Here's the poll you requested:*** https://www.strawpoll.me/${data.id}`);
        } catch (e) {
            return msg.sendMessage(":penguError: There was an error trying to create this poll, please try again.");
        }
    }

};
