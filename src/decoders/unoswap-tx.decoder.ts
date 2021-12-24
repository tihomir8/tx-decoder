import {BlockchainResources, BlockchainRpcCaller, Transaction} from '../model/common.model';
import {TxDecoder} from './base-tx.decoder';
import {TransactionReceipt} from '@ethersproject/abstract-provider';
import {getDestAmountViaEstimation, getReturnAmountFromLogs} from '../helpers/dest-amount.helper';
import {decodeSwapTx} from '../helpers/swap-decode.helper';
import {BigNumber} from '@ethersproject/bignumber';
import {getDestTokenAddressOfUnoSwap} from '../helpers/uni-pool.helper';
import {SwapTxDecoded} from '../model/swap-tx.model';

export interface UnoswapTxItemData {
    srcToken: string;
    amount: string;
    minReturn: string;
    pools: BigNumber[];
}

export class UnoswapTxDecoder implements TxDecoder<UnoswapTxItemData> {
    constructor(readonly resources: BlockchainResources,
                readonly rpcCaller: BlockchainRpcCaller,
                readonly txData: UnoswapTxItemData) {
    }

    async decodeByConfig(txConfig: Transaction): Promise<SwapTxDecoded> {
        const {value: dstAmount, error} = await getDestAmountViaEstimation(this.rpcCaller, txConfig);
        const {
            srcToken: srcTokenAddress,
            amount: srcAmount,
            minReturn: minReturnAmount,
            pools
        } = this.txData;

        const dstTokenAddress = await getDestTokenAddressOfUnoSwap(
            pools[pools.length - 1],
            this.rpcCaller
        );

        return decodeSwapTx({
            srcTokenAddress,
            dstTokenAddress,
            srcAmount,
            minReturnAmount,
            dstAmount,
            error
        }, this.resources);
    }

    async decodeByLogs(receipt: TransactionReceipt): Promise<SwapTxDecoded> {
        const dstAmount = await getReturnAmountFromLogs(receipt);

        const {
            srcToken: srcTokenAddress,
            amount: srcAmount,
            minReturn: minReturnAmount,
            pools
        } = this.txData;

        const dstTokenAddress = await getDestTokenAddressOfUnoSwap(
            pools[pools.length - 1],
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
