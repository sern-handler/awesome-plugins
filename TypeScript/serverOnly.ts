// @ts-nocheck
/**
 * Checks if a command is available in a specific server.
 *
 * @author @Peter-MJ-Parker [<@1017182455926624316>]
 * @version 1.0.0
 * @example
 * ```ts
 * import { commandModule, CommandType } from "@sern/handler";
 * import { serverOnly } from "../plugins/serverOnly";
 * export default commandModule({
 *   type: CommandType.Both,
 *   plugins: [serverOnly(["guildId"], failMessage)], // fail message is the message you will see when the command is ran in the wrong server.
 *   description: "command description",
 *   execute: async (ctx, args) => {
 *     // your code here
 *   },
 * });
 * ```
 */

import { CommandType, EventPlugin, PluginType } from "@sern/handler";

export function serverOnly(
	guildId: string[],
	failMessage = "This command is not available in this guild. \nFor permission to use in your server, please contact my developer."
): EventPlugin<CommandType.Both> {
	return {
		type: PluginType.Event,
		description: "Checks if a command is available in a specific server.",
		async execute([ctx, args], controller) {
			if (!guildId.includes(ctx.guildId)) {
				await ctx.reply(failMessage).then(async (m) => {
					setTimeout(async () => {
						await m.delete();
					}, 3000);
				});
				return controller.stop();
			}
			return controller.next();
		},
	};
}
