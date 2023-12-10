import { fetchColor } from "./fetchAverageColor";
import config from './config';
import data from './icons.json';
import fetch from 'node-fetch';
import fs from 'fs';
import { User } from "detritus-client/lib/structures/user.js";
interface icons {
    [id: string]: Array<{
        averageColor: string;
        date: string;
        hash?: string;
        link?: string;
    }>
}
let icons: icons = data;
async function parse(user: User) {
    let today = new Date();
    let rgb = await fetchColor(`https://d.lu.je/avatar/${user.id}?size=512`);
    let hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
    if (!icons[user.id])
        icons[user.id] = [];

        let r = await fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            body: `https://d.lu.je/avatar/${user.id}?size=512`,
            headers: {
                'Authorization': `Client-ID ${config.imgur.clientID}`,
            },
            redirect: 'follow'
        }).then(response => response.json());
        console.log(r)

    let icon = {
        averageColor: hex,
        date: today.toISOString(),
        hash: user.avatar,
        link: r.data.link
    }

    icons[user.id].push(icon);
    // In the future this will be changed to a database
    fs.writeFile('./icons.json', JSON.stringify(icons, null, 3), 'utf8', () => {
        console.log('Written to file')
    });
}

// ty stackoverflow
function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

export { parse };