// @ts-nocheck
/**
 * @author: @NeoYaBoi
 * @version: 1.0.0
 * @description: This is perm check, it allows users to parse the permission you want and let the plugin do the rest. (check user for that perm).
 * @license: Null
 * @example:
 * ```ts
 * import { permCheck } from "../plugins/permCheck"; //(change if need be)
 * import { sernModule, CommandType } from "@sern/handler";
 * export default commandModule({
 *    plugins: [ permCheck('permission', 'Response Here') ],
 *    execute: (ctx) => {
 *       //your code here
 *    }
 * })
 * ```
 */

import { PermissionResolvable } from "discord.js";
import { CommandType, EventPlugin, PluginType } from "@sern/handler";
export function permCheck(perm: PermissionResolvable, response: string): EventPlugin<CommandType.Both> {
  return {
    type: PluginType.Event,
    description: "Checks for specified perm",
    async execute(event, controller) {
      const [ctx] = event;
      if(ctx.guild == null) {
        ctx.reply('This command cannot be used here')
        console.warn('A command stopped because we couldn\'t check there permissions (was used in dms)') //delete this line if you dont was to be notified when a command is used outside of a guild/server
        return controller.stop()
      }
      if(!(ctx.member! as GuildMember).permissions.has(perm) {
        try {
            await ctx.reply(response)
            return controller.stop()
        } catch {
            ctx.reply("You do not have the required permissions")
            return controller.stop()
        }
      }
      return controller.next()
    },
  };
}
