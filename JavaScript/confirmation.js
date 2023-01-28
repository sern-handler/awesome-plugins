//@ts-nocheck

/**
 * Asks the user for a confirmation message before executing the command
 *
 * @author @trueharuu [<@504698587221852172>]
 * @version 1.0.0
 * @example
 * ```ts
 * import { confirmation } from "../plugins/confirmation";
 * import { CommandType, commandModule } from "@sern/handler";
 *
 * // YOU MUST HAVE GUILD MESSAGE REACTION INTENTS ON YOUR CLIENT!!!!
 * export default commandModule({
 *  type : CommandType.Both
 *  plugins: [confirmation()],
 * 	execute: (ctx, args) => {
 * 		ctx.interaction.followUp('Hello welcome to the secret club')
 * 	}
 * })
 * ```
 */
import { CommandControlPlugin, controller } from "@sern/handler";
const defaultOptions = {
	timeout: 5000,
	message: "Are you sure you want to proceed?",
	onTimeout: "confirmation timed out",
	onCancel: "confirmation cancelled",
	onConfirm: (_, result) => {
		try {
			result.delete();
		} catch (e) {}
	},
	emojis: {
		no: "❌",
		yes: "✅",
	},
};
export function confirmation(raw = {}) {
	const options = Object.assign({}, defaultOptions, raw);
	return CommandControlPlugin(async (context, _) => {
		if (typeof options.message === "function") {
			options.message = await options.message(context);
		}

		const response = await context.reply(await options.message);
		let { yes, no } = options.emojis;

		if (typeof yes === "function") {
			yes = await yes(context);
		}

		if (typeof no === "function") {
			no = await no(context);
		}

		await response.react(await yes);
		await response.react(await no);

		function filter(reaction, user) {
			return (
				([yes, no].includes(reaction.emoji.name) ||
					[yes, no].includes(reaction.emoji.identifier)) &&
				user.id === context.user.id
			);
		}

		const recieved = await response.awaitReactions({
			filter,
			max: 1,
			time: options.timeout,
		});

		if (recieved.size === 0) {
			if (typeof options.onTimeout === "function") {
				await options.onTimeout(context, response);
			} else {
				await response.edit(await options.onTimeout);
				await response.reactions.removeAll();
			}

			return controller.stop();
		}

		const reaction = recieved.first();

		if (!reaction) {
			return controller.stop();
		}

		switch (reaction.emoji.name) {
			case await yes:
				if (typeof options.onConfirm === "function") {
					await options.onConfirm(context, response);
				} else {
					await response.edit(await options.onConfirm);
					await response.reactions.removeAll();
				}

				return controller.next();

			case await no:
				if (typeof options.onCancel === "function") {
					await options.onCancel(context, response);
				} else {
					await response.edit(await options.onCancel);
					await response.reactions.removeAll();
				}

				return controller.stop();
		}

		return controller.next();
	});
}
