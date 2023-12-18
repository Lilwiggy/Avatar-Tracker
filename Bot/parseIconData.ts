import { fetchColor } from "./fetchAverageColor";
import config from './config';
import data from './icons.json';
import fetch from 'node-fetch';
import { IDatabase } from "pg-promise";
import { User } from "detritus-client/lib/structures/user.js";
import { Icons, Icon, addAvatar } from './utils';

let icons: Icons = data;
async function parse(db: IDatabase<{}>, user: User) {
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

    let icon: Icon = {
        averageColor: hex,
        date: today.toISOString(),
        hash: user.avatar,
        link: r.data.link
    }

    icons[user.id].push(icon);
    await addAvatar(db, icon, user.id);
}

// ty stackoverflow
function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

export { parse };