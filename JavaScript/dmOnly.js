// @ts-nocheck

/**
 * This is dmOnly plugin, it allows commands to be run only in DMs.
 *
 * @author @EvolutionX-10
 * @version 1.0.0
 * @requires `partials: [Partials.Channel], intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent]
 * @example
 * ```ts
 * import { dmOnly } from "../path/to/your/plugin/folder";
 * import { commandModule } from "@sern/handler";
 * export default commandModule({
 * 		plugins: [dmOnly()],
 * 		execute: // your code
 * })
 * ```
 */
import { PluginType } from "@sern/handler";
export function dmOnly(content, ephemeral) {
	return {
		type: PluginType.Event,
		description: "Allows commands to be run in DM only",

		async execute(event, controller) {
			const [ctx] = event;
			if (ctx.channel?.isDMBased()) return controller.next();
			if (content)
				await ctx.reply({
					content,
					ephemeral,
				}); // Change this if you want or remove it for silent deny

			return controller.stop();
		},
	};
}
