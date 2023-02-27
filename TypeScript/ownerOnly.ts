// @ts-nocheck
/**
 * This is OwnerOnly plugin, it allows only bot owners to run the command, like eval.
 *
 * @author @EvolutionX-10 [<@697795666373640213>]
 * @version 2.0.0
 * @example
 * ```ts
 * import { ownerOnly } from "../plugins/ownerOnly";
 * import { commandModule } from "@sern/handler";
 * export default commandModule({
 *  plugins: [ ownerOnly("id" | ["id1"...], "fail response") ],
 *  execute: (ctx) => {
 * 		//your code here
 *  }
 * })
 * ```
 */

import { CommandType, CommandControlPlugin, controller } from "@sern/handler";
export function ownerOnly(ownerIDs: string | string[], response?: string) {
	if (!ownerIDs) throw new Error("You need to specify the bot owner.");
	return CommandControlPlugin<CommandType.Both>(async (ctx, args) => {
		if (ownerIDs.includes(ctx.user.id)) return controller.next();
		if (!response) {
			response = "Only owner can run it!!!";
		}
		await ctx.reply(response);
		return controller.stop(); //! Important: It stops the execution of command!
	});
}
