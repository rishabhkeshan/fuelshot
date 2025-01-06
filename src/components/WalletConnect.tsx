import React, { useEffect, useState } from 'react';
import { Wallet, LogOut } from 'lucide-react';
import {
  useBalance,
  useConnectUI,
  useDisconnect,
  useIsConnected,
  useWallet,
} from "@fuels/react";

function WalletConnect() {
  const [address, setAddress] = useState('');
  const { connect, isConnecting, isConnected } = useConnectUI();
  const { wallet } = useWallet();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (wallet) {
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
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
            <Wallet className="w-4 h-4 mr-2" />
            <span>{address.substring(0, 6)}...{address.substring(address.length - 4)}</span>
          </div>
          <button
            onClick={() => disconnect()}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            title="Disconnect wallet"
          >
            <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      )}
    </div>
  );
}

export default WalletConnect;