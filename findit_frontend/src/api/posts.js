import { api } from "./client.js";

// Barcha sahifalarni yig'adi (xarita uchun), ko'pi bilan maxPages ta
export async function fetchAllPosts(params = {}, maxPages = 6) {
  const all = [];
  for (let page = 1; page <= maxPages; page++) {
    const data = await api.get("/posts/", { ...params, page });
    all.push(...(data.results || []));
    if (!data.next) break;
  }
  return all;
}


export async function fetchAllMine(params = {}, maxPages = 10) {
  const all = [];
  for (let page = 1; page <= maxPages; page++) {
    const data = await api.get("/posts/mine/", { ...params, page });
    all.push(...(data.results || []));
    if (!data.next) break;
  }
  return all;
}


export async function fetchAllPages(path, params = {}, maxPages = 10) {
  const all = [];
  for (let page = 1; page <= maxPages; page++) {
    const data = await api.get(path, { ...params, page });
    all.push(...(data.results || []));
    if (!data.next) break;
  }
  return all;
}