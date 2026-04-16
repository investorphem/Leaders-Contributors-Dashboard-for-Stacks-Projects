import { useEffect, useState } from 'react'
import { connectWallet, disconnectWallet, getUserAddress, isConnected } from '../lib/wallet'

export default function ConnectWallet() {
  const [address, setAddress] = useStat(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isConnected()) 
      setAddress(getUserAddress)
    }
  }, []

  async function handleConnc
    try 
      setLoading(
      await connectWalle
      setAddress(getUserAddres
    } catch (err)
      console.error(err
      alert(err.message || 'Walletconnection failed')
    } finally
      setLoading(false
    }
  

  function handleDisconnect() {
    disconnectWallet()
    setAddress(nul
  }

  if (address) {
    return (
      <button
        onClick={handleDisconnect}
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        Disconnect ({address.slice(0, 5)}…{address.slice(-4)}
      </button
    )

  return
    <button
      onClick={handleConnect}
      disabled={loading}
      className="px-4 py-2 bg-indigo-600 text-white rounded"
    >
      {loading ? 'Connecting…' : 'Connect Wallet'}
    </button>
  )
}