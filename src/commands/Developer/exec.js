const { Command, util: { exec, codeBlock } } = require("klasa");

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ["execute"],
            description: "-BOT OWNER ONLY-",
            guarded: true,
            hidden: true,
            permissionLevel: 10,
            usage: "<expression:string>"
        });
    }

    async run(msg, [input]) {
        const result = await exec(input, { timeout: "timeout" in msg.flagArgs ? Number(msg.flagArgs.timeout) : 60000 })
            .catch(error => ({ stdout: null, stderr: error }));
        const output = result.stdout ? `**\`OUTPUT\`**${codeBlock("prolog", result.stdout)}` : "";
        const outerr = result.stderr ? `**\`ERROR\`**${codeBlock("prolog", result.stderr)}` : "";

        return msg.sendMessage([output, outerr].join("\n"));
    }

};
