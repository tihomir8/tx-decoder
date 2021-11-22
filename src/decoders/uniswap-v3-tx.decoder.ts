import {BlockchainResources, BlockchainRpcCaller, Transaction} from '../model/common.model';
import {TxDecoder} from './base-tx.decoder';
import {TransactionReceipt} from '@ethersproject/abstract-provider';
import {getDestAmountViaEstimation, getReturnAmountFromLogs} from '../helpers/dest-amount.helper';
import {decodeSwapTx} from '../helpers/swap-decode.helper';
import {BigNumber} from '@ethersproject/bignumber';
import {getTokensOfUniswapV3Pools} from '../helpers/uni-pool.helper';
import {SwapTxDecoded} from '../model/swap-tx.model';

export interface UniswapV3TxItemData {
    amount: string;
    minReturn: string;
    pools: BigNumber[];
}

export class UniswapV3TxDecoder implements TxDecoder {
    constructor(readonly resources: BlockchainResources,
                readonly rpcCaller: BlockchainRpcCaller,
                readonly txData: UniswapV3TxItemData) {
    }

    async decodeByConfig(txConfig: Transaction): Promise<SwapTxDecoded> {
        const dstAmount = await getDestAmountViaEstimation(this.rpcCaller, txConfig);
        const {
            amount: srcAmount,
            minReturn: minReturnAmount,
            pools
        } = this.txData;

        const {
            srcTokenAddress,
            dstTokenAddress
        } = await getTokensOfUniswapV3Pools(
            pools.map(pool => pool.toString()),
            this.rpcCaller
        );

        return decodeSwapTx({
            srcTokenAddress,
            dstTokenAddress,
            srcAmount,
            minReturnAmount,
            dstAmount
        }, this.resources);
    }

    async decodeByLogs(receipt: TransactionReceipt): Promise<SwapTxDecoded> {
        const dstAmount = await getReturnAmountFromLogs(receipt);

        const {
            amount: srcAmount,
            minReturn: minReturnAmount,
            pools
        } = this.txData;

        const {
            srcTokenAddress,
            dstTokenAddress
        } = await getTokensOfUniswapV3Pools(
            pools.map(pool => pool.toString()),
            this.rpcCaller
        );

        return decodeSwapTx({
            srcTokenAddress,
            dstTokenAddress,
            srcAmount,
            minReturnAmount,
            dstAmount
        }, this.resources);
    }
}
