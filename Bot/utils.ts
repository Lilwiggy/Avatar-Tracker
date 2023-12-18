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
            await fetchUser(db, id);
        }
        return user;
};

async function addAvatar(db: IDatabase<{}>, icon: Icon, id: string) {

    // Check if avatar is in DB
    let d = await db.any('SELECT * FROM user_data WHERE user_id = $1 AND hash = $2', [id, icon.hash]);

    if (d.length > 0) return;

    await db.query("INSERT INTO user_data (user_id, url, hash, time_set, average_color) VALUES ($1, $2, $3, $4, $5);", [id, icon.link, icon.hash, icon.date, icon.averageColor]);
    console.log('[DATABASE] Saved avatar');
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