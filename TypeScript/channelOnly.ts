// @ts-nocheck
/**
 * @author: @NeoYaBoi
 * @version: 1.0.0
 * @description: This is channelOnly plugin. It allows specific commands to only be able to run in a specific channel.
 * @license: null
 * @example:
 * ```ts
 * import { channelOnly } from "../plugins/channelOnly"; //(change if need be)
 * import { sernModule, CommandType } from "@sern/handler";
 * export default commandModule({
 *    plugins: [ channelOnly('channelID', true/false, 'response (optional)') ],
 *    execute: (ctx) => {
 *       //your code here
 *    }
 * })
 * ```
 */

import { CommandType, EventPlugin, PluginType } from "@sern/handler";
export function channelOnly(
  channelID: string,
  ephemeral: boolean,
  response?: string
): EventPlugin<CommandType.Both> {
  return {
    type: PluginType.Event,
    description: "Allows commands to only run in a specified channel.",
    async execute(event, controller) {
      const [ctx] = event;
      if (ctx.channel?.id !== channelID) {
        await ctx.reply({
          content: response || "You cannot use that here!",
          ephemeral,
        });
        return controller.stop();
      }
      return controller.next();
    },
  };
}
