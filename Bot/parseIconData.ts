import { fetchColor } from "./fetchAverageColor";
import config from './config';
import fetch from 'node-fetch';
import { IDatabase } from "pg-promise";
import { User } from "detritus-client/lib/structures/user.js";
import { Icon, addAvatar } from './utils';

async function parse(db: IDatabase<{}>, user: User) {
    let today = new Date();
    let rgb = await fetchColor(user.avatarUrl);
    let hex = rgbToHex(rgb[0], rgb[1], rgb[2]);

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

    await addAvatar(db, icon, user.id);
}

// ty stackoverflow
function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

export { parse };