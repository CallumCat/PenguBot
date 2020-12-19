const { Monitor, ServerLog, config } = require("../index");

module.exports = class extends Monitor {

    constructor(...args) {
        super(...args, { ignoreOthers: false });
    }

    async run(msg) {
        if (!msg.guild || !msg.content || msg.command) return;
        if (!msg.guild.settings.get("toggles.perspective")) return;

        if (msg.guild.settings.get("toggles.staffbypass") && await msg.hasAtLeastPermissionLevel(3)) return;

        const body = await this.fetchURL("https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze", {
            query: { key: config.apis.perspective },
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({
                comment: { text: msg.content },
                requestedAttributes: { SEVERE_TOXICITY: {}, TOXICITY: {}, OBSCENE: {}, THREAT: {}, SEXUALLY_EXPLICIT: {}, SPAM: {}, PROFANITY: {} }
            })
        }).catch(() => null);

        if (!body) return;

        const perspectiveMap = msg.guild.settings.get("automod.perspective");
        const perspective = Object.fromEntries(perspectiveMap);

        for (const key of Object.keys(body.attributeScores)) {
            if (!perspective[key].enabled) continue;
            if (body.attributeScores[key].summaryScore.value >= perspective[key].threshold) {
                await msg.delete().catch(() => null);
                await new ServerLog(msg.guild)
                    .setColor("red")
                    .setType("automod")
                    .setName(`Automod - Perspective | ${key}`)
                    .setAuthor(`${msg.author.tag} in #${msg.channel.name}`, msg.author.displayAvatarURL())
                    .setMessage(`**Content:**\n${msg.content}`)
                    .send();
            }
        }
    }

};
