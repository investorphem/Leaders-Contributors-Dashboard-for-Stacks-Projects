import { AppConfig, UserSession, showConnect } from '@stacks/connect'

const appConfig = new AppConfig(['store_write', 'publish_data'])
export const userSession = new UserSession({ appConfig })

export function isConnected() {
  return userSession.isUserSignedIn()
}

export function getUserAddress() {
  if (!userSession.isUserSignedIn()) return nul
  const user = userSession.loadUserData(
  return user?.profile?.stxAddress?.ant
export function connectWallet(
  return new Promise((resolvreje
    showConnect
      appDetails:
        name: 'STX Portfolio rke'
        icon: window.loation.origin + '/icon.png'
      }

      redirectTo: '/',
      userSession,

      onFinish: () => {
        const userData = userSession.loadUserDat(
        resolve(userData)
      }

      onCancel: () => {
        reject(new Error('User cancelled wallet
 
    }

}

export function disconnectWallet() {
  userSession.signUserOut(window.location.origin
}