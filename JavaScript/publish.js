// @ts-nocheck

/**
 * This is publish plugin, it allows you to publish your application commands with ease.
 *
 * @author @EvolutionX-10 [<@697795666373640213>]
 * @version 1.3.0
 * @example
 * ```ts
 * import { publish } from "../plugins/publish";
 * import { commandModule } from "@sern/handler";
 * export default commandModule({
 *  plugins: [ publish() ], // put an object containing permissions, ids for guild commands, boolean for dmPermission
 *  // plugins: [ publish({ guildIds: ['guildId'], defaultMemberPermissions: 'Administrator'})]
 *  execute: (ctx) => {
 * 		//your code here
 *  }
 * })
 * ```
 */
import { CommandType, PluginType } from "@sern/handler";
import { ApplicationCommandType } from "discord.js";
export function publish(options) {
	return {
		type: PluginType.Command,
		description: "Manage Slash Commands",
		name: "slash-auto-publish",

		async execute({ client }, { mod: module }, controller) {
			const defaultOptions = {
				guildIds: [],
				dmPermission: undefined,
				defaultMemberPermissions: null,
			};
			options = { ...defaultOptions, ...options };
			let { defaultMemberPermissions, dmPermission, guildIds } = options;

			function c(e) {
				console.error("publish command didnt work for", module.name);
				console.error(e);
			}

			try {
				const commandData = {
					type: CommandTypeRaw[module.type],
					name: module.name,
					description: [CommandType.Slash, CommandType.Both].includes(
						module.type
					)
						? module.description
						: undefined,
					options: [CommandType.Slash, CommandType.Both].includes(
						module.type
					)
						? optionsTransformer(module.options ?? [])
						: [],
					defaultMemberPermissions,
					dmPermission,
				};

				if (!guildIds.length) {
					const cmd = (
						await client.application.commands.fetch()
					).find(
						(c) =>
							c.name === module.name &&
							c.type === CommandTypeRaw[module.type]
					);

					if (cmd) {
						if (!cmd.equals(commandData, true)) {
							console.log(
								`Found differences in global command ${module.name}`
							);
							cmd.edit(commandData).then(() => {
								console.log(
									`${module.name} updated with new data successfully!`
								);
							});
						}

						return controller.next();
					}

					client.application.commands
						.create(commandData)
						.then(() => {
							console.log("Command created", module.name);
						})
						.catch(c);
					return controller.next();
				}

				for (const id of guildIds) {
					const guild = await client.guilds.fetch(id).catch(c);
					if (!guild) continue;
					const guildcmd = (await guild.commands.fetch()).find(
						(c) =>
							c.name === module.name &&
							c.type === CommandTypeRaw[module.type]
					);

					if (guildcmd) {
						if (!guildcmd.equals(commandData, true)) {
							console.log(
								`Found differences in command ${module.name}`
							);
							guildcmd
								.edit(commandData)
								.then(() =>
									console.log(
										`${module.name} updated with new data successfully!`
									)
								)
								.catch(c);
							continue;
						}

						continue;
					}

					guild.commands
						.create(commandData)
						.then(() =>
							console.log(
								"Guild Command created",
								module.name,
								guild.name
							)
						)
						.catch(c);
				}

				return controller.next();
			} catch (e) {
				console.log("Command did not register" + module.name);
				console.log(e);
				return controller.stop();
			}
		},
	};
}
export function optionsTransformer(ops) {
	return ops.map((el) =>
		el.autocomplete ? (({ command, ...el }) => el)(el) : el
	);
}
export const CommandTypeRaw = {
	[CommandType.Both]: ApplicationCommandType.ChatInput,
	[CommandType.MenuMsg]: ApplicationCommandType.Message,
	[CommandType.MenuUser]: ApplicationCommandType.User,
	[CommandType.Slash]: ApplicationCommandType.ChatInput,
};
