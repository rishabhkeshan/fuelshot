import React, { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import {
  useBalance,
  useConnectUI,
  useIsConnected,
  useWallet,
} from "@fuels/react";
function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const { connect, isConnecting } = useConnectUI();
  const { wallet } = useWallet();

  useEffect(() => {
    if (wallet) {
      setIsConnected(true);
      setAddress(wallet.address.toB256());
    }
  }, [wallet]);
  return (
    <div className="mb-6">
      {!isConnected ? (
        <button
          onClick={() => {
            connect();
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Wallet className="w-5 h-5 mr-2" />
          {isConnecting ? "Connecting" : "Connect"}
        </button>
      ) : (
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
          <Wallet className="w-4 h-4" />
          <span>{address.substring(0, 6)}...{address.substring(address.length - 4)}</span>
        </div>
      )}
    </div>
  );
}

export default WalletConnect;