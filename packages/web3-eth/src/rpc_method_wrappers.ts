// Disabling because returnTypes must be last param to match 1.x params
/* eslint-disable default-param-last */
import { EthExecutionAPI, PromiEvent, ReceiptInfo, TransactionWithSender } from 'web3-common';
import { Web3Context } from 'web3-core';
import {
	Address,
	BlockNumberOrTag,
	convertObjectPropertiesToValidType,
	convertToValidType,
	Filter,
	HexString,
	HexString32Bytes,
	HexStringBytes,
	Uint,
	Uint256,
	ValidReturnTypes,
	ValidTypes,
} from 'web3-utils';
import { isBlockTag, isHexString32Bytes, validator } from 'web3-validator';
import {
	convertibleBlockProperties,
	convertibleFeeHistoryResultProperties,
	convertibleReceiptInfoProperties,
	convertibleTransactionInfoProperties,
} from './convertible_properties';
import * as rpcMethods from './rpc_methods';
import {
	BlockFormatted,
	ReceiptInfoFormatted,
	SendSignedTransactionEvents,
	SendTransactionEvents,
	SendTransactionOptions,
	Transaction,
	TransactionCall,
} from './types';
import { formatTransaction } from './utils/format_transaction';
import { Web3EthExecutionAPI } from './web3_eth_execution_api';
// eslint-disable-next-line import/no-cycle
import { getTransactionGasPricing } from './utils/get_transaction_gas_pricing';
import { waitForTransactionReceipt } from './utils/wait_for_transaction_receipt';
import { watchTransactionForConfirmations } from './utils/watch_transaction_for_confirmations';

export const getProtocolVersion = async (web3Context: Web3Context<EthExecutionAPI>) =>
	rpcMethods.getProtocolVersion(web3Context.requestManager);

export const isSyncing = async (web3Context: Web3Context<EthExecutionAPI>) =>
	rpcMethods.getSyncing(web3Context.requestManager);

export const getCoinbase = async (web3Context: Web3Context<EthExecutionAPI>) =>
	rpcMethods.getCoinbase(web3Context.requestManager);

export const isMining = async (web3Context: Web3Context<EthExecutionAPI>) =>
	rpcMethods.getMining(web3Context.requestManager);

export async function getHashRate<ReturnType extends ValidTypes = ValidTypes.HexString>(
	web3Context: Web3Context<EthExecutionAPI>,
	returnType?: ReturnType,
) {
	const response = await rpcMethods.getHashRate(web3Context.requestManager);

	return convertToValidType(
		response,
		returnType ?? web3Context.defaultReturnType,
	) as ValidReturnTypes[ReturnType];
}

export async function getGasPrice<ReturnType extends ValidTypes = ValidTypes.HexString>(
	web3Context: Web3Context<EthExecutionAPI>,
	returnType?: ReturnType,
) {
	const response = await rpcMethods.getGasPrice(web3Context.requestManager);

	return convertToValidType(
		response,
		returnType ?? web3Context.defaultReturnType,
	) as ValidReturnTypes[ReturnType];
}

export async function getBlockNumber<ReturnType extends ValidTypes = ValidTypes.HexString>(
	web3Context: Web3Context<EthExecutionAPI>,
	returnType?: ReturnType,
) {
	const response = await rpcMethods.getBlockNumber(web3Context.requestManager);

	return convertToValidType(
		response,
		returnType ?? web3Context.defaultReturnType,
	) as ValidReturnTypes[ReturnType];
}

export async function getBalance<ReturnType extends ValidTypes = ValidTypes.HexString>(
	web3Context: Web3Context<EthExecutionAPI>,
	address: Address,
	blockNumber: BlockNumberOrTag = web3Context.defaultBlock,
	returnType?: ReturnType,
) {
	const response = await rpcMethods.getBalance(web3Context.requestManager, address, blockNumber);

	return convertToValidType(
		response,
		returnType ?? web3Context.defaultReturnType,
	) as ValidReturnTypes[ReturnType];
}

export const getStorageAt = async (
	web3Context: Web3Context<EthExecutionAPI>,
	address: Address,
	storageSlot: Uint256,
	blockNumber: BlockNumberOrTag = web3Context.defaultBlock,
) => rpcMethods.getStorageAt(web3Context.requestManager, address, storageSlot, blockNumber);

export const getCode = async (
	web3Context: Web3Context<EthExecutionAPI>,
	address: Address,
	blockNumber: BlockNumberOrTag = web3Context.defaultBlock,
) => rpcMethods.getCode(web3Context.requestManager, address, blockNumber);

export async function getBlock<ReturnType extends ValidTypes = ValidTypes.HexString>(
	web3Context: Web3Context<EthExecutionAPI>,
	block: HexString32Bytes | BlockNumberOrTag = web3Context.defaultBlock,
	hydrated = false,
	returnType?: ReturnType,
): Promise<BlockFormatted<ReturnType>> {
	const response = isHexString32Bytes(block)
		? await rpcMethods.getBlockByHash(web3Context.requestManager, block, hydrated)
		: await rpcMethods.getBlockByNumber(web3Context.requestManager, block, hydrated);

	// @ts-expect-error Having a problem determining if BlockFormatted<ReturnType> is correct type
	return convertObjectPropertiesToValidType(
		response,
		convertibleBlockProperties,
		returnType ?? web3Context.defaultReturnType,
	);
}

export async function getBlockTransactionCount<
	ReturnType extends ValidTypes = ValidTypes.HexString,
>(
	web3Context: Web3Context<EthExecutionAPI>,
	block: HexString32Bytes | BlockNumberOrTag = web3Context.defaultBlock,
	returnType?: ReturnType,
) {
	const response = isHexString32Bytes(block)
		? await rpcMethods.getBlockTransactionCountByHash(web3Context.requestManager, block)
		: await rpcMethods.getBlockTransactionCountByNumber(web3Context.requestManager, block);

	return convertToValidType(
		response,
		returnType ?? web3Context.defaultReturnType,
	) as ValidReturnTypes[ReturnType];
}

export async function getBlockUncleCount<ReturnType extends ValidTypes = ValidTypes.HexString>(
	web3Context: Web3Context<EthExecutionAPI>,
	block: HexString32Bytes | BlockNumberOrTag = web3Context.defaultBlock,
	returnType?: ReturnType,
) {
	const response = isHexString32Bytes(block)
		? await rpcMethods.getUncleCountByBlockHash(web3Context.requestManager, block)
		: await rpcMethods.getUncleCountByBlockNumber(web3Context.requestManager, block);

	return convertToValidType(
		response,
		returnType ?? web3Context.defaultReturnType,
	) as ValidReturnTypes[ReturnType];
}

export async function getUncle<ReturnType extends ValidTypes = ValidTypes.HexString>(
	web3Context: Web3Context<EthExecutionAPI>,
	block: HexString32Bytes | BlockNumberOrTag = web3Context.defaultBlock,
	uncleIndex: Uint,
	returnType?: ReturnType,
): Promise<BlockFormatted<ReturnType>> {
	const response = isHexString32Bytes(block)
		? await rpcMethods.getUncleByBlockHashAndIndex(
				web3Context.requestManager,
				block,
				uncleIndex,
		  )
		: await rpcMethods.getUncleByBlockNumberAndIndex(
				web3Context.requestManager,
				block,
				uncleIndex,
		  );

	// @ts-expect-error Having a problem determining if BlockFormatted<ReturnType> is correct type
	return convertObjectPropertiesToValidType(
		response,
		convertibleBlockProperties,
		returnType ?? web3Context.defaultReturnType,
	);
}

export async function getTransaction<ReturnType extends ValidTypes = ValidTypes.HexString>(
	web3Context: Web3Context<EthExecutionAPI>,
	transactionHash: HexString32Bytes,
	returnType?: ReturnType,
) {
	const response = await rpcMethods.getTransactionByHash(
		web3Context.requestManager,
		transactionHash,
	);

	return response === null
		? response
		: convertObjectPropertiesToValidType(
				response,
				// TODO
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-expect-error
				convertibleTransactionInfoProperties,
				returnType ?? web3Context.defaultReturnType,
		  );
}

export async function getTransactionFromBlock<ReturnType extends ValidTypes = ValidTypes.HexString>(
	web3Context: Web3Context<EthExecutionAPI>,
	block: HexString32Bytes | BlockNumberOrTag | undefined,
	transactionIndex: Uint,
	returnType?: ReturnType,
) {
	const blockOrDefault = block ?? web3Context.defaultBlock;
	const response = isHexString32Bytes(blockOrDefault)
		? await rpcMethods.getTransactionByBlockHashAndIndex(
				web3Context.requestManager,
				blockOrDefault,
				transactionIndex,
		  )
		: await rpcMethods.getTransactionByBlockNumberAndIndex(
				web3Context.requestManager,
				blockOrDefault,
				transactionIndex,
		  );

	return response === null
		? response
		: convertObjectPropertiesToValidType(
				response,
				// TODO
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-expect-error
				convertibleTransactionInfoProperties,
				returnType ?? web3Context.defaultReturnType,
		  );
}

export async function getTransactionReceipt<ReturnType extends ValidTypes = ValidTypes.HexString>(
	web3Context: Web3Context<EthExecutionAPI>,
	transactionHash: HexString32Bytes,
	returnType?: ReturnType,
) {
	const response = await rpcMethods.getTransactionReceipt(
		web3Context.requestManager,
		transactionHash,
	);

	return response === null
		? response
		: convertObjectPropertiesToValidType(
				response,
				convertibleReceiptInfoProperties,
				returnType ?? web3Context.defaultReturnType,
		  );
}

export async function getTransactionCount<ReturnType extends ValidTypes = ValidTypes.HexString>(
	web3Context: Web3Context<EthExecutionAPI>,
	address: Address,
	blockNumber: BlockNumberOrTag | undefined,
	returnType?: ReturnType,
) {
	const response = await rpcMethods.getTransactionCount(
		web3Context.requestManager,
		address,
		blockNumber ?? web3Context.defaultBlock,
	);

	return convertToValidType(
		response,
		returnType ?? web3Context.defaultReturnType,
	) as ValidReturnTypes[ReturnType];
}

export async function getPendingTransactions<ReturnType extends ValidTypes = ValidTypes.HexString>(
	web3Context: Web3Context<EthExecutionAPI>,
	returnType?: ReturnType,
) {
	const response = await rpcMethods.getPendingTransactions(web3Context.requestManager);
	return response.map(transaction =>
		formatTransaction(transaction, returnType ?? web3Context.defaultReturnType),
	);
}

export function sendTransaction(
	web3Context: Web3Context<EthExecutionAPI>,
	transaction: Transaction,
	options?: SendTransactionOptions,
): PromiEvent<ReceiptInfoFormatted, SendTransactionEvents> {
	let _transaction = formatTransaction(transaction, ValidTypes.HexString);
	const promiEvent = new PromiEvent<ReceiptInfoFormatted, SendTransactionEvents>(resolve => {
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		setImmediate(async () => {
			if (
				!options?.ignoreGasPricing &&
				transaction.gasPrice === undefined &&
				(transaction.maxPriorityFeePerGas === undefined ||
					transaction.maxFeePerGas === undefined)
			) {
				_transaction = {
					..._transaction,
					...(await getTransactionGasPricing(
						_transaction,
						web3Context,
						ValidTypes.HexString,
					)),
				};
			}

			if (promiEvent.listenerCount('sending') > 0) {
				promiEvent.emit('sending', _transaction);
			}

			// TODO - If an account is available in wallet, sign transaction and call sendRawTransaction
			// https://github.com/ChainSafe/web3.js/blob/b32555cfeedde128c657dabbba201102f691f955/packages/web3-core-method/src/index.js#L720

			const transactionHash = await rpcMethods.sendTransaction(
				web3Context.requestManager,
				_transaction,
			);

			if (promiEvent.listenerCount('sent') > 0) {
				promiEvent.emit('sent', _transaction);
			}

			if (promiEvent.listenerCount('transactionHash') > 0) {
				promiEvent.emit('transactionHash', transactionHash);
			}

			let transactionReceipt = await rpcMethods.getTransactionReceipt(
				web3Context.requestManager,
				transactionHash,
			);

			// Transaction hasn't been included in a block yet
			if (transactionReceipt === null)
				transactionReceipt = await waitForTransactionReceipt(web3Context, transactionHash);

			promiEvent.emit('receipt', transactionReceipt);
			// TODO - Format receipt
			resolve(transactionReceipt);

			if (promiEvent.listenerCount('confirmation') > 0) {
				watchTransactionForConfirmations<SendTransactionEvents>(
					web3Context,
					promiEvent,
					transactionReceipt,
				);
			}
		});
	});

	return promiEvent;
}

export const sendSignedTransaction = (
	web3Context: Web3Context<EthExecutionAPI>,
	transaction: HexStringBytes,
): PromiEvent<ReceiptInfoFormatted, SendSignedTransactionEvents> => {
	// TODO - Promise returned in function argument where a void return was expected
	// eslint-disable-next-line @typescript-eslint/no-misused-promises
	const promiEvent = new PromiEvent<ReceiptInfo, SendSignedTransactionEvents>(resolve => {
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		setImmediate(async () => {
			promiEvent.emit('sending', transaction);

			const transactionHash = await rpcMethods.sendRawTransaction(
				web3Context.requestManager,
				transaction,
			);

			promiEvent.emit('sent', transaction);
			promiEvent.emit('transactionHash', transactionHash);

			let transactionReceipt = await rpcMethods.getTransactionReceipt(
				web3Context.requestManager,
				transactionHash,
			);

			// Transaction hasn't been included in a block yet
			if (transactionReceipt === null)
				transactionReceipt = await waitForTransactionReceipt(web3Context, transactionHash);

			promiEvent.emit('receipt', transactionReceipt);
			// TODO - Format receipt
			resolve(transactionReceipt);

			watchTransactionForConfirmations<SendSignedTransactionEvents>(
				web3Context,
				promiEvent,
				transactionReceipt,
			);
		});
	});

	return promiEvent;
};

// TODO address can be an address or the index of a local wallet in web3.eth.accounts.wallet
// https://web3js.readthedocs.io/en/v1.5.2/web3-eth.html?highlight=sendTransaction#sign
export const sign = async (
	web3Context: Web3Context<EthExecutionAPI>,
	message: HexStringBytes,
	address: Address,
) => rpcMethods.sign(web3Context.requestManager, address, message);

export const signTransaction = async (
	web3Context: Web3Context<EthExecutionAPI>,
	transaction: Transaction,
) =>
	rpcMethods.signTransaction(
		web3Context.requestManager,
		formatTransaction(transaction, ValidTypes.HexString),
	);

// TODO Decide what to do with transaction.to
// https://github.com/ChainSafe/web3.js/pull/4525#issuecomment-982330076
export const call = async (
	web3Context: Web3Context<EthExecutionAPI>,
	transaction: TransactionCall,
	blockNumber: BlockNumberOrTag = web3Context.defaultBlock,
) => {
	validator.validate(['address'], [transaction.to]);

	return rpcMethods.call(
		web3Context.requestManager,
		formatTransaction(transaction, ValidTypes.HexString) as TransactionCall<HexString>,
		isBlockTag(blockNumber)
			? blockNumber
			: (convertToValidType(blockNumber, ValidTypes.HexString) as HexString),
	);
};

// TODO Missing param
export async function estimateGas<ReturnType extends ValidTypes = ValidTypes.HexString>(
	web3Context: Web3Context<EthExecutionAPI>,
	transaction: Partial<TransactionWithSender>,
	blockNumber: BlockNumberOrTag = web3Context.defaultBlock,
	returnType?: ReturnType,
) {
	const response = await rpcMethods.estimateGas(
		web3Context.requestManager,
		transaction,
		blockNumber,
	);

	return convertToValidType(
		response,
		returnType ?? web3Context.defaultReturnType,
	) as ValidReturnTypes[ReturnType];
}

export async function getFeeHistory<ReturnType extends ValidTypes = ValidTypes.HexString>(
	web3Context: Web3Context<EthExecutionAPI>,
	blockCount: Uint,
	newestBlock: BlockNumberOrTag = web3Context.defaultBlock,
	rewardPercentiles: number[],
	returnType?: ReturnType,
) {
	const response = await rpcMethods.getFeeHistory(
		web3Context.requestManager,
		blockCount,
		newestBlock,
		rewardPercentiles,
	);

	return convertObjectPropertiesToValidType(
		response,
		convertibleFeeHistoryResultProperties,
		returnType ?? web3Context.defaultReturnType,
	);
}

export async function getChainId<ReturnType extends ValidTypes = ValidTypes.HexString>(
	web3Context: Web3Context<EthExecutionAPI>,
	returnType?: ReturnType,
) {
	const response = await rpcMethods.getChainId(web3Context.requestManager);

	return convertToValidType(
		response,
		returnType ?? web3Context.defaultReturnType,
	) as ValidReturnTypes[ReturnType];
}

export async function getProof<ReturnType extends ValidTypes = ValidTypes.HexString>(
	web3Context: Web3Context<Web3EthExecutionAPI>,
	address: Address,
	storageKey: HexString32Bytes,
	blockNumber: BlockNumberOrTag = web3Context.defaultBlock,
	returnType?: ReturnType,
) {
	const response = await rpcMethods.getProof(
		web3Context.requestManager,
		address,
		storageKey,
		blockNumber,
	);
	return {
		...response,
		balance: convertToValidType(response.balance, returnType ?? web3Context.defaultReturnType),
		nonce: convertToValidType(response.nonce, returnType ?? web3Context.defaultReturnType),
		storageProof: response.storageProof.map(proof => ({
			...proof,
			value: convertToValidType(proof.value, returnType ?? web3Context.defaultReturnType),
		})),
	};
}

export async function getLogs<ReturnType extends ValidTypes = ValidTypes.HexString>(
	web3Context: Web3Context<Web3EthExecutionAPI>,
	filter: Filter,
	returnType?: ReturnType,
) {
	const response = await rpcMethods.getLogs(web3Context.requestManager, filter);
	const validReturnType = returnType ?? web3Context.defaultReturnType;

	const result = response.map(res => {
		if (typeof res === 'string') {
			return res;
		}

		const { logIndex, transactionIndex, blockNumber } = res;

		return {
			...res,
			logIndex: logIndex ? convertToValidType(logIndex, validReturnType) : undefined,
			transactionIndex: transactionIndex
				? convertToValidType(transactionIndex, validReturnType)
				: undefined,
			blockNumber: blockNumber ? convertToValidType(blockNumber, validReturnType) : undefined,
		};
	});

	return result;
}
