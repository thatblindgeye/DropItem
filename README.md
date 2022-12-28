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

When dropping an item, you can also pass in settings for the light and aura. When doing so, you can omit the `display name` argument with the syntax `!dropitem drop|Backpack||[item settings]`.

The `item settings` argument must be a comma separated list of settings or a single setting. Each setting passed in must follow the syntax, `settingType=[setting values]`, e.g. `light=[setting values]` `light=[setting values], aura=[setting values]`.

Both the light and aura settings can be passed a value of `inherit`. Passing in a value of `inherit` will copy the applicable setting from the token that is dropping the item, and then turn off the setting for that token. For example, calling `!dropitem drop|Torch||light=inherit` would cause the torch item to use the light settings of the token that dropped it and also turn off any light being emitted by the token. This can be useful for when a token is "carrying" a torch and drops it to the ground.

For the light option, you can pass in customized light settings with the syntax `light=brightLight dimLight lightDirection`. For example, calling `!dropitem drop|Torch||light=30 30 90` would cause the dropped torch item to emit bright light for 30 feet, dim light for 30 feet beyond that, with the light direction creating a cone shape. All three values passed in must be a number greater than 0. A value of 0, or a missing value, will turn off the applicable light setting. For example, `light=30 0 0` or `light=30` would result in an item emitting bright light for 30 feet only, with the dim light and light direction being turned off.

For the aura option, you can pass in customized aura settings with the syntax `aura=auraNumber auraRadius auraColor auraShape visibleToPlayers`, where:

- The `auraNumber` argument must be either `aura1` or `aura2`,
- The `auraRadius` must be a number greater than 0,
- The `auraColor` must be a 6 character HEX value, e.g. `#000000`,
- The `auraShape` must be either `circle` or `square`, and
- The `visibleToPlayers` argument is optional, but must be either `true` or `false` with the default being `true` if not passed in

If the `auraRadius` value is 0 or is not passed in, the aura will be turned off for the item.

### GM only

`!dropitem gm-only|[optional true or false]`
e.g. `!dropitem gm-only` or `!dropitem gm-only|true`

When called without an argument of `true` or `false`, display the current setting for whether items can be dropped by the GM only. Updates the setting when called with an argument.

The default value for this setting is `false`.
