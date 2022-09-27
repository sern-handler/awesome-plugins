// @ts-nocheck

/**
 * This is buttonConfirmation plugin, it runs confirmation prompt in the form of buttons.
 * Note that you need to use edit/editReply in the command itself because we are already replying in the plugin!
 * Credits to original plugin of confirmation using reactions and its author!
 *
 * @author @EvolutionX-10 [<@697795666373640213>]
 * @version 1.0.0
 * @example
 * ```ts
 * import { buttonConfirmation } from "../plugins/buttonConfirmation";
 * import { commandModule } from "@sern/handler";
 * export default commandModule({
 *  plugins: [ buttonConfirmation() ],
 *  execute: (ctx) => {
 * 		//your code here
 *  }
 * })
 * ```
 */
import { PluginType } from "@sern/handler";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
} from "discord.js";
export function confirmation(options) {
	return {
		type: PluginType.Event,
		description: "Confirms",

		async execute([ctx], controller) {
			options = {
				content: "Do you want to proceed?",
				denialMessage: "Cancelled",
				labels: ["No", "Yes"],
				time: 60_000,
				wrongUserResponse: "Not for you!",
				...options,
			};
			const buttons = options.labels.map((l, i) => {
				return new ButtonBuilder()
					.setCustomId(l)
					.setLabel(l)
					.setStyle(
						i === 0 ? ButtonStyle.Danger : ButtonStyle.Success
					);
			});
			const sent = await ctx.reply({
				content: options.content,
				components: [new ActionRowBuilder().setComponents(buttons)],
			});
			const collector = sent.createMessageComponentCollector({
				componentType: ComponentType.Button,
				filter: (i) => i.user.id === ctx.user.id,
				time: options.time,
			});
			return new Promise((resolve) => {
				collector.on("collect", async (i) => {
					await i.update({
						components: [],
					});
					collector.stop();

					if (i.customId === options.labels[1]) {
						resolve(controller.next());
						return;
					}

					await i.editReply({
						content: options?.denialMessage,
					});
					resolve(controller.stop());
				});
				collector.on("end", async (c) => {
					if (c.size) return;
					buttons.forEach((b) => b.setDisabled());
					await sent.edit({
						components: [
							new ActionRowBuilder().setComponents(buttons),
						],
					});
				});
				collector.on("ignore", async (i) => {
					await i.reply({
						content: options?.wrongUserResponse,
						ephemeral: true,
					});
				});
			});
		},
	};
}
