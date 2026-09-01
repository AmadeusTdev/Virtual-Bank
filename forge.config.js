module.exports = {
  packagerConfig: {
    asar: true,
    icon: './assets/icon'
  },

  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'vbankmonitor',
        setupExe: 'VBankMonitor-1.0.0-Setup.exe'
      }
    }
  ]
};