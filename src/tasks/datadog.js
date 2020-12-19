const { Task } = require("../index");

module.exports = class MemorySweeper extends Task {

    async run() {
        if (!this.client.ready) return;
        let [users, guilds, vc, cpm] = [0, 0, 0, 0];
        const results = await this.client.shard.broadcastEval(`[this.guilds.cache.reduce((prev, val) => val.memberCount + prev, 0), this.guilds.cache.size, this.music.filter(music => music.playing).size, this.health.commands.cmdCount[59].count]`);

        for (const result of results) {
            users += result[0];
            guilds += result[1];
            vc += result[2];
            cpm += result[3];
        }

        this.client.dogstats.gauge("pengubot.totalcommands", this.client.settings.get("counter.total"));
        this.client.dogstats.gauge("pengubot.users", users);
        this.client.dogstats.gauge("pengubot.cpm", cpm);
        this.client.dogstats.gauge("pengubot.guilds", guilds);
        this.client.dogstats.gauge("pengubot.voicestreams", vc);
    }

    init() {
        if (this.client.user.id !== "303181184718995457" || this.client.shard.id !== 0) return this.disable();
    }

};
