import { AppConfig, UserSession, showConnect } from '@stacks/connect'

const appConfig = new AppConfig(['store_write', 'publish_data'])
export const userSession = new UserSession({ appConfig })

export function isConnected() {
  return userSession.isUserSignedIn()
}

export function getUserAddress() {
  if (!userSession.isUserSignedIn()) return null
  const user = userSession.loadUserData()
  return user?.profile?.stxAddress?.mainnet || nul

export function connectWallet() {
  return new Promise((resolve, reject) 
    showConnect(
      appDetail
        name: 'STX Portfolio T
        icon: window.location.origin + '/ic
      }

      redirectTo: '/'
      userSession,

      onFinish: () => {
        const userData = userSession.loadUserData(
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