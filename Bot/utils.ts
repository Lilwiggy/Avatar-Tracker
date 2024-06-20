import { IDatabase } from "pg-promise";
import config from "./config";
import { User } from "detritus-client/lib/structures";
import { fetchColor } from "./fetchAverageColor";

declare module 'detritus-client/lib/structures/user' {
    interface User {
      cached: boolean;
      track: boolean;
    }
  }

// ty stackoverflow
function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

let RETURN_CODES = {
    ALREADY_IN_DB: 0,
    DATABASE_SUCCEED: 1,
    IMGUR_FAILED: 2,
}

interface Icon {
    averageColor: string;
    date: string;
    hash?: string;
    link?: string;
}

async function fetchUser(db: IDatabase<{}>, id: string) {
        let user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', id); // If User is not in DB do not add, this function will be called on all UserUpdates and I do not want to save everyone the bot sees
        return user;
};

async function addAvatar(db: IDatabase<{}>, user: User): Promise<number> {
    console.log(config.imgur.clientID)
    let hash: string = '';
    let today = new Date();
    let rgb = await fetchColor(user.avatarUrl);
    let hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
    // Sometimes icon will be null if user is not cached.
    if (user.avatar === null || user.avatar === 'null')
        hash = user.avatarUrl.split(user.id + '/')[1].split('.')[0]; // Grab hash manually from discord's CDN eg. https://cdn.discordapp.com/avatars/USER_ID/HASH.png
    else
        hash = user.avatar;

            // Check if avatar is in DB
    let d = await db.oneOrNone('SELECT * FROM user_data WHERE user_id = $1 AND hash = $2', [user.id, hash]);

    if (d) return RETURN_CODES.ALREADY_IN_DB;

    let image = await fetch(`https://d.lu.je/avatar/${user.id}?size=512`);
    let r = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        body: await image.blob(),
        headers: {
            'Authorization': `Client-ID ${config.imgur.clientID}`,
        },
        redirect: 'follow'
    }).then(response => response.json());

    if (r.status === 200) {
            let icon: Icon = {
                averageColor: hex,
                date: today.toISOString(),
                hash: user.avatar,
                link: r.data.link
            }
            await db.query("INSERT INTO user_data (user_id, url, hash, time_set, average_color) VALUES ($1, $2, $3, $4, $5);", [user.id, icon.link, hash, icon.date, icon.averageColor]);
            console.log('[DATABASE] Saved avatar', icon);
            return RETURN_CODES.DATABASE_SUCCEED;
        } else {
            user.client.rest.createMessage('1253207583120949331', `New Error: \`\`\`json\n ${JSON.stringify(r)} \`\`\` `);
            return RETURN_CODES.IMGUR_FAILED;
        }
}


export { fetchUser, addAvatar, RETURN_CODES };