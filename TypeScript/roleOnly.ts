/**
 * This plugin checks if a user has a specific role.
 *
 * @author @NeoYaBoi [<@762918086349029386>]
 * @version 1.0.0
 * @example
 * ```ts
 * import { roleOnly } from "../plugins/roleOnly";
 * import { commandModule } from "@sern/handler";
 * export default commandModule({
 *  plugins: [ roleOnly('12345678910', '12345566789', 'You must have {role} to use this.') ],
 *  execute: (ctx) => {
 * 		//your code here
 *  }
 * })
 * ```
 */
//First option is role id. Second is server id. Third is onFail response.
import { CommandType, EventPlugin, PluginType } from "@sern/handler";
import type { GuildMember } from "discord.js";
export function roleOnly(
  roleID: string,
  specificGuild: string,
  onFail?: string
): EventPlugin<CommandType.Both> {
  return {
    type: PluginType.Event,
    description: "Checks the channel type.",
    async execute(event, controller) {
      const [ctx] = event;
      if (ctx.guild === null) {
        //change to isDMBased if you want
        await ctx.reply(`This command must be used inside a guild`);
        return controller.stop();
      }
      if (specificGuild != ctx.guild.id) {
        await ctx.reply(`This command cannot be used in this guild`);
        return controller.stop();
      }
      const role = ctx.guild.roles.cache.find((r) => r.id === roleID);
      if (!role) {
        console.warn(`Role with id: ${roleID} could not be found!`);
        return controller.stop();
      }
      if (
        !(ctx.member as GuildMember).roles.cache.some(
          (role) => role.id === roleID
        )
      ) {
        if (onFail) {
          await ctx.reply(onFail);
        }
        return controller.stop();
      }
      return controller.next();
    },
  };
}
