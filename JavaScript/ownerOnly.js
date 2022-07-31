// @ts-nocheck

/**
 * @author: @EvolutionX-10
 * @version: 1.0.0
 * @description: This is OwnerOnly plugin, it allows only bot owners to run the command, like eval.
 * @license: MIT
 * @example:
 * ```ts
 * import { ownerOnly } from "../path/to/your/plugin/folder";
 * import { sernModule, CommandType } from "@sern/handler";
 * export default sernModule<CommandType.Slash>([OwnerOnly()], {
 * // your code
 * })
 * ```
 */
import { PluginType } from "@sern/handler";
const ownerIDs = ["697795666373640213"]; //! Fill your ID

export function ownerOnly() {
	return {
		type: PluginType.Event,
		description: "Allows only bot owner to run command",

		async execute(event, controller) {
			const [ctx] = event;
			if (ownerIDs.includes(ctx.user.id)) return controller.next(); //* If you want to reply when the command fails due to user not being owner, you can use following
			// await ctx.reply("Only owner can run it!!!");

			return controller.stop(); //! Important: It stops the execution of command!
		},
	};
}
