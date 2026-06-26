import { db } from '@/storage/db/dexie';

export const SettingsRepository = {
  async getSetting(key) {
    const setting = await db.settings.get(key);
    return setting?.value ?? null;
  },

  async setSetting(key, value) {
    await db.settings.put({ key, value });
  },

  async deleteSetting(key) {
    await db.settings.delete(key);
  },
};
