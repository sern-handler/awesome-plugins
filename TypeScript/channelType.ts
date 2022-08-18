//@ts-nocheck
/**
 * This plugin checks if a channel is the specified type 
 *
 * @author @NeoYaBoi [<@762918086349029386>]
 * @version 1.0.0
 * @example
 * ```ts
 * import { channelType } from "../plugins/channelType";
 * import { channelType } from "discord.js"
 * import { commandModule } from "@sern/handler";
 * export default commandModule({
 *  plugins: [ channelType(ChannelType.GuildText, 'This cannot be used here') ],
 *  execute: (ctx) => {
 * 		//your code here
 *  }
 * })
 * ```
 */
import type { ChannelType } from "discord.js";
import { CommandType, EventPlugin, PluginType } from "@sern/handler";
export function channelType(
  channelType: ChannelType,
  onFail?: string
): EventPlugin<CommandType.Both> {
  return {
    type: PluginType.Event,
    description: "Checks the channel type.",
    async execute(event, controller) {
      const [ctx] = event;
      if (channelType !== ctx.channel?.type) {
        if (onFail) {
          await ctx.reply(onFail);
        }
        return controller.stop();
      }
      return controller.next();
    },
  };
}
