// @ts-nocheck
/**
 * @author: @NeoYaBoi
 * @version: 1.0.0
 * @description: This plugin checks if the channel is nsfw and responds to user with a specified response if not nsfw 
 * @license: Null
 * @example:
 * ```ts
 * import { nsfwOnly } from "../plugins/nsfwOnly"; //(change if need be)
 * import { sernModule, CommandType } from "@sern/handler";
 * export default commandModule({
 *    plugins: [ nsfwOnly('response', true/false) ],
 *    execute: (ctx) => {
 *       //your code here
 *    }
 * })
 * ```
 */
//sern will only try ephemeral if message is a interaction
 import { type GuildChannel } from "discord.js";
 import { CommandType, EventPlugin, PluginType } from "@sern/handler";
 export function nsfwOnly(response: string, ephemeral: boolean): EventPlugin<CommandType.Both> {
   return {
     type: PluginType.Event,
     description: "Checks if the channel is nsfw or not.",
     async execute(event, controller) {
       const [ctx] = event;
       if(ctx.guild == null) {
        //responds and stops command if not executed in guild (ran in dms).
         ctx.reply('This command cannot be used here') //Change this if you want
         return controller.stop()
       }
       //checking if channel is nsfw (18+)
       if(!(ctx.channel! as GuildChannel).nsfw) {
        //responds with response and stops command
        ctx.reply({content: response, ephemeral: ephemeral})
        return controller.stop()
       }
       //continues to command if nsfw
       return controller.next()
     },
   };
 }