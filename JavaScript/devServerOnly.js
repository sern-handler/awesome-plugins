//@ts-nocheck

/**
 * Checks if the command is allowed in a specified server.
 *
 * @author @loveisglitchy [<@342314924804014081>]
 * @version 1.0.0
 * @example
 * ```ts
 * import { devServerOnly } from "../plugins/devServerOnly";
 * import { CommandType, commandModule } from "@sern/handler";
 *
 * export default commandModule({
 *  type : CommandType.Both
 *  plugins: [devServerOnly('guildID' or ['guildID','guildID'], "fail message")],
 * 	execute: (ctx, args) => {
 * 		//your code here
 * 	}
 * })
 * ```
 */
import { PluginType } from "@sern/handler";

export function devServerOnly(guildId, perFail) {
  return {
    type: PluginType.Event,
    description: "Checks if the command is allowed in a specified server.",

    async execute([ctx], controller) {
      if (!perFail || perFail === undefined || perFail === null) {
        ctx.reply("You haven't given me a fail message.");
        return controller.stop();
      }

      if (!guildId.includes(ctx.guildId)) {
        await ctx.reply(perFail);
        return controller.stop();
      }
      return controller.next();
    },
  };
}
