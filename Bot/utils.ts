import { IDatabase } from "pg-promise";

declare module 'detritus-client/lib/structures/user' {
    interface User {
      cached: boolean;
      track: boolean;
    }
  }

async function fetchUser(db: IDatabase<{}>, id: string) {
        let user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', id);
        if (!user) {
            await db.query('INSERT INTO users (id, track) VALUES ($1, true)', id);
            user = await fetchUser(db, id);
        }
        return user;
};

async function addAvatar(db: IDatabase<{}>, icon: Icon, id: string) {
    let hash: string = '';
    // Sometimes icon will be null if user is not cached.
    if (icon.hash === null || icon.hash === 'null')
        hash = icon.link.split(id + '/')[1].split('.')[0]; // Grab hash manually from discord's CDN eg. https://cdn.discordapp.com/avatars/USER_ID/HASH.png
    else
        hash = icon.hash;

    // Check if avatar is in DB
    let d = await db.oneOrNone('SELECT * FROM user_data WHERE user_id = $1 AND hash = $2', [id, hash]);

    if (d) return;

    await db.query("INSERT INTO user_data (user_id, url, hash, time_set, average_color) VALUES ($1, $2, $3, $4, $5);", [id, icon.link, hash, icon.date, icon.averageColor]);
    console.log('[DATABASE] Saved avatar', icon);
}

interface Icon {
    averageColor: string;
    date: string;
    hash?: string;
    link?: string;
}

interface Icons {
    [id: string]: Array<Icon>
};


export { Icon, Icons, fetchUser, addAvatar };