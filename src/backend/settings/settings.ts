export const settingListeners: {path: string, func: (value: any) => Promise<{success: boolean, message?: string, error?: Error}>}[] = [];
export const addSettingListener = (path: string, func: (value: any) => Promise<{success: boolean, message?: string, error?: Error}>) => {
  settingListeners.push({
    path, func
  });
}