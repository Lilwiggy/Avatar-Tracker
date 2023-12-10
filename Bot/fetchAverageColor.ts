import ColorThief from "colorthief";
async function fetchColor(url) {
    return await ColorThief.getColor(url);
}

export { fetchColor }