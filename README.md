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

`!dropitem drop|[name of item type to drop]|[optional display name for item]`
e.g. `!dropitem drop|Backpack` or `!dropitem drop|Backpack|Oliver's Backpack`

Drops the specified item in the selected token's space. A token must be selected on the tabletop in order to call this command.

If no display name is provided, the display name will default to the player's name + the item type name.

### GM only

`!dropitem gm-only|[optional true or false]`
e.g. `!dropitem gm-only` or `!dropitem gm-only|true`

When called without an argument of `true` or `false`, display the current setting for whether items can be dropped by the GM only. Updates the setting when called with an argument.

The default value for this setting is `false`.
