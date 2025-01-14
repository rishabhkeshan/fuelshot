import React from "react";
import { Coins } from "lucide-react";
// import { useWallet } from "@fuels/react";
import { Token } from "../types/token"; // We'll create this type file

interface TokenSelectorProps {
  selectedToken: Token | null;
  onTokenSelect: (token: Token) => void;
  tokens: Token[];
  unknownTokens: Token[];
  showUnknownAssets: boolean;
  setShowUnknownAssets: (show: boolean) => void;
}

function TokenSelector({ 
  selectedToken, 
  onTokenSelect, 
  tokens, 
  unknownTokens, 
  showUnknownAssets, 
  setShowUnknownAssets 
}: TokenSelectorProps) {
  // const { wallet } = useWallet();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        Select Token
      </h3>

      <div className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
        <div className="w-10">{/* Empty space for icon alignment */}</div>
        <div className="grid grid-cols-12 gap-4 w-full items-center">
          <div className="col-span-2 truncate text-center">Asset ID</div>
          <div className="col-span-2 truncate text-center">Symbol</div>
          <div className="col-span-3 truncate text-center">Name</div>
          <div className="col-span-1 text-center">Type</div>
          <div className="col-span-4 text-right">Balance</div>
        </div>
      </div>

      <div className="grid gap-4">
        {tokens.map((token) => (
          <button
            key={token.assetId}
            onClick={() => onTokenSelect(token)}
            className={`flex items-center justify-between p-4 border rounded-lg ${
              selectedToken?.assetId === token.assetId
                ? "border-fuel-green bg-fuel-green/5 dark:bg-fuel-green/10"
                : "border-gray-200 dark:border-fuel-dark-600"
            } hover:border-fuel-green dark:text-white`}
          >
            <div className="flex items-center w-full">
              <div className="w-10">
                <Coins className="w-5 h-5 text-gray-400 dark:text-fuel-green" />
              </div>

              <div className="grid grid-cols-12 gap-4 w-full items-center">
                <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400 truncate">
                  {token.assetId.substring(0, 6)}...
                  {token.assetId.substring(token.assetId.length - 4)}
                </div>
                <div className="col-span-2 font-medium truncate">
                  {token.symbol}
                </div>
                <div className="col-span-3 text-sm text-gray-500 dark:text-gray-400 truncate">
                  {token.name}
                </div>
                <div className="col-span-1">
                  {token.isNFT ? (
                    <span className="inline-block bg-yellow-200 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      NFT
                    </span>
                  ) : (
                    <span className="inline-block bg-green-200 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Token
                    </span>
                  )}
                </div>
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
        className="cursor-pointer mt-4 inline-flex items-center px-4 py-2 border border-fuel-green rounded-md text-sm font-medium text-black dark:text-fuel-green bg-fuel-green dark:bg-transparent hover:bg-fuel-green/90 dark:hover:bg-fuel-green/10"
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
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  selectedToken?.assetId === token.assetId
                    ? "border-fuel-green bg-fuel-green/5 dark:bg-fuel-green/10"
                    : "border-gray-200 dark:border-fuel-dark-600"
                } hover:border-fuel-green dark:text-white`}
              >
                <div className="flex items-center w-full">
                  <div className="w-10">
                    <Coins className="w-5 h-5 text-gray-400 dark:text-fuel-green" />
                  </div>

                  <div className="grid grid-cols-12 gap-4 w-full items-center">
                    <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400 truncate">
                      {token.assetId.substring(0, 6)}...
                      {token.assetId.substring(token.assetId.length - 4)}
                    </div>
                    <div className="col-span-2 font-medium truncate">
                      {token.symbol}
                    </div>
                    <div className="col-span-3 text-sm text-gray-500 dark:text-gray-400 truncate">
                      {token.name}
                    </div>
                    <div className="col-span-1">
                      {token.isNFT ? (
                        <span className="inline-block bg-yellow-200 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          NFT
                        </span>
                      ) : (
                        <span className="inline-block bg-green-200 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Token
                        </span>
                      )}
                    </div>
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
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No unknown assets found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default TokenSelector;
