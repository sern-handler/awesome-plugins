// @ts-nocheck

/**
 * @author: EvolutionX-10
 * @version: 1.0.0
 * @description: This is publish plugin, it allows you to publish your slash commands with ease.
 * @license: MIT
 * @example:
 * ```ts
 * import { publish } from "../path/to/your/plugin/folder";
 * import { sernModule, CommandType } from "@sern/handler";
 * export default sernModule<CommandType.Slash>([publish()], { // put guild id in array for guild commands
 * // your code
 * })
 * ```
 */

import {
	CommandPlugin,
	CommandType,
	PluginType,
	SernOptionsData,
} from "@sern/handler";
import { ApplicationCommandType } from "discord.js";

export function publish(
	guildIds: string | Array<string> = []
): CommandPlugin<CommandType.Slash | CommandType.Both> {
	return {
		type: PluginType.Command,
		description: "Manage Slash Commands",
		name: "slash-auto-publish",
		async execute(client, module, controller) {
			function c(e: unknown) {
				console.error("publish command didnt work for", module.name!);
				console.error(e);
			}
			try {
				const commandData = {
					name: module.name!,
					type: CommandTypeRaw[module.type],
					description: module.description,
					options: optionsTransformer(module.options ?? []),
				};
				if (!Array.isArray(guildIds)) guildIds = [guildIds];

				if (!guildIds.length) {
					const cmd = (
						await client.application?.commands.fetch()
					)?.find((c) => c.name === module.name);
					if (cmd) return controller.next();

					await client
						.application!.commands.create(commandData)
						.catch(c);
					console.log("Command created", module.name!);
					return controller.next();
				}

				for (const id of guildIds) {
					const guild = await client.guilds.fetch(id).catch(c);
					if (!guild) continue;
					const cmd = (await guild.commands.fetch()).find(
						(c) => c.name === module.name
					);
					if (cmd) continue;
					await guild.commands.create(commandData).catch(c);
					console.log(
						"Guild Command created",
						module.name!,
						guild.name
					);
				}
				return controller.next();
			} catch (e) {
				console.log("Command did not register" + module.name!);
				console.log(e);
				return controller.stop();
			}
		},
	};
}

export function optionsTransformer(ops: Array<SernOptionsData>) {
	return ops.map((el) =>
		el.autocomplete ? (({ command, ...el }) => el)(el) : el
	);
}

export const CommandTypeRaw = {
	[CommandType.Both]: ApplicationCommandType.ChatInput,
	[CommandType.MenuMsg]: ApplicationCommandType.Message,
	[CommandType.MenuUser]: ApplicationCommandType.User,
	[CommandType.Slash]: ApplicationCommandType.ChatInput,
} as const;
