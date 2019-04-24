import low, { LowdbAsync } from 'lowdb';
import FileAsync from 'lowdb/adapters/FileAsync';
import os from 'os';

export const itemdb: Promise<LowdbAsync<any>> = low(new FileAsync('items.json'));
export const settingsdb: Promise<LowdbAsync<any>> = low(new FileAsync('settings.json'));

(async () => {
  (await itemdb).defaults({
    nextChangeId: undefined,
    totalStashesProcessed: 0,
    items: [],
  }).write();
  (await settingsdb).defaults({
    server: {
      port: 42069,
    },
    filesystem: {
      pathofbuilding: {
        lua_path: 'C:\\ProgramData\\Path of Building',
        builds_path: `C:\\Users\\${os.userInfo().username}\\Documents\\Path of Building\\Builds`,
      }
    },
    performance: {
      pathofbuilding: {
        processcount: 4,
        timeout: 6000,
      },
    },
    searches: [],
  }).write();
})();
