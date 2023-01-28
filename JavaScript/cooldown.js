// @ts-nocheck

/**
 * Allows you to set cooldowns (or "ratelimits") for commands
 * limits user/channel/guild actions,
 * @author @trueharuu [<@504698587221852172>]
 * @version 1.0.0
 * @example
 * ```ts
 * import { cooldown } from "../plugins/cooldown";
 * import { commandModule } from "@sern/handler";
 * export default commandModule({
 *  plugins: [cooldown.add( [ ['channel', '1/4'] ] )], // limit to 1 action every 4 seconds per channel
 *  execute: (ctx) => {
 * 		//your code here
 *  }
 * })
 * ```
 */
import { CommandControlPlugin, controller } from "@sern/handler";
import { GuildMember } from "discord.js";
/**
 * actions/seconds
 */

export let CooldownLocation;

(function (CooldownLocation) {
	CooldownLocation["channel"] = "channel";
	CooldownLocation["user"] = "user";
	CooldownLocation["guild"] = "guild";
})(CooldownLocation || (CooldownLocation = {}));

export class ExpiryMap extends Map {
	constructor(expiry = Infinity, iterable = []) {
		super(iterable);
		this.expiry = expiry;
	}

	set(key, value, expiry = this.expiry) {
		super.set(key, value);
		if (expiry !== Infinity)
			setTimeout(() => {
				super.delete(key);
			}, expiry);
		return this;
	}
}
export const map = new ExpiryMap();

function parseCooldown(location, cooldown) {
	const [actions, seconds] = cooldown.split("/").map((s) => Number(s));

	if (
		!Number.isSafeInteger(actions) ||
		!Number.isSafeInteger(seconds) ||
		actions === undefined ||
		seconds === undefined
	) {
		throw new Error(`Invalid cooldown string: ${cooldown}`);
	}

	return {
		actions,
		seconds,
		location,
	};
}

function getPropertyForLocation(context, location) {
	switch (location) {
		case CooldownLocation.channel:
			return context.channel.id;

		case CooldownLocation.user:
			if (!context.member || !(context.member instanceof GuildMember)) {
				throw new Error("context.member is not a GuildMember");
			}

			return context.member.id;

		case CooldownLocation.guild:
			return context.guildId;
	}
}

function add(items, message) {
	const raw = items.map((c) => {
		if (!Array.isArray(c)) return c;
		return parseCooldown(c[0], c[1]);
	});
	return CommandControlPlugin(async (context, args) => {
		for (const { location, actions, seconds } of raw) {
			const id = getPropertyForLocation(context, location);
			const cooldown = map.get(id);

			if (!cooldown) {
				map.set(id, 1, seconds * 1000);
				continue;
			}

			if (cooldown >= actions) {
				if (message) {
					await message({
						location,
						actions: cooldown,
						maxActions: actions,
						seconds,
						context,
					});
				}

				return controller.stop();
			}

			map.set(id, cooldown + 1, seconds * 1000);
		}

		return controller.next();
	});
}

const locations = {
	[CooldownLocation.channel]: (value) =>
		add([[CooldownLocation.channel, value]]),
	[CooldownLocation.user]: (value) => add([[CooldownLocation.user, value]]),
	[CooldownLocation.guild]: (value) => add([[CooldownLocation.guild, value]]),
};
export const cooldown = {
	add,
	locations,
	map,
};
