/**
 * DropItem
 *
 * Version 1.1
 * Last updated: December 28, 2022
 * Author: thatblindgeye
 * GitHub: https://github.com/thatblindgeye
 */

const DropItem = (function () {
  const VERSION = "1.1 ";
  const LAST_UPDATED = 1672255878769;
  const DROPITEM_BASE_NAME = "DropItem";
  const DROPITEM_DISPLAY_NAME = `${DROPITEM_BASE_NAME} v${VERSION}`;

  const COMMANDS = {
    CREATE_TYPE: "create",
    UPDATE_TYPE: "update",
    DELETE_TYPE: "delete",
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

  function sortIgnoringCase(arrayToSort) {
    const arrayCopy = JSON.parse(JSON.stringify(arrayToSort));

    return arrayCopy.sort((toSortA, toSortB) =>
      toSortA.name.localeCompare(toSortB.name, undefined, {
        sensitivity: "base",
      })
    );
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

  function createMacros() {
    const macros = [
      {
        name: `${DROPITEM_BASE_NAME}-${COMMANDS.CREATE_TYPE}`,
        action: `!dropitem ${COMMANDS.CREATE_TYPE}|?{Item type to create}`,
      },
      {
        name: `${DROPITEM_BASE_NAME}-${COMMANDS.UPDATE_TYPE}`,
        action: `!dropitem ${COMMANDS.UPDATE_TYPE}|${createTypesQuery(
          "Item type to update"
        )}|?{New item type name (optional)}`,
      },
      {
        name: `${DROPITEM_BASE_NAME}-${COMMANDS.DELETE_TYPE}`,
        action: `!dropitem ${COMMANDS.DELETE_TYPE}|${createTypesQuery(
          "Item type to delete"
        )}`,
      },
      {
        name: `${DROPITEM_BASE_NAME}-${COMMANDS.DROP}`,
        action: `!dropitem ${COMMANDS.DROP}|${createTypesQuery(
          "Item to drop"
        )}|?{Item display name (optional)}|light=?{Item light settings (optional)}, aura=?{Item aura settings (optional)}`,
      },
      {
        name: `${DROPITEM_BASE_NAME}-${COMMANDS.TYPES}`,
        action: `!dropitem ${COMMANDS.TYPES}`,
      },
    ];

    const gmPlayers = getGMPlayers();
    const { UPDATE_TYPE, DELETE_TYPE, DROP } = COMMANDS;
    const macroNamesToUpdate = _.map(
      [UPDATE_TYPE, DELETE_TYPE, DROP],
      (command) => `${DROPITEM_BASE_NAME}-${command}`
    );

    _.each(macros, (macro) => {
      const { name, action } = macro;
      const existingMacro = getMacroByName(name);

      if (existingMacro.length && macroNamesToUpdate.includes(name)) {
        existingMacro[0].set({ action });
      } else if (!existingMacro.length) {
        createObj("macro", {
          _playerid: gmPlayers[0].get("_id"),
          name,
          action,
          visibleto: state[DROPITEM_BASE_NAME].gmDropOnly
            ? _.pluck(gmPlayers, "id").join(",")
            : "all",
          istokenaction: name === `${DROPITEM_BASE_NAME}-${COMMANDS.DROP}`,
        });
      }
    });
  }

  function setTokenLight(tokenToSet, inheritFromToken, lightOptions) {
    if (inheritFromToken && /^inherit$/i.test(lightOptions[0])) {
      tokenToSet.set({
        emits_bright_light: inheritFromToken.get("emits_bright_light"),
        bright_light_distance: inheritFromToken.get("bright_light_distance"),
        emits_low_light: inheritFromToken.get("emits_low_light"),
        low_light_distance: inheritFromToken.get("low_light_distance"),
        has_directional_bright_light: inheritFromToken.get(
          "has_directional_bright_light"
        ),
        directional_bright_light_total: inheritFromToken.get(
          "directional_bright_light_total"
        ),
        has_directional_dim_light: inheritFromToken.get(
          "has_directional_dim_light"
        ),
        directional_dim_light_total: inheritFromToken.get(
          "directional_dim_light_total"
        ),
      });

      inheritFromToken.set({
        emits_bright_light: false,
        emits_low_light: false,
        has_directional_bright_light: false,
        has_directional_dim_light: false,
      });
    } else {
      const [bright, dim, direction] = _.map(lightOptions, (lightOption) =>
        parseFloat(lightOption)
      );
      const tokenLight = {};

      if (bright > 0) {
        tokenLight.emits_bright_light = true;
        tokenLight.bright_light_distance = bright;
        if (direction > 0) {
          tokenLight.has_directional_bright_light = true;
          tokenLight.directional_bright_light_total = bright;
        }
      } else {
        tokenLight.emits_bright_light = false;
        tokenLight.has_directional_bright_light = false;
      }

      if (dim > 0) {
        tokenLight.emits_low_light = true;
        tokenLight.low_light_distance = bright + dim;

        if (direction > 0) {
          tokenLight.has_directional_dim_light = true;
          tokenLight.directional_dim_light_total = dim;
        }
      } else {
        tokenLight.emits_low_light = false;
        tokenLight.has_directional_dim_light = false;
      }

      tokenToSet.set(tokenLight);
    }
  }

  function setTokenAura(tokenToSet, inheritFromToken, auraOptions) {
    const aura = auraOptions[0];
    if (inheritFromToken && /^inherit$/i.test(auraOptions[1])) {
      tokenToSet.set({
        [`${aura}_radius`]: inheritFromToken.get(`${aura}_radius`),
        [`${aura}_color`]: inheritFromToken.get(`${aura}_color`),
        [`${aura}_square`]: inheritFromToken.get(`${aura}_square`),
        [`showplayers_${aura}`]: inheritFromToken.get(`showplayers_${aura}`),
      });

      inheritFromToken.set({ [`${aura}_radius`]: "" });
    } else {
      const [, radius, color, shape, isVisible] = auraOptions;

      tokenToSet.set({
        [`${aura}_radius`]: radius > 0 ? radius : "",
        [`${aura}_color`]: color || "transparent",
        [`${aura}_square`]: shape === "square",
        [`showplayers_${aura}`]: isVisible === "true",
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
        `<code>${args[0]}</code> is not a valid item type. For a list of the current, valid item types, call the <code>!dropitem types</code> command.`
      );
    }

    if (command === UPDATE_TYPE && !message.selected && !args[argsTypeIndex]) {
      throw new Error(
        `No updates were specified for the <code>${args[0]}</code> item type.`
      );
    }

    if (command === DROP && args[2]) {
      const settings = _.map(args[2].split(/\s*,\s*/), (argString) =>
        argString.toLowerCase()
      );

      const itemOptions = {};
      _.each(settings, (setting) => {
        if (!/^(light|aura)=/i.test(setting)) {
          throw new Error(
            `<code>${setting}</code> is not a valid setting type for the dropped item. The setting type must either be <code>light</code> or <code>aura</code> followed by an equals sign <code>=</code>.`
          );
        }
        const equalsIndex = setting.indexOf("=");
        const optionType = setting.slice(0, equalsIndex);
        const splitOptions = setting.slice(equalsIndex + 1).split(" ");
        if (splitOptions.length !== 1 && splitOptions[0] !== "") {
          itemOptions[optionType] = splitOptions;
        }
      });

      const { aura } = itemOptions;
      if (aura && aura.length > 1 && !/^aura(1|2)$/.test(aura[0])) {
        throw new Error(
          `<code>${aura[0]}</code> is not a valid aura. You must enter either <code>aura1</code> or <code>aura2</code>.`
        );
      }

      if (aura && aura[2] && !/^(\#([\da-f]{6})|transparent)$/.test(aura[2])) {
        throw new Error(
          `<code>${aura[2]}</code> is not a valid color value. Color value must either be <code>transparent</code>, or be in HEX format with exactly 6 characters following a hash <code>#</code>, e.g. <code>#ff0000</code>.`
        );
      }

      if (aura && aura[3] && !/^(circle|square)$/i.test(aura[3])) {
        throw new Error(
          `<code>${aura[3]}</code> is not a valid aura shape. The aura shape must be either <code>circle</code> or <code>square</code>.`
        );
      }

      return [command, args[0], args[1], itemOptions];
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

    state[DROPITEM_BASE_NAME].itemTypes = sortIgnoringCase([
      ...state[DROPITEM_BASE_NAME].itemTypes,
      { name, imgsrc },
    ]);
  }

  function updateItemType(selectedToken, typeToUpdate, newName) {
    const currentTypes = state[DROPITEM_BASE_NAME].itemTypes;
    const updatedTypes = _.map(currentTypes, (itemType) => {
      if (itemType.name.toLowerCase() === typeToUpdate.toLowerCase()) {
        const token = selectedToken
          ? getObj("graphic", selectedToken._id)
          : undefined;

        const imgsrc = token
          ? getCleanImgsrc(token.get("imgsrc"))
          : itemType.imgsrc;

        return {
          name: newName || itemType.name,
          imgsrc,
        };
      }

      return itemType;
    });

    state[DROPITEM_BASE_NAME].itemTypes = sortIgnoringCase(updatedTypes);
  }

  function dropItem(
    selectedToken,
    itemTypeToDrop,
    itemDisplayName,
    itemOptions
  ) {
    const droppedByToken = getObj("graphic", selectedToken._id);
    if (!itemDisplayName) {
      itemDisplayName = `${droppedByToken.get("name")} ${itemTypeToDrop.name}`;
    }

    const characterId = droppedByToken.get("represents");
    const characterControl = getObj("character", characterId).get(
      "controlledby"
    );

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
      controlledby: characterControl || _.pluck(getGMPlayers(), "id").join(","),
    });

    if (itemOptions.light) {
      setTokenLight(droppedItem, droppedByToken, itemOptions.light);
    }

    if (itemOptions.aura && itemOptions.aura.length > 1) {
      setTokenAura(droppedItem, droppedByToken, itemOptions.aura);
    }

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
      commandCell: `<a href="!dropitem ${CREATE_TYPE}|?{Item type to create}">Create Item Type</a>`,
      descriptionCell: `<div><code>!dropitem ${CREATE_TYPE}|[name of the item type]</code></div><br/><div>Creates a new item type to be dropped by other tokens.</div><br/><div>When calling this command, a valid token must be selected on the tabletop to use its image as the image of the new item type. A valid token must have been uploaded to your Roll20 library, and cannot have the default token image. The selected token cannot be one that was purchased through the Roll20 marketplace.</div>`,
    });

    const updateTypeCells = configRowTemplate({
      commandCell: `<a href="!dropitem ${UPDATE_TYPE}|${createTypesQuery(
        "Item type to update"
      )}|?{New item type name (optional)}">Update Item Type</a>`,
      descriptionCell: `<div><code>!dropitem ${UPDATE_TYPE}|[item type to update]|[optional new item type name]</code></div><br/><div>Updates an existing item type.</div><br/><div>If a token is not selected when this command is called, only the item type name will be updated. If no new item type name is provided, only the item type image will be updated if a valid token is selected.</div>`,
    });

    const deleteTypeCells = configRowTemplate({
      commandCell: `<a href="!dropitem ${DELETE_TYPE}|${createTypesQuery(
        "Item type to delete"
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
      )}|?{Item display name (optional)}">Drop Item</a>`,
      descriptionCell: `<div><code>!dropitem ${DROP}|[item to drop]|[optional display name for item]</code></div><br/><div>Drops the specified item in the selected token's space. A token must be selected on the tabletop in order to call this command. If no display name is provided, the display name will default to the player's name + the item type name.</div>`,
    });

    const { gmDropOnly } = state[DROPITEM_BASE_NAME];
    const gmOnlyCells = configRowTemplate({
      commandCell: `<a href="!dropitem ${GM_ONLY}|?{Items can be dropped by|GM only,true|All players,false}">Item Drop by GM Only: ${
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
          createMacros();
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
          createMacros();
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

          createMacros();
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

          dropItem(message.selected[0], itemTypeToDrop, args[1], args[2]);
          break;
        case GM_ONLY:
          if (args.length) {
            const newGMDropOnly =
              args[0].toLowerCase().replace(/\s*/g, "") === "true";
            state[DROPITEM_BASE_NAME].gmDropOnly = newGMDropOnly;

            createMacros();
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

      createMacros();
      log(
        "DropItem-create, DropItem-update, DropItem-delete, DropItem-types, and DropItem-drop macros created..."
      );
    }

    log(
      `${DROPITEM_DISPLAY_NAME} installed. Last updated ${new Date(
        LAST_UPDATED
      ).toLocaleDateString("en-US", {
        dateStyle: "long",
      })}. Send the '!dropitem' command (without quotes) in chat for a list of valid commands.`
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
