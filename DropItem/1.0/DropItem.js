delete state.DropItem;
/**
 * DropItem
 *
 * Version 1.0
 * Last updated: November 14, 2022
 * Author: thatblindgeye
 * GitHub: https://github.com/thatblindgeye
 */

const DropItem = (function () {
  const VERSION = "1.0 ";
  const LAST_UPDATED = 1668553822810;
  const DROPITEM_BASE_NAME = "DropItem";
  const DROPITEM_DISPLAY_NAME = `${DROPITEM_BASE_NAME} v${VERSION}`;

  const COMMANDS = {
    CREATE_TYPE: "create-type",
    UPDATE_TYPE: "update-type",
    DELETE_TYPE: "delete-type",
    TYPES: "types",
    DROP: "drop",
    GM_ONLY: "gm-only",
  };

  const DEFAULT_STATE = {
    gmDropOnly: false,
    itemTypes: [
      {
        name: `Backpack`,
        imgsrc:
          "https://s3.amazonaws.com/files.d20.io/images/314137120/MbQpDkeFWG03arnAiWX-IQ/thumb.png?1668369565",
      },
      {
        name: `Misc`,
        imgsrc:
          "https://s3.amazonaws.com/files.d20.io/images/314137148/HE2Rxv99BLN0dv95bEixqw/thumb.png?1668369572",
      },
      {
        name: `Torch`,
        imgsrc:
          "https://s3.amazonaws.com/files.d20.io/images/314137207/WCUj5tn7zM2vNm8vKURMIA/thumb.png?1668369589",
      },
      {
        name: `Treasure`,
        imgsrc:
          "https://s3.amazonaws.com/files.d20.io/images/314137214/HiPuaB3olvDI8UTQk1VOfg/thumb.png?1668369591",
      },
      {
        name: `Weapon`,
        imgsrc:
          "https://s3.amazonaws.com/files.d20.io/images/314137220/-CYXx2qm35Xq3XQJMItm9g/thumb.png?1668369593",
      },
    ],
  };

  function sendMessage(message) {
    sendChat(DROPITEM_DISPLAY_NAME, message, null, { noarchive: true });
  }

  function getCleanImgsrc(imgsrc) {
    const parts = imgsrc.match(
      /(.*\/images\/.*)(thumb|med|original|max)([^\?]*)(\?[^?]+)?$/
    );

    if (parts) {
      return (
        parts[1] +
        "thumb" +
        parts[3] +
        (parts[4] ? parts[4] : `?${Math.round(Math.random() * 9999999)}`)
      );
    }

    throw new Error(
      `The selected token does not have a valid image source. A token's image cannot be the default image, and the selected token cannot be one that was purchased on the Roll20 marketplace.`
    );
  }

  function getGMPlayers() {
    return _.filter(
      findObjs({
        _type: "player",
      }),
      (player) => playerIsGM(player.get("_id"))
    );
  }

  function getMacroByName(macroName) {
    return findObjs(
      { _type: "macro", name: macroName },
      { caseInsensitive: true }
    );
  }

  function createTypesQuery(dropdownLabel) {
    const { itemTypes } = state[DROPITEM_BASE_NAME];
    const typesString = _.map(itemTypes, (itemType) => itemType.name).join("|");

    return `?{${dropdownLabel}|${typesString}}`;
  }

  function createDropMacro() {
    const macroAction = `!dropitem ${COMMANDS.DROP}|${createTypesQuery(
      "Item to drop:"
    )}|?{Item display name (optional):}`;
    const macroName = `${DROPITEM_BASE_NAME}-${COMMANDS.DROP}`;
    const currentMacro = getMacroByName(macroName);

    if (currentMacro.length) {
      currentMacro[0].set({ action: macroAction });
    } else {
      const gmPlayers = getGMPlayers();

      createObj("macro", {
        _playerid: gmPlayers[0].get("_id"),
        name: macroName,
        action: macroAction,
        visibleto: state[DROPITEM_BASE_NAME].gmDropOnly
          ? _.pluck(gmPlayers, "id").join(",")
          : "all",
        istokenaction: true,
      });
    }
  }

  function validateCommand(message) {
    const { CREATE_TYPE, UPDATE_TYPE, DELETE_TYPE, DROP, GM_ONLY } = COMMANDS;
    const { itemTypes, gmDropOnly } = state[DROPITEM_BASE_NAME];
    const [prefix, ...args] = message.content.split("|");
    const command = _.map(prefix.split(" "), (prefixItem) =>
      prefixItem.toLowerCase()
    )[1];

    if (command && !_.contains(COMMANDS, command)) {
      throw new Error(
        `<code>${command}</code> is not a valid command. Call the <code>!dropitem</code> command for a list of valid commands.`
      );
    }

    if (
      command &&
      ([CREATE_TYPE, UPDATE_TYPE, DELETE_TYPE, GM_ONLY].includes(command) ||
        (command === DROP && gmDropOnly)) &&
      !playerIsGM(message.playerid)
    ) {
      throw new Error(
        `/w "${message.who}" You do not have permission to use the <code>${command}</code> command.`
      );
    }

    if ([CREATE_TYPE, DROP].includes(command) && !message.selected) {
      throw new Error(
        `A token must be selected when calling the <code>${command}</code> command.`
      );
    }

    if ([CREATE_TYPE, DROP].includes(command) && message.selected.length > 1) {
      throw new Error(
        `Only one token can be selected when calling the <code>${command}</code> command.`
      );
    }

    const argsTypeIndex = command === CREATE_TYPE ? 0 : 1;
    if (
      [CREATE_TYPE, UPDATE_TYPE].includes(command) &&
      args[argsTypeIndex] &&
      _.find(
        itemTypes,
        (type) => type.name.toLowerCase() === args[argsTypeIndex].toLowerCase()
      )
    ) {
      throw new Error(
        `<code>${args[optionIndex]}</code> already exists as an item type. Item types must have unique names, ignoring lettercase.`
      );
    }

    if (
      [CREATE_TYPE, UPDATE_TYPE, DELETE_TYPE, DROP].includes(command) &&
      !args[0]
    ) {
      throw new Error(
        `The item type cannot be blank when calling the <code>${command}</code> command.`
      );
    }

    if (
      [DROP, UPDATE_TYPE].includes(command) &&
      args[0] &&
      !_.find(
        itemTypes,
        (type) => type.name.toLowerCase() === args[0].toLowerCase()
      )
    ) {
      throw new Error(
        `<code>${
          args[0]
        }</code> is not a valid item type. For a list of the current, valid item types that can be ${
          command === DROP ? "dropped on the tabletop" : "updated"
        }, call the <code>!dropitem types</code> command.`
      );
    }

    if (command === UPDATE_TYPE && !message.selected && !args[argsTypeIndex]) {
      throw new Error(
        `No updates were specified for the <code>${args[0]}</code> item type.`
      );
    }

    if (command === GM_ONLY && args[0] && !/^true|false$/i.test(args[0])) {
      throw new Error(
        `<code>${args[0]}</code> is not a valid value for the "GM drop only" setting. You must either pass in <code>true</code> or <code>false</code>.`
      );
    }

    return [command, ...args];
  }

  function createItemType(selectedToken, name) {
    const token = getObj("graphic", selectedToken._id);
    const imgsrc = getCleanImgsrc(token.get("imgsrc"));

    state[DROPITEM_BASE_NAME].itemTypes = _.sortBy(
      [...state[DROPITEM_BASE_NAME].itemTypes, { name, imgsrc }],
      "name"
    );
  }

  function updateItemType(selectedToken, typeToUpdate, newName) {
    const currentTypes = state[DROPITEM_BASE_NAME].itemTypes;
    let updatedTypeName = "";
    const updatedTypes = _.map(currentTypes, (itemType) => {
      if (itemType.name.toLowerCase() === typeToUpdate.toLowerCase()) {
        const token = selectedToken
          ? getObj("graphic", selectedToken._id)
          : undefined;

        const imgsrc = token
          ? getCleanImgsrc(token.get("imgsrc"))
          : itemType.imgsrc;

        updatedTypeName = itemType.name;

        return {
          name: newName || itemType.name,
          imgsrc,
        };
      }

      return itemType;
    });

    state[DROPITEM_BASE_NAME].itemTypes = _.sortBy(updatedTypes, "name");
  }

  function dropItem(selectedToken, player, itemTypeToDrop, itemDisplayName) {
    if (!itemDisplayName) {
      itemDisplayName = `${player.name} ${itemTypeToDrop.name}`;
    }

    const droppedByToken = getObj("graphic", selectedToken._id);
    const droppedItem = createObj("graphic", {
      _pageid: getObj("page", droppedByToken.get("pageid")).get("id"),
      imgsrc: itemTypeToDrop.imgsrc,
      name: itemDisplayName,
      top: droppedByToken.get("top"),
      left: droppedByToken.get("left"),
      width: 70,
      height: 70,
      layer: "objects",
      showname: true,
      controlledby: player.id,
    });

    toFront(droppedItem);
  }

  const configRowTemplate = _.template(
    "<tr style='border-bottom: 1px solid gray;'><td style='vertical-align: top; padding: 5px;'><%= commandCell %></td><td style='padding: 5px 5px 5px 10px;'><%= descriptionCell %></td></tr>"
  );

  function buildConfigDisplay() {
    const { CREATE_TYPE, UPDATE_TYPE, DELETE_TYPE, TYPES, DROP, GM_ONLY } =
      COMMANDS;

    const tableHeader =
      "<thead><tr><th style='padding: 2px;'>Command</th><th style='padding: 2px 2px 2px 10px;'>Description</th></tr></thead>";

    const createTypeCells = configRowTemplate({
      commandCell: `<a href="!dropitem ${CREATE_TYPE}|?{Item type:}">Create Item Type</a>`,
      descriptionCell: `<div><code>!dropitem ${CREATE_TYPE}|[name of the item type]</code></div><br/><div>Creates a new item type to be dropped by other tokens.</div><br/><div>When calling this command, a valid token must be selected on the tabletop. A valid token must have been uploaded to your Roll20 library, and cannot have the default token image. The selected token cannot be one that was purchased through the Roll20 marketplace.</div>`,
    });

    const updateTypeCells = configRowTemplate({
      commandCell: `<a href="!dropitem ${UPDATE_TYPE}|${createTypesQuery(
        "Item type to update:"
      )}|?{New item type name (optional):}">Update Item Type</a>`,
      descriptionCell: `<div><code>!dropitem ${UPDATE_TYPE}|[item type to update]|[optional new item type name]</code></div><br/><div>Updates an existing item type.</div><br/><div>If a token is not selected when this command is called, only the item type name will be updated. If no new item type name is provided, only the item type image will be updated if a valid token is selected.</div>`,
    });

    const deleteTypeCells = configRowTemplate({
      commandCell: `<a href="!dropitem ${DELETE_TYPE}|${createTypesQuery(
        "Item type to delete:"
      )}">Delete Item Type</a>`,
      descriptionCell: `<div><code>!dropitem ${DELETE_TYPE}|[item type to delete]</code></div><br/><div>Deletes an existing item type.</div>`,
    });

    const typesCells = configRowTemplate({
      commandCell: `<a href="!dropitem ${TYPES}">Display Item Types</a>`,
      descriptionCell: `<div><code>!dropitem ${TYPES}</code></div><br/><div>Displays the current item types in the campaign, including their images and name.</div>`,
    });

    const dropCells = configRowTemplate({
      commandCell: `<a href="!dropitem ${DROP}|${createTypesQuery(
        "Item to drop"
      )}|?{Item display name (optional):}">Drop Item</a>`,
      descriptionCell: `<div><code>!dropitem ${DROP}|[item to drop]|[optional display name for item]</code></div><br/><div>Drops the specified item in the selected token's space. A token must be selected on the tabletop in order to call this command. If no display name is provided, the display name will default to the player's name + the item type name.</div>`,
    });

    const { gmDropOnly } = state[DROPITEM_BASE_NAME];
    const gmOnlyCells = configRowTemplate({
      commandCell: `<a href="!dropitem ${GM_ONLY}|?{Items can be dropped by:|GM only,true|All players,false}">Item Drop by GM Only: ${
        gmDropOnly ? "Enabled" : "Disabled"
      }</a>`,
      descriptionCell: `<div><code>!dropitem ${GM_ONLY}|[optional true or false]</code></div><br/><div>When called without an argument of "true" or "false", display the current setting for whether items can be dropped by the GM only. Updates the setting when called with an argument.</div>`,
    });

    sendMessage(
      `/w gm <table style="border: 2px solid gray;">${tableHeader}<tbody>${createTypeCells}${updateTypeCells}${deleteTypeCells}${typesCells}${dropCells}${gmOnlyCells}</tbody></table>`
    );
  }

  function displayItemTypes(playerName) {
    const itemTypeRows = _.map(
      state[DROPITEM_BASE_NAME].itemTypes,
      (itemType) =>
        `<tr><td style="padding: 10px 0;"><div style="width: 70px; height: auto;"><img src="${itemType.imgsrc}" alt="${itemType.name}" /></div></td><td style="padding-left: 10px;">${itemType.name}</td></tr>`
    ).join("");

    sendMessage(
      `/w "${playerName}" <table><thead><tr><th style="padding-right: 10px;">Item type image</th><th style="padding-left: 10px;">Item type name</th></tr></thead><tbody>${itemTypeRows}</tbody></table>`
    );
  }

  function handleChatInput(message) {
    try {
      const { CREATE_TYPE, UPDATE_TYPE, DELETE_TYPE, TYPES, DROP, GM_ONLY } =
        COMMANDS;

      const [command, ...args] = validateCommand(message);

      switch (command) {
        case CREATE_TYPE:
          createItemType(message.selected[0], args[0]);
          createDropMacro();
          buildConfigDisplay();
          sendMessage(
            `/w gm The <code>${args[0]}</code> item type has been created.`
          );
          break;
        case UPDATE_TYPE:
          const selectedToken = message.selected
            ? message.selected[0]
            : undefined;

          updateItemType(selectedToken, ...args);
          createDropMacro();
          buildConfigDisplay();
          sendMessage(
            `/w gm The <code>${args[0]}</code> item type has been updated.`
          );
          break;
        case DELETE_TYPE:
          state[DROPITEM_BASE_NAME].itemTypes = _.filter(
            state[DROPITEM_BASE_NAME].itemTypes,
            (itemType) => itemType.name.toLowerCase() !== args[0].toLowerCase()
          );
          buildConfigDisplay();
          sendMessage(
            `/w gm The <code>${args[0]}</code> item type has been deleted.`
          );
          break;
        case TYPES:
          const playerToMessage = playerIsGM(message.playerid)
            ? "gm"
            : message.who;
          displayItemTypes(playerToMessage);
          break;
        case DROP:
          const itemTypeToDrop = _.find(
            state[DROPITEM_BASE_NAME].itemTypes,
            (itemType) => itemType.name.toLowerCase() === args[0].toLowerCase()
          );

          dropItem(
            message.selected[0],
            { id: message.playerid, name: message.who },
            itemTypeToDrop,
            args[1]
          );
          break;
        case GM_ONLY:
          if (args.length) {
            const newGMDropOnly =
              args[0].toLowerCase().replace(/\s*/g, "") === "true";
            state[DROPITEM_BASE_NAME].gmDropOnly = newGMDropOnly;

            const currentMacro = getMacroByName(
              `${DROPITEM_BASE_NAME}-${COMMANDS.DROP}`
            );
            if (currentMacro.length) {
              currentMacro[0].set({
                visibleto: newGMDropOnly
                  ? _.pluck(getGMPlayers(), "id").join(",")
                  : "all",
              });
            }

            buildConfigDisplay();
          }

          sendMessage(
            `/w gm ${
              args.length
                ? "Item dropping has been updated, and can now be done by"
                : "Items can currently be dropped by"
            } ${
              state[DROPITEM_BASE_NAME].gmDropOnly
                ? "the GM only"
                : "all players"
            }.`
          );
          break;
        default:
          buildConfigDisplay();
          break;
      }
    } catch (error) {
      sendMessage(`/w gm ${error.message}`);
    }
  }

  function registerEventHandlers() {
    on("chat:message", (message) => {
      if (message.type === "api" && /^!dropitem/i.test(message.content)) {
        handleChatInput(message);
      }
    });
  }

  function checkInstall() {
    if (!_.has(state, DROPITEM_BASE_NAME)) {
      log("Installing " + DROPITEM_DISPLAY_NAME);
      state[DROPITEM_BASE_NAME] = JSON.parse(JSON.stringify(DEFAULT_STATE));
      createDropMacro();
    }

    log(
      `${DROPITEM_DISPLAY_NAME} installed. Last updated ${new Date(
        LAST_UPDATED
      ).toLocaleDateString("en-US", {
        dateStyle: "long",
      })}.`
    );
  }

  return {
    checkInstall,
    registerEventHandlers,
  };
})();

on("ready", () => {
  "use strict";

  DropItem.checkInstall();
  DropItem.registerEventHandlers();
});
