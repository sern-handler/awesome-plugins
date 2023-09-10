## Plugin Submission Checklist

Before submitting your plugin, please ensure that you have followed the specifications below:

- [ ] Your plugin code includes a JSDoc block with `@plugin` at the beginning and `@end` at the end.
- [ ] The order of plugin metadata within the JSDoc block follows the structure provided:
  1. `@plugin`
  2. `description`
  3. `@author` (you can have multiple authors in this format: `@author  @jacoobes [<@182326315813306368>]`)
  4. `@version` (with the version number)
  5. `@example` (a nice example of how to use your plugin)
  6. `@end`

this is an example:
```js
/** 
 * @plugin
 * filters autocomplete interaction that pass the criteria
 * @author @jacoobes [<@182326315813306368>]
 * @version 1.0.0
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
 * @end
 */


```

## Plugin Submission Details
[Enter data here] this is optional
## Additional Notes

_[Include any additional information or notes you'd like to provide regarding your plugin submission.]_

