import { randomUUID } from "node:crypto";
import { readJson, writeJson } from "./jsonStore.js";
import { CONTENT_PATH } from "./paths.js";

export function getContent() {
  return readJson(CONTENT_PATH);
}

function saveContent(content) {
  return writeJson(CONTENT_PATH, content);
}

/** Shallow-merge a top-level section (e.g. "hero", "overview", "meta", "downloads"). */
export function updateSection(section, patch) {
  const content = getContent();
  if (!(section in content)) {
    const err = new Error(`Unknown content section: ${section}`);
    err.status = 400;
    throw err;
  }
  content[section] = { ...content[section], ...patch };
  saveContent(content);
  return content[section];
}

/** Replace the developer.links object. */
export function updateDeveloperLinks(patch) {
  const content = getContent();
  content.developer.links = { ...content.developer.links, ...patch };
  saveContent(content);
  return content.developer;
}

// --- Generic helpers for the list-shaped sections: features, howItWorks, developer.otherApps ---

function getListPath(listName) {
  const paths = {
    features: (content) => content.features,
    howItWorks: (content) => content.howItWorks,
    otherApps: (content) => content.developer.otherApps,
  };
  if (!paths[listName]) {
    const err = new Error(`Unknown list: ${listName}`);
    err.status = 400;
    throw err;
  }
  return paths[listName];
}

function setList(content, listName, newList) {
  if (listName === "otherApps") {
    content.developer.otherApps = newList;
  } else {
    content[listName] = newList;
  }
}

export function addListItem(listName, item) {
  const content = getContent();
  const list = getListPath(listName)(content);
  const newItem = { id: randomUUID(), ...item };
  setList(content, listName, [...list, newItem]);
  saveContent(content);
  return newItem;
}

export function updateListItem(listName, id, patch) {
  const content = getContent();
  const list = getListPath(listName)(content);
  let updated = null;
  const newList = list.map((existing) => {
    if (existing.id === id) {
      updated = { ...existing, ...patch, id };
      return updated;
    }
    return existing;
  });
  if (!updated) {
    const err = new Error(`Item not found: ${id}`);
    err.status = 404;
    throw err;
  }
  setList(content, listName, newList);
  saveContent(content);
  return updated;
}

export function deleteListItem(listName, id) {
  const content = getContent();
  const list = getListPath(listName)(content);
  const newList = list.filter((existing) => existing.id !== id);
  if (newList.length === list.length) {
    const err = new Error(`Item not found: ${id}`);
    err.status = 404;
    throw err;
  }
  setList(content, listName, newList);
  saveContent(content);
  return { id };
}

export function reorderList(listName, orderedIds) {
  const content = getContent();
  const list = getListPath(listName)(content);
  const byId = new Map(list.map((item) => [item.id, item]));
  const reordered = orderedIds
    .map((id) => byId.get(id))
    .filter(Boolean);
  // Append any items that were missed, so nothing is silently dropped.
  for (const item of list) {
    if (!orderedIds.includes(item.id)) reordered.push(item);
  }
  setList(content, listName, reordered);
  saveContent(content);
  return reordered;
}
