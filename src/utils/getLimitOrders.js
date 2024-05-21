import * as solanaWeb3 from '@solana/web3.js';
import bs58 from 'bs58';

const JUPITER_LIMIT_ORDER_PROGRAM = 'jupoNjAxXgZ4rjzxzPMP4oxduvQsQtZzyknqvzYNrNu';

const connection = new solanaWeb3.Connection("https://quiet-thrilling-bush.solana-mainnet.quiknode.pro/517007fa157e2a1a8f992d28a500588227d9d6f2/", 'confirmed');

const txLimit = 100;
const delayTime = 250;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getTokenLimitSells(mintAddress) {
    let signatures = await connection.getSignaturesForAddress(
        new solanaWeb3.PublicKey(mintAddress),
        { limit: txLimit }
    );
    
    let limitOrderSignatures = [];

    for (let i = 0; i < signatures.length; i++) {
        try {
            let recentTransaction;
            recentTransaction = await connection.getParsedTransaction(signatures[i].signature, {
                commitment: 'confirmed',
                maxSupportedTransactionVersion: 0
            });
            console.log('Recent Transaction:', recentTransaction);
            try {
                if (recentTransaction && recentTransaction.meta && recentTransaction.meta.logMessages && recentTransaction.meta.logMessages[0].startsWith('Program ' + JUPITER_LIMIT_ORDER_PROGRAM)) {
                    console.log('Limit Order Found');
                    limitOrderSignatures.push(recentTransaction);
                }
            } catch {
                console.error("Not a Jupiter Limit Order");
            }
        } catch (error) {
            console.error("Couldn't retrieve transaction:", error);
        }
        
        await delay(delayTime);
    } 

    const decodedSells = await decodeTransactionDetails(limitOrderSignatures);
    return decodedSells;
}

async function decodeTransactionDetails(transactions) {
    let decodedSells = [];
    for (let transaction of transactions) {
        if (transaction && transaction.transaction) {
            console.log('Transaction:', transaction);
            const signerAddress = transaction.transaction.message.accountKeys[0].pubkey.toString();
            console.log('Signer Address:', signerAddress);
            const instruction = transaction.transaction.message.instructions[0];
            if (instruction && instruction.data) {
                const data = bs58.decode(instruction.data);
                console.log('Data:', data);
                const dataView = new DataView(data.buffer, data.byteOffset, data.byteLength);
                console.log('DataView:', dataView);

                let expiredAt;

                if (dataView.byteLength === 8) {
                    try {
                        expiredAt = dataView.getBigUint64(0, true);
                        console.log('Expired At:', expiredAt);
                    } catch (error) {
                        console.error('Error decoding data:', error);
                        console.log('Error transaction:', transaction);
                        continue;
                    }

                    decodedSells.push({
                        signerAddress: signerAddress,
                        expiredAt: expiredAt.toString(), // Convert to string for consistency
                        makingAmount: '0', // Placeholder for makingAmount
                        takingAmount: '0'  // Placeholder for takingAmount
                    });
                } else if (dataView.byteLength === 16 || dataView.byteLength === 24 || dataView.byteLength === 25) {
                    let makingAmount = '0';
                    let takingAmount = '0';
                    try {
                        expiredAt = dataView.getBigUint64(0, true);
                        console.log('Expired At:', expiredAt);
                        if (dataView.byteLength === 16) {
                            makingAmount = dataView.getBigUint64(8, true).toString();
                            takingAmount = dataView.getBigUint64(16, true).toString();
                        } else if (dataView.byteLength === 24 || dataView.byteLength === 25) {
                            makingAmount = dataView.getBigUint64(16, true).toString();
                            takingAmount = dataView.getBigUint64(24, true).toString();
                        }
                        console.log('Making Amount:', makingAmount);
                        console.log('Taking Amount:', takingAmount);
                    } catch (error) {
                        console.error('Error decoding data:', error);
                        console.log('Error transaction:', transaction);
                        continue;
                    }

                    decodedSells.push({
                        signerAddress: signerAddress,
                        expiredAt: expiredAt.toString(),
                        makingAmount: makingAmount,
                        takingAmount: takingAmount
                    });
                } else {
                    console.error('Data length is invalid:', dataView.byteLength);
                }
            } else {
                console.log(`No data found in the first instruction`);
            }
        } else {
            console.log(`Transaction not found or no instructions available.`);
        }
    }

    console.log('Decoded Sells:', decodedSells);
    return decodedSells;
}

//getTokenLimitSells('3hY7TL8rhF8fJoamfavmev7ASd96v2Z4AN9TrKL521SM');




// async function fetchAllTransactionsForToken(mintAddress) {
//     const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'), 'confirmed');

//     // Fetch all token accounts for the given mint address
//     let tokenAccounts = await connection.getParsedTokenAccountsByMint(new solanaWeb3.PublicKey(mintAddress));

//     // Iterate over each token account and fetch transactions
//     for (const account of tokenAccounts.value) {
//         let publicKey = account.pubkey;
//         console.log(`Fetching transactions for token account: ${publicKey.toString()}`);

//         // Initialize an array to hold all transaction signatures
//         let allSignatures = [];

//         let beforeSignature = null; // Used for pagination
//         let hasMore = true;

//         // Loop to handle pagination
//         while (hasMore) {
//             const signatures = await connection.getSignaturesForAddress(publicKey, {
//                 before: beforeSignature,
//                 limit: 1000,  // Adjust the limit as needed
//             });

//             if (signatures.length > 0) {
//                 allSignatures.push(...signatures);
//                 beforeSignature = signatures[signatures.length - 1].signature;  // Update beforeSignature for pagination
//             } else {
//                 hasMore = false; // No more data to fetch
//             }
//         }

//         // Optional: Fetch and log full transaction details
//         for (const sig of allSignatures) {
//             let transaction = await connection.getTransaction(sig.signature);
//             if (transaction.meta.logMessages[0] == 'Program jupoNjAxXgZ4rjzxzPMP4oxduvQsQtZzyknqvzYNrNu invoke [1]')
//             console.log(sig.signature);
//         }
//     }
// }

// Replace 'YOUR_MINT_ADDRESS' with the actual mint address of the token
// fetchAllTransactionsForToken('3hY7TL8rhF8fJoamfavmev7ASd96v2Z4AN9TrKL521SM');