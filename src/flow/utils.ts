import * as fcl from '@onflow/fcl';
import { transactionStore } from '$stores/flow/TransactionStore';
import { addresses } from '$stores/flow/FlowStore';
import { network } from './config';
import type { TransactionStatusObject } from '@onflow/fcl';
import type { ActionExecutionResult } from '$lib/stores/custom/steps/step.interface';
import { ECurrencies } from '$lib/types/common/enums';

export function replaceWithProperValues(script: string, contractName = '', contractAddress = '') {
	return (
		script
			// For Tx/Scripts
			.replace('"../ExampleToken.cdc"', contractAddress)
			.replace('"../utility/NonFungibleToken.cdc"', addresses.NonFungibleToken)
			.replace('"../utility/MetadataViews.cdc"', addresses.MetadataViews)
			.replace('"../utility/FlowToken.cdc"', addresses.FlowToken)
			.replace('"../utility/FiatToken.cdc"', addresses.FiatToken)
			.replace('"../utility/FungibleToken.cdc"', addresses.FungibleToken)
			.replace('"../utility/FIND.cdc"', addresses.FIND)
			.replace('"../utility/FLOAT.cdc"', addresses.FLOAT)
			.replace('"../Toucans.cdc"', addresses.Toucans)
			.replace('"../ToucansActions.cdc"', addresses.Toucans)
			.replace('"../ToucansMultiSign.cdc"', addresses.Toucans)
			.replace('"../ToucansTokens.cdc"', addresses.Toucans)
			.replace('"../utility/NFTCatalog.cdc"', addresses.NFTCatalog)
			.replace('"../utility/SwapInterfaces.cdc"', addresses.SwapUtils)
			.replace('"../utility/SwapError.cdc"', addresses.SwapUtils)
			.replace('"../utility/SwapConfig.cdc"', addresses.SwapUtils)
			.replace('"../utility/SwapFactory.cdc"', addresses.SwapFactory)
			.replace('"../utility/EmeraldIdentity.cdc"', addresses.EmeraldIdentity)
			// Two directories deep
			.replace('"../../ExampleToken.cdc"', contractAddress)
			.replace('"../../utility/NonFungibleToken.cdc"', addresses.NonFungibleToken)
			.replace('"../../utility/MetadataViews.cdc"', addresses.MetadataViews)
			.replace('"../../utility/FlowToken.cdc"', addresses.FlowToken)
			.replace('"../../utility/FiatToken.cdc"', addresses.FiatToken)
			.replace('"../../utility/FungibleToken.cdc"', addresses.FungibleToken)
			.replace('"../../utility/FIND.cdc"', addresses.FIND)
			.replace('"../../utility/FLOAT.cdc"', addresses.FLOAT)
			.replace('"../../Toucans.cdc"', addresses.Toucans)
			.replace('"../../ToucansActions.cdc"', addresses.Toucans)
			.replace('"../../ToucansMultiSign.cdc"', addresses.Toucans)
			.replace('"../../ToucansTokens.cdc"', addresses.Toucans)
			.replace('"../../utility/NFTCatalog.cdc"', addresses.NFTCatalog)
			.replace('"../../utility/FiatToken.cdc"', addresses.FiatToken)
			// For Contract
			.replace('"./utility/NonFungibleToken.cdc"', addresses.NonFungibleToken)
			.replace('"./utility/MetadataViews.cdc"', addresses.MetadataViews)
			.replace('"./utility/FungibleToken.cdc"', addresses.FungibleToken)
			.replace('"./utility/FungibleTokenMetadataViews.cdc"', addresses.FungibleTokenMetadataViews)
			.replace('"./utility/FlowToken.cdc"', addresses.FlowToken)
			.replace('"./utility/FiatToken.cdc"', addresses.FiatToken)
			.replace('"./Toucans.cdc"', addresses.Toucans)
			.replace('"./ToucansMultiSign.cdc"', addresses.Toucans)
			.replace('"./ToucansActions.cdc"', addresses.Toucans)
			.replace('"./ToucansTokens.cdc"', addresses.Toucans)
			// For All
			.replaceAll('ExampleToken', contractName)
			.replaceAll('0x5643fd47a29770e7', addresses.ECTreasury)
	);
}

export function switchToToken(script: string, currency: ECurrencies) {
	if (currency === ECurrencies.USDC) {
		return (
			script
				.replaceAll('flowTokenReceiver', 'USDCVaultReceiver')
				.replaceAll('flowTokenVault', 'USDCVault')
				.replaceAll('FlowToken', 'FiatToken')
		);
	}
	return script;
}

export const executeTransaction: (
	transaction: () => Promise<string>,
	actionAfterSucceed?: (res: TransactionStatusObject) => Promise<ActionExecutionResult>
) => Promise<ActionExecutionResult> = async (transaction, actionAfterSucceed) => {
	transactionStore.initTransaction();

	try {
		// We start the transaction
		const transactionId = await transaction();
		console.log('Transaction Id', transactionId);

		// We connect our TransactionStore to the transaction to get the status
		fcl.tx(transactionId).subscribe(async (res: TransactionStatusObject) => {
			console.log(res);
			transactionStore.subscribeTransaction(res);
		});

		// We wait for the transaction to be sealed to get the result
		const executionResult = (await fcl.tx(transactionId).onceSealed()) as TransactionStatusObject;

		// Once sealed, we check if the execution has an actionAfterSucceed, if so, we execute it
		if (actionAfterSucceed) {
			try {
				// We execute the actionAfterSucceed and return the result
				const action = await actionAfterSucceed(executionResult);

				setTimeout(() => {
					transactionStore.resetTransaction();
				}, 1000);

				return action;
			} catch (e) {
				transactionStore.resetTransaction();

				return {
					state: 'error',
					errorMessage: 'Error executing actionAfterSucceed: ' + e
				} as ActionExecutionResult;
			}
		} else {
			setTimeout(() => {
				transactionStore.resetTransaction();
			}, 1000);

			return {
				state: 'success',
				errorMessage: ''
			} as ActionExecutionResult;
		}
	} catch (e) {
		transactionStore.subscribeTransaction({
			blockId: '',
			events: [],
			status: 4,
			statusString: '',
			errorMessage: e as string,
			statusCode: 1
		});

		setTimeout(() => {
			transactionStore.resetTransaction();
		}, 6000);

		console.log('Error in executeTransaction: ', e);

		return {
			state: 'error',
			errorMessage: e
		} as ActionExecutionResult;
	}
};

export const getFindProfile = async (address: string) => {
	try {
		return await fcl.query({
			cadence: `
        import FIND from ${addresses.FIND}
        pub fun main(address: Address): Profile? {
            if let name = FIND.reverseLookup(address) {
              let profile = FIND.lookup(name)!
              return Profile(_name: name, _address: address, _avatar: profile.getAvatar())
            }
            
            return nil
        }

        pub struct Profile {
          pub let name: String
          pub let address: Address
          pub let avatar: String

          init(_name: String, _address: Address, _avatar: String) {
            self.name = _name
            self.address = _address
            self.avatar = _avatar
          }
        }
        `,
			args: (arg, t) => [arg(address, t.Address)]
		});
	} catch (e) {
		return null;
	}
};

export const getFindNamesBatch = async (addressList: string[]) => {
	try {
		return await fcl.query({
			cadence: `
        import FIND from ${addresses.FIND}
        pub fun main(addresses: [Address]): {Address: String} {
					let answer: {Address: String} = {}
					for address in addresses {
						answer[address] = FIND.reverseLookup(address)
					}
					return answer
        }
        `,
			args: (arg, t) => [arg(addressList, t.Array(t.Address))]
		});
	} catch (e) {
		return null;
	}
};

export const getFindProfilesBatch = async (addressList: string[]) => {
	try {
		return await fcl.query({
			cadence: `
        import FIND from ${addresses.FIND}
        pub fun main(addresses: [Address]): {Address: Profile} {
					let answer: {Address: Profile} = {}
					for address in addresses {
						if let name = FIND.reverseLookup(address) {
              let profile = FIND.lookup(name)!
              answer[address] = Profile(_name: name, _address: address, _avatar: profile.getAvatar())
            }
					}
					return answer
        }

				pub struct Profile {
          pub let name: String
          pub let address: Address
          pub let avatar: String

          init(_name: String, _address: Address, _avatar: String) {
            self.name = _name
            self.address = _address
            self.avatar = _avatar
          }
        }
        `,
			args: (arg, t) => [arg(addressList, t.Array(t.Address))]
		});
	} catch (e) {
		return null;
	}
};

export const verifyAccountOwnership = async (userObject) => {
	if (!userObject.loggedIn) {
		return false;
	}
	const accountProofService = userObject.services.find(
		(services) => services.type === 'account-proof'
	);
	const fclCryptoContract = network === 'emulator' ? '0xf8d6e0586b0a20c7' : null;
	return await fcl.AppUtils.verifyAccountProof('Toucans', accountProofService.data, {
		fclCryptoContract
	});
};

export const formatFix = (value) => {
	const i = Number.parseFloat(value);
	if (i % 1 == 0) {
		return i.toFixed(4);
	}
	return i.toFixed(4);
};

export const splitList = (list: string[], chunkSize: number) => {
	const groups = []
	let currentGroup = []
	for (let i = 0; i < list.length; i++) {
		const collectionID = list[i]
		if (currentGroup.length >= chunkSize) {
			groups.push([...currentGroup])
			currentGroup = []
		}
		currentGroup.push(collectionID)
	}
	groups.push([...currentGroup])
	return groups
}