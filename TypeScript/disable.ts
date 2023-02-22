// @ts-nocheck
/**
 * Disables a command entirely, for whatever reasons you may need.
 *
 * @author @jacoobes [<@182326315813306368>]
 * @author @Peter-MJ-Parker [<@1017182455926624316>]
 * @version 2.0.0
 * @example
 * ```ts
 * import { disable } from "../plugins/disable";
 * import { commandModule } from "@sern/handler";
 * export default commandModule({
 *  plugins: [ disable() ],
 *  execute: (ctx) => {
 * 		//your code here
 *  }
 * })
 * ```
 */
import { CommandType, CommandControlPlugin, controller } from "@sern/handler";
import {
	InteractionReplyOptions,
	Message,
	ReplyMessageOptions,
} from "discord.js";

export function disable(
	onFail?:
		| string
		| Omit<InteractionReplyOptions, "fetchReply">
		| ReplyMessageOptions
) {
	return CommandControlPlugin<CommandType.Both>(async (ctx, [args]) => {
		if (onFail !== undefined) {
			switch (args) {
				case "text":
					ctx.reply(onFail)
						.then((m) => {
							setTimeout(() => {
								m.delete();
								ctx.message.delete();
							}, 5000);
						})
						.catch(() => {});

					break;

				case "slash":
					await ctx.reply({ content: onFail, ephemeral: true });
					break;

				default:
					break;
			}
		} else if (onFail === undefined && args === "slash") {
			onFail = "This command is disabled.";
			await ctx.reply({ content: onFail, ephemeral: true });
		}
		return controller.stop();
	});
}

