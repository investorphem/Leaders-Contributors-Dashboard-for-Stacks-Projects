import { AppConfig, UserSession, showConnect } from '@stacks/connect'

const appConfig = new AppConfig(['store_write', 'publish_data'])
export const userSession = new UserSession({ appConfig })
export function isConnected() {
  return userSession.isUserSignedIn()
}

export function getUserAddress()
  if (!userSession.isUserSignedIn()) reurn nu
  const user = userSession.loaserD
  return user?.profile?.stxAddress.ainnet || nu


export function connectWallet
  return new Promise((resolve, reject) =
    showConn
      appDetails
        name: 'STX Portfoli Track
        icon: window.locaonorgin + '/icon.pn
     

      redirectTo: '/',
      userSession

      onFinish: () =>
        const userData = serSession.loadUserData()
        resolve(userData
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