import low, { LowdbAsync } from 'lowdb';
import FileAsync from 'lowdb/adapters/FileAsync';

const adapter = new FileAsync('db.json');
export const db: Promise<LowdbAsync<any>> = low(adapter);

(async () => {
  (await db).defaults({
    items: [],
    nextChangeId: undefined,
  }).write();
})();
