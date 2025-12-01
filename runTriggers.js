// runTriggers.js
// Loader og eksekverer triggers for en given scene + event-type
// Til dit Trump-spil (canvas-baseret) - Hybrid trigger system

import { triggers } from "./triggers.js";
import { API } from "./triggerAPI.js"; // Dette modul laver jeg også til dig

export function runTriggers(sceneName, eventType, ctx = {}) {
  const scene = triggers[sceneName];
  const globalTriggers = triggers.global || {};

  if (!scene) return;

  // 1) Først: tjek globale triggers
  for (const [id, trig] of Object.entries(globalTriggers)) {
    if (trig.type !== eventType) continue;

    if (trig.conditions) {
      if (!checkConditions(trig.conditions, sceneName, ctx)) continue;
    }
    safeCall(id, trig, ctx);
  }

  // 2) Derefter: scenens egne triggers
  for (const [id, trig] of Object.entries(scene)) {
    if (trig.type !== eventType) continue;

    // Conditions (fx item, game flag, area osv.)
    if (trig.conditions) {
      if (!checkConditions(trig.conditions, sceneName, ctx)) continue;
    }

    // Object check (bruges til interact og proximity)
    if (trig.object && ctx.obj) {
      if (ctx.obj.type !== trig.object && ctx.obj.id !== trig.object) continue;
    }

    // Distance check hvis specificeret
    if (eventType === "proximity" && trig.distance) {
      if (!distanceOk(trig.distance, ctx.distance)) continue;
    }

    safeCall(id, trig, ctx);
  }
}

// -------------------------------------------------------------

function safeCall(id, trig, ctx) {
  try {
    trig.onTrigger(ctx, API);
  } catch (err) {
    console.error(`Trigger error in "${id}":`, err);
  }
}

function distanceOk(required, actual) {
  if (typeof required === "number") return actual <= required;
  if (typeof required === "string") return eval(required) >= actual; // fx GAME_CONSTANTS.PHYSICS…
  return true;
}

function checkConditions(cond, scene, ctx) {
  if (cond.scene && cond.scene !== scene) return false;

  if (cond.requiresItem) {
    if (!ctx.inventory || ctx.inventory.selectedItem !== cond.requiresItem) {
      return false;
    }
  }

  if (cond.requiresGameActive !== undefined) {
    if (ctx.gameActive !== cond.requiresGameActive) return false;
  }

  if (cond.finalArtNotRedacted && ctx.finalArt?.redacted === true) return false;

  if (cond.gameActive !== undefined) {
    if (ctx.gameActive !== cond.gameActive) return false;
  }

  return true;
}