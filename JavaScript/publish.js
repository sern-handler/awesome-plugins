// @ts-nocheck

/**
 * This is publish plugin, it allows you to publish your application commands using the discord.js library with ease.
 *
 * @author @EvolutionX-10 [<@697795666373640213>]
 * @version 2.0.0
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
import { CommandInitPlugin, CommandType, controller } from "@sern/handler";
import { ApplicationCommandType } from "discord.js";
import { useContainer } from "../index.js";
export const CommandTypeRaw = {
	[CommandType.Both]: ApplicationCommandType.ChatInput,
	[CommandType.CtxUser]: ApplicationCommandType.User,
	[CommandType.CtxMsg]: ApplicationCommandType.Message,
	[CommandType.Slash]: ApplicationCommandType.ChatInput,
};
export function publish(options) {
	return CommandInitPlugin(async ({ module }) => {
		// Users need to provide their own useContainer function.
		const [client] = useContainer("@sern/client");
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

		const log =
			(...message) =>
			() =>
				console.log(...message);

		const logged = (...message) => log(message);
		/**
		 * a local function that returns either one value or the other,
		 * depending on {t}'s CommandType. If the commandtype of
		 * this module is CommandType.Both or CommandType.Text or CommandType.Slash,
		 * return 'is', else return 'els'
		 * @param t
		 * @returns S | T
		 */

		const appCmd = (t) => {
			return (is, els) => ((t & CommandType.Both) !== 0 ? is : els);
		};

		const curAppType = CommandTypeRaw[module.type];

		const createCommandData = () => {
			const cmd = appCmd(module.type);
			return {
				name: module.name,
				type: curAppType,
				description: cmd(module.description, ""),
				options: cmd(optionsTransformer(module.options ?? []), []),
				defaultMemberPermissions,
				dmPermission,
			};
		};

		try {
			const commandData = createCommandData();

			if (!guildIds.length) {
				const cmd = (await client.application.commands.fetch()).find(
					(c) => c.name === module.name && c.type === curAppType
				);

				if (cmd) {
					if (!cmd.equals(commandData, true)) {
						logged(
							`Found differences in global command ${module.name}`
						);
						cmd.edit(commandData).then(
							log(
								`${module.name} updated with new data successfully!`
							)
						);
					}

					return controller.next();
				}

				client.application.commands
					.create(commandData)
					.then(log("Command created", module.name))
					.catch(c);
				return controller.next();
			}

			for (const id of guildIds) {
				const guild = await client.guilds.fetch(id).catch(c);
				if (!guild) continue;
				const guildCmd = (await guild.commands.fetch()).find(
					(c) => c.name === module.name && c.type === curAppType
				);

				if (guildCmd) {
					if (!guildCmd.equals(commandData, true)) {
						logged(`Found differences in command ${module.name}`);
						guildCmd
							.edit(commandData)
							.then(
								log(
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
					.then(log("Guild Command created", module.name, guild.name))
					.catch(c);
			}

			return controller.next();
		} catch (e) {
			logged("Command did not register" + module.name);
			logged(e);
			return controller.stop();
		}
	});
}
export function optionsTransformer(ops) {
	return ops.map((el) =>
		el.autocomplete ? (({ command, ...el }) => el)(el) : el
	);
}
