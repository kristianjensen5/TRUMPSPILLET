// triggers.js
// Skeleton til Trump-spillet – bygget til hybrid C-modellen
// Structure: triggers[scene][id] = { type, object, ... , onTrigger(ctx, api) }

export const triggers = {
  // ----------------------------------------------------
  // GLOBAL TRIGGERS (uafhængige af scene)
  // ----------------------------------------------------
  global: {
    tweet_in_kremlin: {
      label: "Tweet while in Kremlin",
      type: "event",
      event: "tweet",
      conditions: {
        scene: "kremlin",
      },
      onTrigger({ player, scene, state }, api) {
        // Originalt:
        // adjustRelationship('putin', {trust: -2, fear: 1}, 'tweeting_in_kremlin');
        // SFX.tweet();
        // if (tweetCount > 3 && RELATIONSHIPS.putin.trust < 30) { Putin kommenterer efter delay }  [oai_citation:0‡Trumpspillet.html](sediment://file_0000000017a471f58c93210357d956cb)

        api.adjustRelationship("putin", { trust: -2, fear: 1 }, "tweeting_in_kremlin");
        api.playSfx("tweet");

        if (state.tweetCount > 3 && api.getRelationship("putin").trust < 30) {
          api.delay(1000, () => {
            api.say("putin", "Perhaps less... social media?", 1500);
          });
        }
      },
    },

    tweet_in_greenland: {
      label: "Tweet while in Greenland",
      type: "event",
      event: "tweet",
      conditions: {
        scene: "greenland",
      },
      onTrigger({ player, scene }, api) {
        // Originalt:
        // adjustRelationship('mette', {respect: -1, trust: -2}, 'public_tweeting');
        // SFX.tweet();  [oai_citation:1‡Trumpspillet.html](sediment://file_0000000017a471f58c93210357d956cb)

        api.adjustRelationship("mette", { respect: -1, trust: -2 }, "public_tweeting");
        api.playSfx("tweet");
      },
    },

    // Epsteins afslutning – kaldes fra minigame-resultat
    epstein_game_success: {
      label: "Epstein game success",
      type: "event",
      event: "epstein_end_success",
      onTrigger({ }, api) {
        // Originalt:
        // addSafe('epstein', 'documents-redacted');
        // SFX.achievement();
        // GS.overMode = 'epstein_success'; gameOver(text);  [oai_citation:2‡Trumpspillet.html](sediment://file_0000000017a471f58c93210357d956cb)

        api.addSafe("epstein", "documents-redacted");
        api.playSfx("achievement");
        api.gameOver("Selvfølgelig er jeg ikke nævnt — never met the guy", {
          mode: "epstein_success",
        });
      },
    },

    epstein_game_fail: {
      label: "Epstein game fail",
      type: "event",
      event: "epstein_end_fail",
      onTrigger({ reason }, api) {
        // Originalt: flere grunde ('protected_click','misses','timeout') giver fail
        // SFX.error(); GS.overMode = 'epstein_fail'; GS.over = true; GS.overText = ''/fallback  [oai_citation:3‡Trumpspillet.html](sediment://file_0000000017a471f58c93210357d956cb)

        api.playSfx("error");
        api.setGameOverState({
          mode: "epstein_fail",
          text: reason === "fallback" ? "DOKUMENTGENNEMGANG SLUT." : "",
        });
      },
    },
  },

  // ----------------------------------------------------
  // GREENLAND SCENE
  // ----------------------------------------------------
  greenland: {
    heli_board: {
      label: "Helicopter menu (Greenland)",
      type: "interact",
      object: "heli",
      distance: "interact",
      onTrigger({ player, scene }, api) {
        // Originalt choice:
        // "Board helicopter?\n1) Bliv her\n2) Flyv til Grønland\n3) Flyv til The White House\n4) Epstein files\n5) Flyv til Mar-a-Lago (mini-putt)"
        // 3→oval, 4→epstein, 5→golf, 2→greenland (stay)  [oai_citation:4‡Trumpspillet.html](sediment://file_00000000946071f5bf378dded79f6a6b)

        api.openChoice(
          "Board helicopter?\n1) Bliv her\n2) Flyv til Grønland\n3) Flyv til The White House\n4) Epstein files\n5) Flyv til Mar-a-Lago (mini-putt)",
          (k) => {
            api.closeChoice();
            if (k === "2") api.switchScene("greenland");
            if (k === "3") api.switchScene("oval");
            if (k === "4") api.switchScene("epstein");
            if (k === "5") {
              api.playSfx("whoosh");
              api.startGolf("course-mar-a-lago");
            }
          }
        );

        api.addSafe("greenland", "heli-travel");
      },
    },

    mine_interact: {
      label: "Mine interaction",
      type: "interact",
      object: "mine",
      distance: "interact",
      onTrigger({ player, obj, state }, api) {
        // TODO: udfyld fra din nuværende interact-branch:
        // - hvis flag ikke er plantet → plant flag ved minen
        // - ellers vis en kommentar/tekst
        // - gem evt. state så det kun kan ske én gang

        if (!state.flags?.minePlanted) {
          api.plantFlagAt(obj.x, obj.y);
          api.setState("flags.minePlanted", true);
          api.say(player, "This mine is ours now!", 1600);
        } else {
          api.say(player, "Already a tremendous mine.", 1200);
        }
      },
    },

    rig_interact: {
      label: "Oil rig interaction",
      type: "interact",
      object: "rig",
      distance: "interact",
      onTrigger({ player, obj, inventory }, api) {
        // Originalt: hvis dynamit valgt → beginPlant(obj)
        if (inventory.selectedItem === "dynamite") {
          api.beginPlant({ type: "rig", x: obj.x, y: obj.y });
        } else {
          api.say(player, "Need the right tool for this deal...", 1400);
        }
      },
    },

    glacier_interact: {
      label: "Glacier dynamite",
      type: "interact",
      object: "glacier",
      distance: "interact",
      onTrigger({ player, obj, inventory }, api) {
        // Originalt: dynamit på gletsjer → explosion sequence, mark glaciers blown  [oai_citation:5‡Trumpspillet.html](sediment://file_0000000017a471f58c93210357d956cb)
        if (inventory.selectedItem === "dynamite") {
          api.beginPlant({ type: "glacier", x: obj.x, y: obj.y });
          api.markObjective("glaciers_dynamited");
        } else {
          api.say(player, "We could develop this... with dynamite.", 1600);
        }
      },
    },

    shop_interact: {
      label: "Shop interaction",
      type: "interact",
      object: "shop",
      distance: "interact",
      onTrigger({ player }, api) {
        // Originalt: openShop(); baseret på SHOP_ITEMS  [oai_citation:6‡Trumpspillet.html](sediment://file_0000000017a471f58c93210357d956cb)
        api.openShop();
      },
    },

    bear_interact: {
      label: "Bear interaction",
      type: "interact",
      object: "bear",
      distance: "interact",
      onTrigger({ player, inventory, sceneState }, api) {
        // Originalt:
        // - hvis dynamit → beginPlant(obj)
        // - i non-violent mode → giver fisk + safe flag
        // - ellers: skader bjørn / sætter angry/chase og viser replikker

        if (inventory.selectedItem === "dynamite") {
          api.beginPlant({ type: "bear", x: sceneState.bear.x, y: sceneState.bear.y });
          return;
        }

        if (sceneState.nonViolentMode) {
          api.giveItem("fish");
          api.addSafe("greenland", "bear-pacified");
          api.say("bear", "OK, okay... fish is good.", 1600);
          return;
        }

        // Normal aggressiv mode:
        api.modifyHp("bear", -1);
        api.say("bear", "GRRRR!", 800);

        if (sceneState.bear.hp <= 0 && !sceneState.bear.angry) {
          sceneState.bear.angry = true;
          sceneState.bear.chasing = true;
          api.say("bear", "NOW I'M ANGRY!", 1400);
          api.shakeCamera(300);
        }
      },
    },

    bear_proximity_attack: {
      label: "Bear proximity attack",
      type: "proximity",
      object: "bear",
      distance: "GAME_CONSTANTS.PHYSICS.BEAR_CHASE_DISTANCE",
      onTrigger({ player, sceneState }, api) {
        // Originalt: executeBearAttack(distToTrump) med CHOMP, blood, knockback osv.  [oai_citation:7‡Trumpspillet.html](sediment://file_0000000017a471f58c93210357d956cb)
        api.say("bear", "CHOMP! 🦷", 800);
        api.spawnBlood(player.x, player.y - 10 * api.scale(), 8);
        api.knockbackPlayer({
          horizontal: api.const("HORIZONTAL_KNOCKBACK"),
          vertical: -20 * api.scale(),
        });
        api.playSfx("error");
        api.setHudToast("🐻 Bear attack!");
      },
    },
  },

  // ----------------------------------------------------
  // OVAL OFFICE SCENE
  // ----------------------------------------------------
  oval: {
    button_press: {
      label: "Policy button press",
      type: "interact",
      object: "button",
      distance: "interact",
      onTrigger({ player, objIndex }, api) {
        // Originalt:
        // - Hvis 'tariff'-knap → tariff-visualisering og replik
        // - Ellers random policy fra policies[], med OV.screen.active osv.  [oai_citation:8‡Trumpspillet.html](sediment://file_00000000946071f5bf378dded79f6a6b)
        // Denne trigger kan evt. splittes i flere (tariff vs random), men skeletet er samlet.

        if (objIndex === 0) {
          // Eksempel: tariffs
          api.showTariffPolicy();
        } else {
          api.showRandomPolicy();
        }

        api.praiseChoir();
        api.addSafe("oval", `button-${objIndex}`);
      },
    },

    heli_board: {
      label: "Helicopter menu (Oval)",
      type: "interact",
      object: "heli",
      distance: "interact",
      onTrigger({ }, api) {
        // Original tekst:
        // "Board helicopter?\n1) Bliv her\n2) Flyv til Grønland\n3) Flyv til Moskva (møde)\n4) Epstein files\n5) Flyv til Mar-a-Lago (mini-putt)"  [oai_citation:9‡Trumpspillet.html](sediment://file_0000000017a471f58c93210357d956cb)

        api.ensureAudioInit();
        api.playSfx("helicopter");
        api.addSafe("oval", "heli-travel");

        api.openChoice(
          "Board helicopter?\n1) Bliv her\n2) Flyv til Grønland\n3) Flyv til Moskva (møde)\n4) Epstein files\n5) Flyv til Mar-a-Lago (mini-putt)",
          (k) => {
            api.closeChoice();
            if (k === "2") {
              api.playSfx("whoosh");
              api.switchScene("greenland");
            }
            if (k === "3") {
              api.playSfx("whoosh");
              api.switchScene("kremlin");
            }
            if (k === "4") {
              api.playSfx("whoosh");
              api.switchScene("epstein");
            }
            if (k === "5") {
              api.playSfx("whoosh");
              api.startGolf("course-mar-a-lago");
            }
          }
        );
      },
    },
  },

  // ----------------------------------------------------
  // KREMLIN SCENE
  // ----------------------------------------------------
  kremlin: {
    door_exit: {
      label: "Leave Kremlin meeting",
      type: "interact",
      object: "door",
      distance: "interact",
      onTrigger({ }, api) {
        // Original:
        // "Forlade mødet?\n1) Bliv her\n2) Tilbage til Grønland"  [oai_citation:10‡Trumpspillet.html](sediment://file_0000000017a471f58c93210357d956cb)

        api.openChoice("Forlade mødet?\n1) Bliv her\n2) Tilbage til Grønland", (k) => {
          api.closeChoice();
          if (k === "2") api.switchScene("greenland");
        });
      },
    },

    putin_handshake: {
      label: "Handshake with Putin",
      type: "interact",
      object: "putin",
      distance: "interact",
      onTrigger({ }, api) {
        // Originalt: startHandshake()
        api.startHandshake();
      },
    },

    putin_dynamite: {
      label: "Plant dynamite on Putin",
      type: "interact",
      object: "putin",
      requiresItem: "dynamite",
      onTrigger({ inventory }, api) {
        // Originalt: special satirisk slutning når dynamit bruges på Putin  [oai_citation:11‡Trumpspillet.html](sediment://file_00000000946071f5bf378dded79f6a6b)
        if (inventory.selectedItem !== "dynamite") return;
        api.beginPlant({ type: "putin" });
      },
    },

    statue_steal: {
      label: "Steal Kremlin statue",
      type: "interact",
      object: "statue",
      distance: "interact",
      onTrigger({ obj }, api) {
        // Originalt:
        // - hvis isStatueUnderSurveillance → triggerSecurityDiscovery(obj)
        // - ellers: obj.collected=true; addToInventory; OV.shelfLoot push; addSafe('kremlin', obj.id); say boast-linje  [oai_citation:12‡Trumpspillet.html](sediment://file_0000000017a471f58c93210357d956cb)

        if (api.isStatueUnderSurveillance(obj)) {
          api.triggerSecurityDiscovery(obj);
          return;
        }

        api.markCollected(obj);
        api.addToInventory(obj.id, obj.name);
        api.addKremlinShelfLoot({ variant: obj.variant || 1 });
        api.addSafe("kremlin", obj.id);
        api.say(
          "trump",
          api.random([
            "Only I could get this deal.",
            "They love me here. Tremendous!",
            "Beautiful piece. I deserve it.",
            "Everyone says it belongs with me.",
          ]),
          1400
        );
      },
    },

    heli_board: {
      label: "Helicopter menu (Kremlin)",
      type: "interact",
      object: "heli",
      distance: "interact",
      onTrigger({ }, api) {
        api.addSafe("kremlin", "heli-travel");
        api.openChoice(
          "Board helicopter?\n1) Bliv her\n2) Flyv til Grønland\n3) Flyv til The White House\n4) Epstein files\n5) Flyv til Mar-a-Lago (mini-putt)",
          (k) => {
            api.closeChoice();
            if (k === "2") api.switchScene("greenland");
            if (k === "3") api.switchScene("oval");
            if (k === "4") api.switchScene("epstein");
            if (k === "5") {
              api.playSfx("whoosh");
              api.startGolf("course-mar-a-lago");
            }
          }
        );
      },
    },

    camera_discovery: {
      label: "Security camera discovery",
      type: "event",
      event: "camera_detects_theft",
      onTrigger({ obj }, api) {
        // Originalt triggerSecurityDiscovery(obj): forholdsvis kompleks sekvens:
        // - Putin bliver rasende + replik
        // - Trump siger "This is fake surveillance!"
        // - adjustRelationship('putin', {respect:-15, trust:-20, fear:5}, 'caught_stealing')
        // - spawnSecurityGuards()
        // - flash skærm og gameOverCause('kremlin') efter delay  [oai_citation:13‡Trumpspillet.html](sediment://file_0000000017a471f58c93210357d956cb)

        api.say("putin", "What are you doing?!");
        api.say("trump", "This is fake surveillance!", 2000);

        api.adjustRelationship("putin", { respect: -15, trust: -20, fear: 5 }, "caught_stealing");

        api.spawnSecurityGuards();
        api.flashCamera(500);

        api.delay(1600, () => {
          api.gameOverCause("kremlin");
        });

        api.delay(5000, () => {
          api.resetCameraDiscovery();
        });
      },
    },
  },

  // ----------------------------------------------------
  // EPSTEIN SCENE
  // ----------------------------------------------------
  epstein: {
    exit_door_interact: {
      label: "Exit documents room (by player position)",
      type: "interact",
      object: "door",
      distance: "interact",
      conditions: {
        gameActive: false,
      },
      onTrigger({ }, api) {
        // Originalt i interact() når scene==='epstein' og EP.gameActive===false:
        // "Leave document review?\n1) Stay here\n2) Back to helicopter"  [oai_citation:14‡Trumpspillet.html](sediment://file_00000000946071f5bf378dded79f6a6b)

        api.openChoice(
          "Leave document review?\n1) Stay here\n2) Back to helicopter",
          (k) => {
            api.closeChoice();
            if (k === "2") api.switchScene("greenland");
          }
        );
      },
    },

    exit_click_door: {
      label: "Exit via click on door",
      type: "click",
      object: "door",
      area: "circle",
      radius: "80*scale",
      conditions: {
        gameActive: false,
      },
      onTrigger({ }, api) {
        // Originalt i handleEpsteinClick når EP.gameActive===false og klik nær dør:
        // Samme choice-menu som ovenfor  [oai_citation:15‡Trumpspillet.html](sediment://file_0000000017a471f58c93210357d956cb)

        api.openChoice(
          "Leave document review?\n1) Continue redacting\n2) Back to helicopter",
          (k) => {
            api.closeChoice();
            if (k === "2") api.switchScene("greenland");
          }
        );
      },
    },

    final_art_redact: {
      label: "Redact big final image",
      type: "click",
      object: "finalArtRect",
      area: "rect",
      conditions: {
        requiresGameActive: true,
        finalArtNotRedacted: true,
      },
      onTrigger({ rect }, api) {
        // Originalt:
        // - sæt EP.finalArt.redacted = true
        // - SFX.success()
        // - toast "Image redacted"
        // - efter ~1.2s → endEpsteinGame('success' eller 'misses')  [oai_citation:16‡Trumpspillet.html](sediment://file_0000000017a471f58c93210357d956cb)

        api.markFinalArtRedacted();
        api.playSfx("success");
        api.showToastAtRect(rect, "Image redacted", "#6cff6c", 1200);

        if (!api.getEpsteinFlag("endingPending")) {
          api.setEpsteinFlag("endingPending", true);

          const result = api.getEpsteinResult(); // 'success' eller 'misses'
          api.delay(1200, () => api.endEpsteinGame(result));
        }
      },
    },

    click_protected_name: {
      label: "Protected name click (Clinton/Gates)",
      type: "click",
      object: "protected_target",
      area: "rect",
      conditions: {
        requiresGameActive: true,
      },
      onTrigger({ mouseX, mouseY }, api) {
        // Originalt:
        // EP.protectedClicks++; SFX.error(); triggerShake(...); hudToast = 'Penalty: Overstreg ikke blå ...';
        // fjerner location; hvis > limit → endEpsteinGame('protected_click')  [oai_citation:17‡Trumpspillet.html](sediment://file_00000000946071f5bf378dded79f6a6b)

        api.incrementEpsteinProtectedClicks();
        api.playSfx("error");
        api.triggerShake(6 * api.scale(), 300);
        api.setHudToast("Penalty: Overstreg ikke blå (Clinton/Gates)");

        if (api.exceedsProtectedLimit()) {
          api.endEpsteinGame("protected_click");
        }
      },
    },

    click_trump_name: {
      label: "Trump name redacted",
      type: "click",
      object: "trump_target",
      area: "rect",
      conditions: {
        requiresGameActive: true,
      },
      onTrigger({ mouseX, mouseY }, api) {
        // Originalt:
        // line.redacted = true; EP.foundTrumps++; SFX.success(); spawnSparks(); toast "+1 Redacted" osv.  [oai_citation:18‡Trumpspillet.html](sediment://file_00000000946071f5bf378dded79f6a6b)

        api.redactTrumpLineAt(mouseX, mouseY);
        api.playSfx("success");
        api.spawnSparks(mouseX, mouseY, 8);
        api.pushEpsteinToast({
          x: mouseX,
          y: mouseY - 10 * api.scale(),
          text: "+1 Redacted",
          color: "#6cff6c",
          ttl: 700,
        });
      },
    },

    click_other: {
      label: "Non-target click",
      type: "click",
      object: "background",
      area: "canvas",
      conditions: {
        requiresGameActive: true,
      },
      onTrigger({ }, api) {
        // Originalt: bare en lille click-lyd  [oai_citation:19‡Trumpspillet.html](sediment://file_00000000946071f5bf378dded79f6a6b)
        api.playSfx("click");
      },
    },
  },
};