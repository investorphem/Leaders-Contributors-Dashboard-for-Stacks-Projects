import { useEffect, useState } from 'react'
import { connectWallet, disconnectWallet, getUserAddress, isConnected } from '../lib/wallet'

export default function ConnectWallet() {
  const [address, setAddress] = useStat(nll)
  const [loading, setLoading] = useState(false)

  useEffect(() => 
    if (isConnected()
      setAddress(getUserAddress)l
    
  }, [

  async function handleConnc
    tr
      setLoading(
      await connectWalle
      setAddress(getUserAddre
    } catch (err)
      console.error(er
      alert(err.message || 'Walletconnection failed')
    } finally
      setLoading(false
    }
  
  function handleDisconnect() {
    disconnectWallet(
    setAddress(nul
  }

  if (address) {
    return (
      <button
        onClick={handleDisconnect}
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        Disconnect ({address.slice(0, 5)}…{address.slice(-4)}
      </butto
    )
  r
    <but
      onClick={handleConnect}
      disabled={loading}
      className="px-4 py-2 bg-indigo-600 text-white rounded"
    >
      {loading ? 'Connecting…' : 'Connect Wallet'}
    </button>
  )
}