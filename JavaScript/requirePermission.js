/**
 * This is perm check, it allows users to parse the permission you want and let the plugin do the rest. (check bot or user for that perm).
 *
 * @author @Benzo-Fury [<@762918086349029386>]
 * @author @needhamgary [<@342314924804014081>]
 * @version 1.1.0
 * @example
 * ```ts
 * import { requirePermission } from "../plugins/myPermCheck";
 * import { commandModule, CommandType } from "@sern/handler";
 * export default commandModule({
 *  plugins: [ requirePermission<CommandType>('target', 'permission', 'No response (optional)') ],
 *  execute: (ctx) => {
 * 		//your code here
 *  }
 * })
 * ```
 */
import { PluginType } from "@sern/handler";

function payload(resp) {
	return {
		fetchReply: true,
		content: resp,
	};
}

export function requirePermission(target, perm, response) {
	return {
		type: PluginType.Event,
		description: "Checks bot/user perms",

		async execute(event, controller) {
			const [ctx] = event;

			if (ctx.guild === null) {
				ctx.reply(payload("This command cannot be used here"));
				console.warn(
					"PermCheck > A command stopped because we couldn't check a users permissions (was used in dms)"
				); //delete this line if you dont want to be notified when a command is used outside of a guild/server

				return controller.stop();
			}

			switch (target) {
				case "bot":
					if (
						!(
							await ctx.guild.members.fetchMe({
								cache: false,
							})
						).permissions.has(perm)
					) {
						if (!response)
							response = `I cannot use this command, please give me \`${perm}\` permission.`;
						await ctx.reply(payload(response));
						return controller.stop();
					}

					return controller.next();

				case "user":
					if (!ctx.member.permissions.has(perm)) {
						if (!response)
							response = `You cannot use this command because you are missing \`${perm}\` permission.`;
						await ctx.reply(payload(response));
						return controller.stop();
					}

					return controller.next();

				default:
					console.warn(
						"Perm Check >>> You didn't specify user or bot."
					);
					ctx.reply(payload("User or Bot was not specified."));
					return controller.stop();
			}
		},
	};
}
