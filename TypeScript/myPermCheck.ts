// @ts-nocheck
/**
 * This is perm check, it allows users to parse the permission you want and let the plugin do the rest. (check bot or user for that perm).
 *
 * @author @NeoYaBoi [<@762918086349029386>]
   @author @needhamgary [<@342314924804014081]
 * @version 1.1.0
 * @example
 * ```ts
 * import { permCheck } from "../plugins/myPermCheck";
 * import { commandModule } from "@sern/handler";
 * export default commandModule({
 *  plugins: [ permCheck('bot or user', 'permission', 'No permission response') ],
 *  execute: (ctx) => {
 * 		//your code here
 *  }
 * })
 * ```
 */

import { type GuildMember, PermissionResolvable } from "discord.js";
import { CommandType, EventPlugin, PluginType } from "@sern/handler";
export function permCheck(
  who: string,
  perm: PermissionResolvable,
  response: string
): EventPlugin<CommandType.Both> {
  return {
    type: PluginType.Event,
    description: "Checks bot perms",
    async execute(event, controller) {
      const [ctx] = event;
      if (ctx.guild === null) {
        ctx.reply("This command cannot be used here");
        console.warn(
          "PermCheck > A command stopped because we couldn't check a users permissions (was used in dms)"
        ); //delete this line if you dont want to be notified when a command is used outside of a guild/server
        return controller.stop();
      }
      switch (who) {
        case "bot":
          let mem = ctx.guild.members.me;
          if (!(mem! as GuildMember).permissions.has(perm)) {
            await ctx.reply(response);
            return controller.stop();
          }
          return controller.next();
        case "user":
          if (!(ctx.member! as GuildMember).permissions.has(perm)) {
            await ctx.reply(response);
            return controller.stop();
          }
          return controller.next();
        default:
          break;
      }
    },
  };
}
