/* 
 * ⚠️ WARNING: EDITING THESE TYPE OF FILES CAN CAUSE UNWANTED
 * DAMAGE TO YOUR CODEBASE, BOT AND MORE. EDIT AT YOUR OWN RISK.
 */

/**
 * @author: EvolotionX-10 (remix by Murtatrxx)
 * @description: The publish plugin, it allows you to publish your slash commands with ease.
 * @version: 1.0.0
 * @license: MIT
 * @example:
 * ```js
 *   const { publish } = require('../path/to/your/plugin/folder)';
 *   const { sernModule, CommandType } = require('@sern/handler');
 * 
 *   module.exports = sernModule([publish()], { // Put guild id in array for guild commands
 *     // Your code goes here
 *   });
 * ```
 */

 const {
	CommandType,
	PluginType,
} = require('@sern/handler');

const {
  ApplicationCommandType
} = require('discord.js');

module.exports.publish = (guildIds) => ({
	type: PluginType.Command,
	description: 'Publishes your slash commands with every restart.',
	name: 'slash-auto-publish-js',
	async execute(client, module, controller) {
		function c(e) {
			console.error('Publish command didnt work for ', module.name);
			console.error(e);
		}
		
		try {
			const commandData = {
				type: CommandTypeRaw[module.type],
				name: module.name,
				description: module.description,
				options: optionsTransformer(module.options ?? []),
			};
			if (!Array.isArray(guildIds))
				guildIds = [guildIds];

			if (!guildIds.length) {
				const cmd = (
					await client.application.commands.fetch()
				).find((c) => c.name === module.name);
				if (cmd) {
					if (!cmd.equals(commandData, true)) {
						console.log(`Found differences in global command ${module.name}`);
						await cmd.edit(commandData).then((c) => {
							console.log(`${module.name} updated with new data successfully!`);
						});
					}
					return controller.next();
				}

				await client
					.application.commands.create(commandData)
					.catch(c);
				console.log('Command created ', module.name);
				return controller.next();
			}

			for (const id of guildIds) {
				const guild = await client.guilds.fetch(id).catch(c);
				if (!guild)
					continue;
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
					'Guild Command created',
					module.name,
					guild.name
				);
			}
			return controller.next();
		} catch (e) {
			console.log('Command did not register' + module.name);
			console.log(e);
			return controller.stop();
		}
	},
})

module.exports.optionsTransformer = function (ops) {
	return ops.map((el) =>
		el.autocomplete ? (({ command, ...el }) => el)(el) : el
	);
}

module.exports.CommandTypeRaw = {
	[CommandType.Both]: ApplicationCommandType.ChatInput,
	[CommandType.MenuMsg]: ApplicationCommandType.Message,
	[CommandType.MenuUser]: ApplicationCommandType.User,
	[CommandType.Slash]: ApplicationCommandType.ChatInput,
};
