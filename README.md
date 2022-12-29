# DropItem

Thank you for installing DropItem! To suggest features or to report bugs, please create an issue at my [DropItem repo](https://github.com/thatblindgeye/DropItem).

The purpose of this script is to allow players to easily drop items as tokens on the virtual tabletop. Items that are dropped via this script will have a nameplate visible to easily tell which token is which item.

## Commands

The following list of commands are available for use, and provide the basic syntax as well as a description of what the command does/is used for. Macros for the create, update, delete, types, and drop commands will also be created when installing the script.

### DropItem

`!dropitem`

Sends to chat a list of valid commands and their descriptions.

### Create type

`!dropitem create|[name of item type to create]`
e.g. `!dropitem create|Moonblade`

Creates a new item type to be dropped by other tokens.

When calling this command, a valid token must be selected on the tabletop to use its image as the image of the new item type. A valid token must have been uploaded to your Roll20 library, and cannot have the default token image. The selected token cannot be one that was purchased through the Roll20 marketplace.

### Update type

`!dropitem update|[name of item type to update]|[optional new name of item type]`
e.g. `!dropitem update|Backpack` or `!dropitem update|Backpack|Carrying Pack`

Updates an existing item type. If another token is not selected when this command is called, only the item type name will be updated. If no new item type name is provided, only the item type image will be updated if a valid token is selected.

### Delete type

`!dropitem delete|[name of item type to delete]`
e.g. `!dropitem delete|Backpack`

Deletes an existing item type.

### Types

`!dropitem types`

Sends to chat the current item types in the campaign, including their images and name.

### Drop

`!dropitem drop|[name of item type to drop]|[optional display name for item]|[optional item settings]`
e.g. `!dropitem drop|Backpack` or `!dropitem drop|Backpack|Oliver's Backpack`

Drops the specified item in the selected token's space. A token must be selected on the tabletop in order to call this command.

If no display name is provided, the display name will default to the character token's name + the item type name.

#### Item settings

When dropping an item, you can also pass in settings for its light and aura. When doing so, you can omit the `display name` argument with the syntax `!dropitem drop|Backpack||[item settings]` (note the double vertical pipes between "Backpack" and `[item settings]`).

The `item settings` argument must be a comma separated list of settings or a single setting. Each setting passed in must follow the syntax, `settingType=[setting values]`, e.g. `light=[setting values]` or `light=[setting values], aura1=[setting values]`. Both light and aura settings can be passed customized values or they can inherit the values from the token dropping the item.

For the light setting, you can pass in customized light values with the syntax `light=brightLight dimLight lightDirection lightColor`. The `lightColor` is optional, but must be a 6 character HEX value, e.g. `#000000`, or `transparent`. All other values passed in must be either numbers or `off`, and the `lightDirection` value must be between 0 and 360. For example, calling `!dropitem drop|Torch||light=30 30 90 #ff0000` would cause the dropped torch item to emit bright light for 30 feet, dim light for 30 feet beyond that, with the light direction creating a cone shape of 90 degrees and the light color being red.

For the aura settings, you can pass in customized aura values with the syntax `aura1=` or `aura2=` followed by `auraRadius auraColor auraShape visibleToPlayers`, where:

- `auraRadius` must be a number, `off`, or `inherit` (see below),
- `auraColor` must be a 6 character HEX value, e.g. `#000000`, or `transparent`,
- `auraShape` must be either `circle` or `square`, and
- `visibleToPlayers` is optional, but must be either `true` or `false` (defaults to `true` if not passed in)

For both the light and aura settings, passing in a single value of `inherit` will copy the applicable setting from the token that is dropping the item, and then turn off the setting for that token. For example, calling `!dropitem drop|Torch||light=inherit` would cause the torch item to use the light settings of the token that dropped it and also turn off any light being emitted by that token. This can be useful for when a token drops a torch it's "carrying" and you want to transfer the light emitted by the token to the torch item.

### GM only

`!dropitem gm-only|[optional true or false]`
e.g. `!dropitem gm-only` or `!dropitem gm-only|true`

When called without an argument of `true` or `false`, display the current setting for whether items can be dropped by the GM only. Updates the setting when called with an argument.

The default value for this setting is `false`.
