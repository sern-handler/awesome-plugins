import { PluginType, makePlugin, controller, ControlPlugin } from "@sern/handler";
import type { AutocompleteInteraction } from 'discord.js'

/**
 * @author jacoobes
 * @version 1.0.0
 * @description filters autocomplete interaction that pass the criteria
 * @license null
 * @example
 * ```ts
 * import { CommandType, commandModule } from "@sern/handler";
 * import { filterA } from '../plugins/filterA.js'
 * export default commandModule({
 *    type : CommandType.Slash,
 *    options: [
 *       {  
 *          autocomplete: true,
 *          command : {
 *             //only accept autocomplete interactions that include 'poo' in the text
 *             onEvent: [filterA(s => s.includes('poo'))],
 *             execute: (autocomplete) => {
 *                let data = [{ name: 'pooba', value: 'first' }, { name: 'pooga', value: 'second' }]
 *                autocomplete.respond(data) 
 *             }
 *          }
 *       }
 *    ],
 *    execute: (ctx, args) => {}
 * })
 */
export const filterA = (pred: (value: string) => boolean) => {
    return makePlugin(PluginType.Control, (a: AutocompleteInteraction) => {
        if(pred(a.options.getFocused())) {
            return controller.next();
        }
        return controller.stop();
    }) as ControlPlugin;
}
