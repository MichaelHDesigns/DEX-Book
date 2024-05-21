import Link from "next/link";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { useAutoConnect } from "../contexts/AutoConnectProvider";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import Image from "next/image";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export const AppBar: React.FC = () => {
  const { autoConnect, setAutoConnect } = useAutoConnect();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const wallet = useWallet();
  const { connection } = useConnection();

  useEffect(() => {
    if (wallet.publicKey) {
      // Logic related to useUserSOLBalanceStore removed
    }
  }, [wallet.publicKey, connection]);

  return (
    <div>
      {/* NavBar / Header */}
      <div className="navbar flex h-20 flex-row md:mb-2 shadow-lg bg-[#111112] text-neutral-content border-b border-zinc-800 bg-opacity-66">
        <div className="navbar-start align-items-center">
          <div className="hidden sm:inline w-22 h-22 md:p-2 ml-10">
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              passHref
              className="text-secondary hover:text-white flex items-center"
            >
              <Image
                src="/solanaLogo.png"
                alt="solana icon"
                width={156}
                height={96}
              />
              <div className="text-purple-600 text-xl">Dex-Book</div>
            </Link>
          </div>
          <WalletMultiButtonDynamic className="btn-ghost btn-sm relative flex md:hidden text-lg " />
        </div>

        {/* Nav Links */}
        {/* Wallet & Settings */}
        <div className="navbar-end">
          {wallet && (
            <div className="hidden md:inline-flex align-items-center justify-items gap-6">
              <WalletMultiButtonDynamic className="btn-ghost btn-sm rounded-btn text-lg mr-6 " />
            </div>
          )}

          <label
            htmlFor="my-drawer"
            className="btn-gh items-center justify-between md:hidden mr-6"
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            <div
              className={`absolute block h-0.5 w-8 animate-pulse bg-purple-600 ${
                isNavOpen ? "" : "hidden"
              }`}
              style={{ transform: "rotate(45deg)" }}
            ></div>
            <div
              className={`absolute block h-0.5 w-8 animate-pulse bg-purple-600 ${
                isNavOpen ? "" : "hidden"
              }`}
              style={{ transform: "rotate(135deg)" }}
            ></div>
          </label>
        </div>
      </div>
    </div>
  );
};