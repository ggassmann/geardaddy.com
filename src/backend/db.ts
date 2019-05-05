import low, { LowdbAsync } from 'lowdb';
import FileAsync from 'lowdb/adapters/FileAsync';
import os from 'os';
import path from 'path';

export const itemsdb: Promise<LowdbAsync<any>> = low(new FileAsync(path.resolve(__dirname, 'items.json')));
export const settingsdb: Promise<LowdbAsync<any>> = low(new FileAsync(path.resolve(__dirname, 'settings.json')));
export const querydb: Promise<LowdbAsync<any>> = low(new FileAsync(path.resolve(__dirname, 'queries.json')));

(async () => {
  (await querydb).defaults({
    queries: {},
  });
  (await itemsdb).defaults({
    nextChangeId: undefined,
    totalStashesProcessed: 0,
    items: [],
  }).write();
  (await settingsdb).defaults({
    server: {
      port: 42069,
    },
    solr: {
      port: 8983
    },
    filesystem: {
      pathofbuilding: {
        lua_path: 'C:\\ProgramData\\Path of Building',
        builds_path: `C:\\Users\\${os.userInfo().username}\\Documents\\Path of Building\\Builds`,
      },
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
