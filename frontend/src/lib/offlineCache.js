// Part 3: a small generic IndexedDB cache, used to store read-only content
// (scheme details, PACS records, chatbot answers) so it's available offline
// after the first time it's been seen — separate from the grievance data
// layer, which has its own online/offline story (see lib/grievance.js and
// lib/firebase.js's enableIndexedDbPersistence).
//
// Every cached entry carries `source` and `lastUpdated` so the UI can always
// show where cached content came from and when it was last refreshed,
// per the brief's requirement to never present stale info as if it were live.

import { get, set, keys, del } from 'idb-keyval'

const PREFIX = 'coopconnect-cache:'

export async function cacheGet(type, id) {
  try {
    return (await get(`${PREFIX}${type}:${id}`)) || null
  } catch {
    return null
  }
}

export async function cacheSet(type, id, data, { source, lastUpdated } = {}) {
  try {
    await set(`${PREFIX}${type}:${id}`, {
      data,
      source: source || 'Mitra sample data',
      lastUpdated: lastUpdated || new Date().toISOString(),
      cachedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.warn('Could not cache offline content:', err)
  }
}

export async function cacheList(type) {
  try {
    const allKeys = await keys()
    const matching = allKeys.filter((k) => typeof k === 'string' && k.startsWith(`${PREFIX}${type}:`))
    const entries = await Promise.all(matching.map((k) => get(k)))
    return entries.filter(Boolean)
  } catch {
    return []
  }
}

export async function cacheClear(type) {
  try {
    const allKeys = await keys()
    const matching = allKeys.filter((k) => typeof k === 'string' && k.startsWith(`${PREFIX}${type}:`))
    await Promise.all(matching.map((k) => del(k)))
  } catch {
    // best-effort
  }
}