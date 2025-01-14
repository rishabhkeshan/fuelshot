import React, { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  Upload,
  AlertCircle,
  X,
} from "lucide-react";
import { Token } from "../types/token";
import type { TransferParams, BytesLike, AbstractAddress } from "fuels";
import { useWallet } from "@fuels/react";
import toast from "react-hot-toast";

interface AirdropNFTFormProps {
  nfts: Token[];
  selectedNFT: Token | null;
  onNFTSelect: (nft: Token) => void;
  fetchingAssets: boolean;
}

interface FailedEntry {
  assetId: BytesLike | undefined;
  destination: string | AbstractAddress;
  batchIndex: number;
}

const toastStyles = {
  success: {
    style: {
      background: "rgb(0, 201, 167)", // fuel-green
      color: "black",
      borderRadius: "6px",
    },
    iconTheme: {
      primary: "black",
      secondary: "rgb(0, 201, 167)",
    },
  },
  error: {
    style: {
      background: "rgb(127, 29, 29)", // dark red background
      color: "rgb(254, 202, 202)", // light red text
      borderRadius: "6px",
    },
    iconTheme: {
      primary: "rgb(254, 202, 202)", // light red icon
      secondary: "rgb(127, 29, 29)", // dark red background
    },
  },
};

function AirdropNFTForm({
  nfts,
  fetchingAssets,
}: AirdropNFTFormProps) {
  const [addresses, setAddresses] = useState<string>("");
  const [recipientCount, setRecipientCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedNFTs, setSelectedNFTs] = useState<Set<string>>(new Set());
  const { wallet } = useWallet();
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [failedEntries, setFailedEntries] = useState<FailedEntry[]>([]);
  const [showFailedEntries, setShowFailedEntries] = useState(false);

  const sortedNFTs = [...nfts].sort((a, b) => {
    if (a.name === "Unknown Asset" && b.name !== "Unknown Asset") return 1;
    if (a.name !== "Unknown Asset" && b.name === "Unknown Asset") return -1;
    return a.name.localeCompare(b.name);
  });

  const handleNFTToggle = (nft: Token) => {
    const newSelected = new Set(selectedNFTs);
    if (newSelected.has(nft.assetId)) {
      newSelected.delete(nft.assetId);
    } else {
      newSelected.add(nft.assetId);
    }
    setSelectedNFTs(newSelected);

    // Split existing addresses into lines and filter out any lines that start with an NFT asset ID
    const addressLines = addresses
      .split("\n")
      .filter((line) => line.trim())
      .filter((line) => {
        const assetId = line.split(",")[0];
        return (
          !Array.from(newSelected).includes(assetId) &&
          !Array.from(selectedNFTs).includes(assetId)
        );
      });

    // Create new lines for selected NFTs
    const selectedNFTsList = Array.from(newSelected).map((id) => `${id},`);

    // Combine selected NFTs with remaining addresses
    setAddresses([...selectedNFTsList, ...addressLines].join("\n"));
    setRecipientCount(addressLines.length);
  };

  const handleTextChange = (value: string) => {
    setAddresses(value);
    const entries = value
      .split("\n")
      .filter((line) => line.trim())
      .filter((line) => !line.startsWith("Selected NFTs:"))
      .map((line) => line.trim());
    setRecipientCount(entries.length);
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;

        // Split into lines and skip the header
        const lines = text
          .split("\n")
          .filter((line) => line.trim())
          .slice(1); // Skip the header row

        if (lines.length === 0) {
          toast.error("The CSV file is empty or invalid", toastStyles.error);
          return;
        }

        // Parse each line into assetId,address format
        const formattedLines = lines.map((line) => {
          const [assetId, address] = line.split(",").map((item) => item.trim());
          if (!assetId || !address) {
            throw new Error(
              "Invalid CSV format. Please use the correct format: AssetID,UserAddress"
            );
          }
          return `${assetId},${address}`;
        });

        // Clear existing data and set new CSV data
        setAddresses(formattedLines.join("\n"));
        setRecipientCount(formattedLines.length);
        setSelectedNFTs(new Set()); // Clear selected NFTs

        toast.success(
          `Successfully loaded ${formattedLines.length} recipients`,
          toastStyles.success
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to parse CSV file. Please check the format.",
          toastStyles.error
        );
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleDownloadSample = () => {
    const sampleData =
      "AssetID,UserAddress\n" +
      "0x0000000000000000000000000000000000000000000000000000000000000000,0x0000000000000000000000000000000000000000000000000000000000000001\n" +
      "0x0000000000000000000000000000000000000000000000000000000000000000,0x0000000000000000000000000000000000000000000000000000000000000002";
    const blob = new Blob([sampleData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_nft_airdrop.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const copyFailedEntriesToClipboard = () => {
    const text = failedEntries
      .map((entry) => `${entry.assetId},${entry.destination}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Failed entries copied to clipboard", toastStyles.success);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setBatchProgress(null);
    setFailedEntries([]); // Reset failed entries
    let hasFailures = false; // Move this outside try block

    try {
      // Parse all transfers
      const allTransfers: TransferParams[] = addresses
        .split("\n")
        .filter((line) => line.trim()) // Remove empty lines
        .map((line) => {
          const [assetId, destination] = line
            .split(",")
            .map((item) => item.trim());
          return {
            amount: 1,
            assetId,
            destination,
          };
        });

      if (!wallet) {
        toast.error("Please connect your wallet first", toastStyles.error);
        return;
      }

      if (allTransfers.length === 0) {
        toast.error("Please add at least one recipient", toastStyles.error);
        return;
      }

      // Batch transfers into groups of 180
      const batchSize = 180;
      const batches = [];
      for (let i = 0; i < allTransfers.length; i += batchSize) {
        batches.push(allTransfers.slice(i, i + batchSize));
      }

      setBatchProgress({ current: 0, total: batches.length });

      // Process each batch
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        setBatchProgress({ current: i + 1, total: batches.length });

        try {
          if (batches.length > 1) {
            toast.loading(`Processing batch ${i + 1} of ${batches.length}...`, {
              id: "nft-batch",
            });
          }

          const tx = await wallet.batchTransfer(batch);
          await tx.wait();
          console.log(`Batch ${i + 1}/${batches.length} completed:`, tx);

          if (batches.length > 1) {
            toast.success(
              `Batch ${i + 1} of ${batches.length} completed successfully`,
              { ...toastStyles.success, id: "nft-batch" }
            );
          }
        } catch (error) {
          hasFailures = true;
          // Add failed entries from this batch
          const failedBatchEntries: FailedEntry[] = batch.map((transfer) => ({
            assetId: transfer.assetId,
            destination: transfer.destination,
            batchIndex: i + 1,
          }));
          setFailedEntries((prev) => [...prev, ...failedBatchEntries]);

          console.error(`Batch ${i + 1} failed:`, error);
          toast.error(`Batch ${i + 1} failed. These entries have been saved.`, {
            ...toastStyles.error,
            id: "nft-batch",
          });
        }
      }

      if (!hasFailures) {
        // Show success toast only
        toast.success(
          `Successfully airdropped NFTs to ${allTransfers.length} recipients!`,
          { ...toastStyles.success, id: "nft-airdrop" }
        );
      }
    } catch (error) {
      hasFailures = true;
      console.error("Error processing transfers:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to process NFT airdrop. Please try again.",
        { ...toastStyles.error, id: "nft-airdrop" }
      );
    } finally {
      setIsProcessing(false);
      setBatchProgress(null);

      // Only clear form if there were no failures
      if (!hasFailures) {
        setAddresses("");
        setSelectedNFTs(new Set());
        setRecipientCount(0);
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        NFT Airdrop
      </h2>

      {/* NFT Selection Area */}
      <div className="space-y-6">
        <div className="space-y-4">
          {fetchingAssets ? (
            <div className="text-center p-8 border-2 border-dashed border-gray-300 dark:border-fuel-dark-600 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">
                Fetching assets...
              </p>
            </div>
          ) : sortedNFTs.length === 0 ? (
            <div className="text-center p-8 border-2 border-dashed border-gray-300 dark:border-fuel-dark-600 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">
                No NFTs found in your wallet
              </p>
            </div>
          ) : (
            <>
              <div className="px-4 py-2">
                <div className="flex items-center">
                  <div className="w-10 flex items-center justify-center mr-2"></div>
                  <div className="flex-1 grid grid-cols-12 gap-4">
                    <div className="col-span-3 text-sm text-gray-500 dark:text-gray-400 truncate">
                      Asset ID
                    </div>
                    <div className="col-span-3 text-sm text-gray-500 dark:text-gray-400 truncate -ml-1.5">
                      Symbol
                    </div>
                    <div className="col-span-6 text-sm text-gray-500 dark:text-gray-400 truncate -ml-1.5">
                      Name
                    </div>
                  </div>
                </div>
              </div>
              <div className="max-h-[220px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
                <div className="grid gap-4">
                  {sortedNFTs.map((nft) => (
                    <div
                      key={nft.assetId}
                      className={`p-4 border rounded-lg ${
                        selectedNFTs.has(nft.assetId)
                          ? "border-fuel-green bg-fuel-green/5 dark:bg-fuel-green/10"
                          : "border-gray-200 dark:border-fuel-dark-600"
                      } hover:border-fuel-green dark:text-white`}
                    >
                      <div className="flex items-center">
                        <div className="w-10 flex items-center justify-center mr-2">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={selectedNFTs.has(nft.assetId)}
                              onChange={() => handleNFTToggle(nft)}
                              className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-md checked:border-fuel-green dark:checked:border-fuel-green checked:bg-fuel-green dark:checked:bg-fuel-green cursor-pointer transition-all duration-200"
                            />
                            <svg
                              className="absolute w-5 h-5 pointer-events-none opacity-0 peer-checked:opacity-100 text-black dark:text-black top-0 left-0"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 grid grid-cols-12 gap-4">
                          <div className="col-span-3 text-sm text-gray-500 dark:text-gray-400 truncate">
                            {nft.assetId.substring(0, 6)}...
                            {nft.assetId.substring(nft.assetId.length - 4)}
                          </div>
                          <div className="col-span-3 font-medium truncate">
                            {nft.symbol}
                          </div>
                          <div className="col-span-6 text-sm text-gray-500 dark:text-gray-400 truncate">
                            {nft.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Selected NFTs: {selectedNFTs.size}
              </h3>
            </>
          )}
        </div>
      </div>

      {/* Recipients Form Area - Always visible */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recipients{" "}
              <span className="text-fuel-green">({recipientCount})</span>
            </h3>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDownloadSample}
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-fuel-green rounded-md text-sm font-medium text-black dark:text-fuel-green bg-fuel-green dark:bg-transparent hover:bg-fuel-green/90 dark:hover:bg-fuel-green/10"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Sample
            </button>
            <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-fuel-green rounded-md text-sm font-medium text-black dark:text-fuel-green bg-fuel-green dark:bg-transparent hover:bg-fuel-green/90 dark:hover:bg-fuel-green/10">
              <FileSpreadsheet className="w-5 h-5 mr-2" />
              Upload CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div>
          <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
            Format: AssetID, User Address
          </p>
          <textarea
            rows={10}
            className="w-full px-4 py-2 border border-gray-300 dark:border-fuel-dark-600 rounded-md focus:ring-fuel-green focus:border-fuel-green font-mono text-xs bg-white dark:bg-fuel-dark-700 text-gray-900 dark:text-white outline-none"
            placeholder="assetId,address&#10;assetId,address&#10;...&#10;&#10;Example:&#10;0x1234...5678,0x8765...4321&#10;0x9876...5432,0x5432...1234"
            value={addresses}
            onChange={(e) => handleTextChange(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-black dark:text-fuel-green bg-fuel-green dark:bg-transparent dark:border-fuel-green hover:bg-fuel-green/90 dark:hover:bg-fuel-green/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              Processing...{" "}
              {batchProgress
                ? `(Batch ${batchProgress.current}/${batchProgress.total})`
                : ""}
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" />
              Start NFT Airdrop
            </>
          )}
        </button>

        {failedEntries.length > 0 && (
          <div className="mt-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Failed Transactions
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFailedEntries(!showFailedEntries)}
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                >
                  {showFailedEntries ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <span className="text-sm">Show Details</span>
                  )}
                </button>
              </div>

              {showFailedEntries && (
                <div className="mt-4">
                  <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                    {failedEntries.length} transactions failed. Click below to
                    copy the addresses and amounts to try again.
                  </p>
                  <button
                    type="button"
                    onClick={copyFailedEntriesToClipboard}
                    className="inline-flex items-center px-3 py-1.5 border border-red-300 dark:border-red-700 shadow-sm text-xs font-medium rounded text-red-700 dark:text-red-200 bg-white dark:bg-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/50"
                  >
                    Copy Failed Entries
                  </button>
                  <div className="mt-2">
                    <textarea
                      readOnly
                      rows={5}
                      className="w-full px-3 py-2 text-xs font-mono border border-red-200 dark:border-red-800 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                      value={failedEntries
                        .map((entry) => `${entry.assetId},${entry.destination}`)
                        .join("\n")}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default AirdropNFTForm;
