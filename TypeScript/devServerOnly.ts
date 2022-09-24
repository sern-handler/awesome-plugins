// @ts-nocheck
/**
 * Checks if the command is allowed in a specified server.
 *
 * @author @D3ord3NidAm [<@1017182455926624316>]
 * @version 1.0.0
 * @example
 * ```ts
 * import { commandModule, CommandType } from "@sern/handler";
 * import { devServerOnly } from "../plugins/devServerOnly";
 * export default commandModule({
 *   type: CommandType.Both,
 *   plugins: [devServerOnly(["guildId", "guildId"], "fail message")], // fail message is the message you will see when the command is ran in the wrong server.
 *   description: "command description",
 *
 *   execute: async (ctx, args) => {
 *     // your code here
 *   },
 * });
 * ```
 */


import { CommandType, EventPlugin, PluginType } from "@sern/handler";

export function devServerOnly(
  guildId: string[],
  perFail: string
): EventPlugin<CommandType.Both> {
  return {
    type: PluginType.Event,
    description: "Checks if the command is allowed in a specified server.",
    async execute([ctx, args], controller) {
      if (!guildId.includes(ctx.guildId)) {
        await ctx.reply(perFail);
        return controller.stop();
      }
      return controller.next();
    },
  };
}
