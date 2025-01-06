import React, { useState, useEffect } from "react";
import { Coins } from "lucide-react";
import {
  useBalance,
  useConnectUI,
  useIsConnected,
  useWallet,
} from "@fuels/react";
import { getAssetFuel, assets } from "fuels";

interface Token {
  assetId: string;
  symbol: string;
  balance: string;
  name: string;
  isNFT: boolean;
  decimals: number;
}

interface TokenSelectorProps {
  selectedToken: Token | null;
  onTokenSelect: (token: Token) => void;
}

const formatBalance = (balance: string): string => {
  // Convert string to number
  const num = parseFloat(balance);
  
  // Format with commas for thousands separators
  // and limit to 6 decimal places
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6
  }).format(num);
};

function TokenSelector({ selectedToken, onTokenSelect }: TokenSelectorProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [customAssetId, setCustomAssetId] = useState("");
  const { wallet } = useWallet();
  const [showUnknownAssets, setShowUnknownAssets] = useState(false);
  const [unknownTokens, setUnknownTokens] = useState<Token[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchTokens = async () => {
      if (!wallet) return;

      try {
        const balances = await wallet.getBalances();
        const newTokens: Token[] = [];
        const newUnknownTokens: Token[] = [];

        await Promise.all(
          balances.balances.map(async (balance) => {
            const apiUrl =
              wallet.provider.getChainId() === 0
                ? `https://explorer-indexer-testnet.fuel.network/assets/${balance.assetId}`
                : `https://mainnet-explorer.fuel.network/assets/${balance.assetId}`;

            const response = await fetch(apiUrl);
            const metadata = await response.json();

            if (!metadata.name) {
              newUnknownTokens.push({
                assetId: balance.assetId,
                symbol: metadata.symbol || "Unknown",
                balance: balance.amount.toString(),
                name: "Unknown Asset",
                isNFT: metadata.isNFT || false,
                decimals: metadata.decimals || 0,
              });
            } else {
              newTokens.push({
                assetId: balance.assetId,
                symbol: metadata.symbol || "Token",
                name: metadata.name || "Unnamed Asset",
                isNFT: metadata.isNFT || false,
                balance: balance.amount.format({units: metadata.decimals}).toString(),
                decimals: metadata.decimals || 0,
              });
            }
          })
        );

        // Only update state if the component is still mounted
        if (mounted) {
          setTokens(newTokens);
          setUnknownTokens(newUnknownTokens);
        }
      } catch (error) {
        console.error('Error fetching tokens:', error);
      }
    };

    setTokens([]);
    setUnknownTokens([]);
    fetchTokens();

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      mounted = false;
    };
  }, [wallet]);

  const handleCustomAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAssetId) {
      onTokenSelect({
        assetId: customAssetId,
        symbol: "Custom Token",
        balance: "0",
        name: "Custom Token",
        isNFT: false,
        decimals: 0,
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        Select Token
      </h3>

      <div className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
        <div className="w-10">{/* Empty space for icon alignment */}</div>

        <div className="grid grid-cols-12 gap-4 w-full items-center">
          {/* Asset ID - 2 columns */}
          <div className="col-span-2 truncate">Asset ID</div>

          {/* Symbol - 2 columns */}
          <div className="col-span-2 truncate">Symbol</div>

          {/* Name - 3 columns */}
          <div className="col-span-3 truncate">Name</div>

          {/* Type - 1 column */}
          <div className="col-span-1">Type</div>

          {/* Balance - 4 columns */}
          <div className="col-span-4 text-right">Balance</div>
        </div>
      </div>

      <div className="grid gap-4">
        {tokens.map((token) => (
          <button
            key={token.assetId}
            onClick={() => onTokenSelect(token)}
            className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${
              selectedToken?.assetId === token.assetId
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50"
                : "border-gray-200 dark:border-gray-700"
            } dark:text-white w-full`}
          >
            <div className="flex items-center w-full">
              <div className="w-10">
                <Coins className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>

              <div className="grid grid-cols-12 gap-4 w-full items-center">
                {/* Asset ID - 2 columns */}
                <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400 truncate">
                  {token.assetId.substring(0, 6)}...
                  {token.assetId.substring(token.assetId.length - 4)}
                </div>

                {/* Symbol - 2 columns */}
                <div className="col-span-2 font-medium truncate">
                  {token.symbol}
                </div>

                {/* Name - 3 columns */}
                <div className="col-span-3 text-sm text-gray-500 dark:text-gray-400 truncate">
                  {token.name}
                </div>

                {/* NFT Badge - 1 column */}
                <div className="col-span-1">
                  {token.isNFT && (
                    <span className="inline-block bg-yellow-200 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      NFT
                    </span>
                  )}
                  {!token.isNFT && (
                    <span className="inline-block bg-green-200 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Token
                    </span>
                  )}
                </div>

                {/* Balance - 4 columns */}
                <div
                  className="col-span-4 font-medium text-right truncate"
                  title={token.balance}
                >
                  {token.balance}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowUnknownAssets(!showUnknownAssets)}
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        {showUnknownAssets ? "Hide Unknown Assets" : "Show Unknown Assets"}
      </button>

      {showUnknownAssets && (
        <div className="grid gap-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Unknown Assets
          </h4>
          {unknownTokens.length > 0 ? (
            unknownTokens.map((token) => (
              <button
                key={token.assetId}
                onClick={() => onTokenSelect(token)}
                className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  selectedToken?.assetId === token.assetId
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50"
                    : "border-gray-200 dark:border-gray-700"
                } dark:text-white w-full`}
              >
                <div className="flex items-center w-full">
                  <div className="w-10">
                    <Coins className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>

                  <div className="grid grid-cols-12 gap-4 w-full items-center">
                    {/* Asset ID - 2 columns */}
                    <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400 truncate">
                      {token.assetId.substring(0, 6)}...
                      {token.assetId.substring(token.assetId.length - 4)}
                    </div>

                    {/* Symbol - 2 columns */}
                    <div className="col-span-2 font-medium truncate">
                      {token.symbol}
                    </div>

                    {/* Name - 3 columns */}
                    <div className="col-span-3 text-sm text-gray-500 dark:text-gray-400 truncate">
                      {token.name}
                    </div>

                    {/* NFT Badge - 1 column */}
                    <div className="col-span-1">
                      {token.isNFT && (
                        <span className="inline-block bg-yellow-200 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          NFT
                        </span>
                      )}
                      {!token.isNFT && (
                        <span className="inline-block bg-green-200 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Token
                        </span>
                      )}
                    </div>

                    {/* Balance - 4 columns */}
                    <div
                      className="col-span-4 font-medium text-right truncate"
                      title={token.balance}
                    >
                      {token.balance}
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <p>No unknown assets found.</p>
          )}
        </div>
      )}

      {/* <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleCustomAssetSubmit}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Custom Asset ID
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              value={customAssetId}
              onChange={(e) => setCustomAssetId(e.target.value)}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter asset ID"
            />
            <button
              type="submit"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>
      </div> */}
    </div>
  );
}

export default TokenSelector;
