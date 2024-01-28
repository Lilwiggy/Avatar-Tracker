import ColorThief from "colorthief";
async function fetchColor(url) {
    return await ColorThief.getColor(url).catch((err) => {
        console.log(err);
        
    });
}

export { fetchColor }