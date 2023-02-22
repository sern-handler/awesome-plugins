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
					//reply to text command
					const msg = await ctx.reply(onFail);
					setTimeout(() => {
						//deletes the bots reply to the user
						msg.delete();
						//deletes the original authors message (text command).
						ctx.message.delete();
						//waits 5 seconds before deleting messages
					}, 5000).catch((e) => {
						//logs error to console (if any).
						console.log(e);
					});

					break;

				case "slash":
					//ephemeral response to say the command is disabled with users response.
					await ctx.reply({ content: onFail, ephemeral: true });
					break;

				default:
					break;
			}
		}
		//this function tells the bot to reply to an interaction so it doesn't seem like it fails (in case there is no onFail message).
		if (onFail === undefined && args === "slash") {
			onFail = "This command is disabled.";
			await ctx.reply({ content: onFail, ephemeral: true });
		}
		//stop the command from running
		return controller.stop();
	});
}
