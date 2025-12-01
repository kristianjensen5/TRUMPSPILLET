// triggerAPI.js
// Et klart og stabilt API som dine triggers kalder
// Gør editor-scripting let og sikkert

import * as G from "./gameState.js"; // dit spil’s centrale state
import * as SFX from "./sfx.js";

export const API = {
  // -------------------------
  // HUD / Dialog
  // -------------------------
  say(character, text, ttl = 1500) {
    G.Dialog.push({ character, text, ttl });
  },

  showToastAtRect(rect, text, color, ttl) {
    G.createToast(rect.x, rect.y, text, color, ttl);
  },

  pushEpsteinToast(toast) {
    G.EP.toasts.push(toast);
  },

  setHudToast(msg) {
    G.HUD.toast = msg;
  },

  // -------------------------
  // Scene control
  // -------------------------
  switchScene(name) {
    G.switchScene(name);
  },

  startGolf(course) {
    G.startGolf(course);
  },

  beginPlant({ type, x, y }) {
    G.beginPlant(type, x, y);
  },

  markObjective(id) {
    G.addObjective(id);
  },

  // -------------------------
  // Player / inventory / items
  // -------------------------
  giveItem(id) {
    G.Inventory.add(id);
  },

  addToInventory(id, label) {
    G.Inventory.add(id, label);
  },

  modifyHp(entity, amount) {
    G[entity].hp += amount;
  },

  knockbackPlayer(vec) {
    G.knockbackPlayer(vec);
  },

  teleportPlayer(x, y) {
    G.Player.x = x;
    G.Player.y = y;
  },

  // -------------------------
  // Effects & sounds
  // -------------------------
  playSfx(id) {
    SFX[id]?.();
  },

  shakeCamera(dur) {
    G.Camera.shake = dur;
  },

  spawnBlood(x, y, count) {
    G.spawnBlood(x, y, count);
  },

  spawnSparks(x, y, count) {
    G.spawnSparks(x, y, count);
  },

  flashCamera(ms) {
    G.Screen.flash(ms);
  },

  // -------------------------
  // Choices
  // -------------------------
  openChoice(text, cb) {
    G.Choice.open(text, cb);
  },

  closeChoice() {
    G.Choice.close();
  },

  // -------------------------
  // Relationships
  // -------------------------
  adjustRelationship(person, values, reason) {
    G.Relations.adjust(person, values, reason);
  },

  getRelationship(person) {
    return G.Relations.get(person);
  },

  // -------------------------
  // Time helpers
  // -------------------------
  delay(ms, fn) {
    setTimeout(fn, ms);
  },

  const(name) {
    return G.CONSTANTS[name];
  },

  scale() {
    return G.SCALE;
  },

  // -------------------------
  // Epstein-specific
  // -------------------------
  markFinalArtRedacted() {
    G.EP.finalArt.redacted = true;
  },

  getEpsteinFlag(name) {
    return G.EP[name];
  },

  setEpsteinFlag(name, val) {
    G.EP[name] = val;
  },

  incrementEpsteinProtectedClicks() {
    G.EP.protectedClicks++;
  },

  exceedsProtectedLimit() {
    return G.EP.protectedClicks > G.EP.PROTECTED_LIMIT;
  },

  endEpsteinGame(result) {
    G.EP.endGame(result);
  },

  getEpsteinResult() {
    return G.EP.computeResult();
  },
};