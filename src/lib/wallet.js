import { AppConfig, UserSession, showConnect } from '@stacks/connect'

const appConfig = new AppConfig(['store_write', 'publish_data'])
export const userSession = new UserSession({ appConfig })

export function isConnected() {
  return userSession.isUserSignedIn()
}

export function getUserAddress() {
  if (!userSession.isUserSignedIn()) return null
  const user = userSession.loadUserData()
  return user?.profile?.stxAddress?.mainnet || null
}

export function connectWallet() {
  return new Promise((resolve, reject) => {
    showConnect({
      appDetails: {
        name: 'STX Portfolio Tracker',
        icon: window.location.origin + '/icon.png'
      },

      redirectTo: '/',
      userSession,

      onFinish: () => {
        const userData = userSession.loadUserData()
        resolve(userData)
      },

      onCancel: () => {
        reject(new Error('User cancelled wallet connection'))
      }
    })
  })
}

export function disconnectWallet() {
  userSession.signUserOut(window.location.origin)
}