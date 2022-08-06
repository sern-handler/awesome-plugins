//@ts-nocheck
/**
 * This plugin checks if the channel is nsfw and responds to user with a specified response if not nsfw
 *
 * @author @NeoYaBoi [<@762918086349029386>]
 * @version 1.0.0
 * @example
 * ```ts
 * import { nsfwOnly } from "../plugins/nsfwOnly";
 * import { commandModule } from "@sern/handler";
 * export default commandModule({
 *  plugins: [ nsfwOnly('response', true) ],
 *  execute: (ctx) => {
 * 		//your code here
 *  }
 * })
 * ```
 */
import {
	ChannelType,
	GuildTextBasedChannel,
	TextBasedChannel,
	TextChannel,
} from "discord.js";
import { CommandType, EventPlugin, Nullish, PluginType } from "@sern/handler";
function isGuildText(
	channel: Nullish<TextBasedChannel>
): channel is GuildTextBasedChannel {
	return (
		channel?.type == ChannelType.GuildPublicThread ||
		channel?.type == ChannelType.GuildPrivateThread
	);
}
export function nsfwOnly(
	onFail: string,
	ephemeral: boolean
): EventPlugin<CommandType.Both> {
	return {
		type: PluginType.Event,
		description: "Checks if the channel is nsfw or not.",
		async execute(event, controller) {
			const [ctx] = event;
			//checking if command was executed in dms
			if (ctx.guild === null) {
				await ctx.reply({ content: onFail, ephemeral });
				return controller.stop();
			}
			//channel is thread (not supported by nsfw)
			if (isGuildText(ctx.channel) == true) {
				await ctx.reply({ content: onFail, ephemeral });
				return controller.stop();
			}
			if (!(ctx.channel! as TextChannel).nsfw) {
				//channel is not nsfw
				await ctx.reply({ content: onFail, ephemeral });
				return controller.stop();
			}
			//continues to command if nsfw
			return controller.next();
		},
	};
}
