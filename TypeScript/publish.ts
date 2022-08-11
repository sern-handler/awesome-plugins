// @ts-nocheck
/**
 * This is publish plugin, it allows you to publish your slash commands with ease.
 *
 * @author @EvolutionX-10 [<@697795666373640213>]
 * @version 1.1.0
 * @example
 * ```ts
 * import { publish } from "../plugins/publish";
 * import { commandModule } from "@sern/handler";
 * export default commandModule({
 *  plugins: [ publish() ], // put an array of guild ids for guild commands
 *  execute: (ctx) => {
 * 		//your code here
 *  }
 * })
 * ```
 */
import {
	CommandPlugin,
	CommandType,
	PluginType,
	SernOptionsData,
} from "@sern/handler";
import { ApplicationCommandData, ApplicationCommandType } from "discord.js";

export function publish(
	guildIds: string | Array<string> = []
): CommandPlugin<CommandType.Slash | CommandType.Both> {
	return {
		type: PluginType.Command,
		description: "Manage Slash Commands",
		name: "slash-auto-publish",
		async execute({ client }, { absPath, mod: module }, controller) {
			function c(e: unknown) {
				console.error("publish command didnt work for", module.name!);
				console.error(e);
			}
			try {
				const commandData: ApplicationCommandData = {
					type: CommandTypeRaw[module.type],
					name: module.name!,
					description: module.description,
					options: optionsTransformer(module.options ?? []),
				};
				if (!Array.isArray(guildIds)) guildIds = [guildIds];

				if (!guildIds.length) {
					const cmd = (
						await client.application!.commands.fetch()
					).find((c) => c.name === module.name);
					if (cmd) {
						if (!cmd.equals(commandData, true)) {
							console.log(
								`Found differences in global command ${module.name}`
							);
							await cmd.edit(commandData).then((c) => {
								console.log(
									`${module.name} updated with new data successfully!`
								);
							});
						}
						return controller.next();
					}

					await client
						.application!.commands.create(commandData)
						.catch(c);
					console.log("Command created", module.name!);
					return controller.next();
				}

				for (const id of guildIds) {
					const guild = await client.guilds.fetch(id).catch(c);
					if (!guild) continue;
					const guildcmd = (await guild.commands.fetch()).find(
						(c) => c.name === module.name
					);
					if (guildcmd) {
						if (!guildcmd.equals(commandData, true)) {
							console.log(
								`Found differences in command ${module.name}`
							);
							await guildcmd.edit(commandData).catch(c);
							console.log(
								`${module.name} updated with new data successfully!`
							);
							continue;
						}
						continue;
					}
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
