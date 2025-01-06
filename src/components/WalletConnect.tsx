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
          className="inline-flex items-center px-4 py-2 border border-fuel-green rounded-md shadow-sm text-sm font-medium text-black dark:text-fuel-green bg-fuel-green dark:bg-transparent hover:bg-fuel-green/90 dark:hover:bg-fuel-green/10"
        >
          <Wallet className="w-5 h-5 mr-2" />
          {isConnecting ? "Connecting" : "Connect"}
        </button>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-fuel-green">
            <Wallet className="w-4 h-4 mr-2" />
            <span>
              {address.substring(0, 6)}...
              {address.substring(address.length - 4)}
            </span>
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