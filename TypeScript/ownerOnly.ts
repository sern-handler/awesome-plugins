// @ts-nocheck
/**
 * This is OwnerOnly plugin, it allows only bot owners to run the command, like eval.
 *
 * @author @EvolutionX-10 [<@697795666373640213>]
 * @version 1.0.0
 * @example
 * ```ts
 * import { ownerOnly } from "../plugins/ownerOnly";
 * import { commandModule } from "@sern/handler";
 * export default commandModule({
 *  plugins: [ ownerOnly() ],
 *  execute: (ctx) => {
 * 		//your code here
 *  }
 * })
 * ```
 */

import { CommandType, EventPlugin, PluginType } from "@sern/handler";
const ownerIDs = ["697795666373640213"]; //! Fill your ID
export function ownerOnly(): EventPlugin<CommandType.Both> {
	return {
		type: PluginType.Event,
		description: "Allows only bot owner to run command",
		async execute(event, controller) {
			const [ctx] = event;
			if (ownerIDs.includes(ctx.user.id)) return controller.next();
			//* If you want to reply when the command fails due to user not being owner, you can use following
			// await ctx.reply("Only owner can run it!!!");
			return controller.stop(); //! Important: It stops the execution of command!
		},
	};
}
