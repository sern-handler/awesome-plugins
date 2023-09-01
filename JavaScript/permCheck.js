// @ts-nocheck

/**
 * @plugin
 * This is perm check, it allows users to parse the permission you want and let the plugin do the rest. (check user for that perm).
 *
 * @author @Benzo-Fury [<@762918086349029386>]
 * @version 1.0.1
 * @example
 * ```ts
 * import { permCheck } from "../plugins/permCheck";
 * import { commandModule } from "@sern/handler";
 * export default commandModule({
 *  plugins: [ permCheck('permission', 'No permission response') ],
 *  execute: (ctx) => {
 * 		//your code here
 *  }
 * })
 * ```
 * @end
 */
import { CommandControlPlugin, controller } from "@sern/handler";
export function permCheck(perm, response) {
	return CommandControlPlugin(async (ctx, args) => {
		if (ctx.guild === null) {
			await ctx.reply("This command cannot be used here");
			console.warn(
				"PermCheck > A command stopped because we couldn't check a users permissions (was used in dms)",
			); //delete this line if you dont want to be notified when a command is used outside of a guild/server

			return controller.stop();
		}

		if (!ctx.member.permissions.has(perm)) {
			await ctx.reply(response);
			return controller.stop();
		}

		return controller.next();
	});
}
