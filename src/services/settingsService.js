import { SettingsRepository } from '@/storage/repositories/settings-repository';

export const SettingsService = {
  async getSetting(key) {
    return SettingsRepository.getSetting(key);
  },

  async setSetting(key, value) {
    return SettingsRepository.setSetting(key, value);
  },
};
