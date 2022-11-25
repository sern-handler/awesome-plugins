// @ts-nocheck
/**
 * This is perm check, it allows users to parse the permission you want and let the plugin do the rest. (check bot or user for that perm).
 *
 * @author @Benzo-Fury [<@762918086349029386>]
 * @author @needhamgary [<@342314924804014081>]
 * @version 1.1.0
 * @example
 * ```ts
 * import { requirePermission } from "../plugins/myPermCheck";
 * import { commandModule } from "@sern/handler";
 * export default commandModule({
 *  plugins: [ requirePermission('target', 'permission', 'No permission response') ],
 *  execute: (ctx) => {
 * 		//your code here
 *  }
 * })
 * ```
 */

import {
  type GuildMember,
  PermissionResolvable,
  GuildMemberResolvable,
} from "discord.js";
import { CommandType, EventPlugin, PluginType } from "@sern/handler";
export function requirePermission(
  target: GuildMemberResolvable,
  perm: PermissionResolvable,
  response?: string
): EventPlugin<
  CommandType.Both,
  CommandType.MenuMsg,
  CommandType.MenuSelect,
  CommandType.MenuUser,
  CommandType.Modal,
  CommandType.Button
> {
  return {
    type: PluginType.Event,
    description: "Checks bot/user perms",
    async execute(event, controller) {
      const [ctx] = event;
      if (ctx.guild === null) {
        ctx.reply("This command cannot be used here");
        console.warn(
          "PermCheck > A command stopped because we couldn't check a users permissions (was used in dms)"
        ); //delete this line if you dont want to be notified when a command is used outside of a guild/server
        return controller.stop();
      }
      switch (target) {
        case "bot":
          if (
            !(
              (await ctx.guild.members.fetchMe({
                cache: false,
              })!) as GuildMember
            ).permissions.has(perm)
          ) {
            if (!response)
              response = `I cannot use this command, please give me \`${perm}\` permission.`;
            await ctx.reply(response);
            return controller.stop();
          }
          return controller.next();
        case "user":
          if (!(ctx.member! as GuildMember).permissions.has(perm)) {
            if (!response)
              response = `You cannot use this command because you are missing \`${perm}\` permission.`;
            await ctx.reply(response);
            return controller.stop();
          }
          return controller.next();
        default:
          console.warn("Perm Check >>> You didn't specify user or bot.");
          ctx.reply("User or Bot was not specified.");
          return controller.stop();
      }
    },
  };
}
