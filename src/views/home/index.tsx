import { FC, useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import pkg from '../../../package.json';
import { SignMessage } from '../../components/SignMessage';
import { getTokenLimitSells } from '../../utils/getLimitOrders';

export const HomeView: FC = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [limitSells, setLimitSells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (wallet.publicKey) {
      console.log("Wallet Public Key:", wallet.publicKey.toBase58());
    } else {
      console.log("Wallet not connected");
    }
  }, [wallet.publicKey]);

  useEffect(() => {
    const fetchLimitOrders = async () => {
      try {
        const decodedSells = await getTokenLimitSells('EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm');
        console.log('Decoded Sells:', decodedSells);
        setLimitSells(decodedSells);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchLimitOrders();
  }, []);

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col justify-center items-center">
        <div className='mt-6'>
          <div className='text-sm font-normal align-bottom text-right text-slate-600 mt-4'></div>
          <h1 className="text-left text-5xl md:pl-0 font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mb-4">
            DEX-Book
          </h1>
        </div>
        <h4 className="md:w-full text-2x1 md:text-4xl text-center text-slate-300 my-2">
          <p>Trading Analytics</p>
          <p className='text-slate-500 text-2x1 leading-relaxed'>on Solana made easy.</p>
        </h4>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-black rounded-lg blur opacity-40 animate-tilt"></div>
          <div className="max-w-[80vw] mx-auto bg-black bg-opacity-90 border-2 border-[#5252529f] p-6 px-10 my-2 overflow-x-auto">
            <h1 className="limit-header">Limit Sells</h1>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="error">Error: {error.message}</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Signer Address</th>
                      <th>Expired At</th>
                      <th>Making Amount</th>
                      <th>Taking Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {limitSells.length === 0 ? (
                      <tr>
                        <td colSpan="4">No limit sells found.</td>
                      </tr>
                    ) : (
                      limitSells.map((sell, index) => (
                        <tr key={index}>
                          <td>{sell.signerAddress}</td>
                          <td>{sell.expiredAt}</td>
                          <td>{sell.makingAmount}</td>
                          <td>{sell.takingAmount}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <h1 className="text-left text-2xl md:pl-0 font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mb-4">
          Sign Message
        </h1>
        <div className="text-center">
          <SignMessage />
        </div>
      </div>
    </div>
  );
};