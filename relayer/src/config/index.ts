export default async () => {
  const {
    SUPPORT_CHAINIDS,
    CHANIDS_RPC,
    CONTRACT_ADDRESS,
    STRART_BLOCK_NUMBER,
    CONFIRM_BLOCKs,
    FILLER_PK,
  } = process.env;

  const supportChainIds = SUPPORT_CHAINIDS.split(',').map((id) => parseInt(id));
  if (supportChainIds.length === 0) {
    throw new Error('No supported chain ids');
  }
  const rpcUrls = CHANIDS_RPC.split(',');
  const contractAddresses = CONTRACT_ADDRESS.split(',');
  const startBlockNumber = STRART_BLOCK_NUMBER.split(',').map((blockNumber) =>
    parseInt(blockNumber),
  );
  const confirmBlocks = CONFIRM_BLOCKs.split(',').map((blockNumber) =>
    parseInt(blockNumber),
  );
  if (
    supportChainIds.length !== rpcUrls.length ||
    supportChainIds.length !== startBlockNumber.length ||
    supportChainIds.length !== contractAddresses.length ||
    supportChainIds.length !== confirmBlocks.length
  ) {
    throw new Error('Invalid configuration for chain clients');
  }

  if (!FILLER_PK) {
    throw new Error('No filler private key');
  }

  return {
    filler_pk: FILLER_PK,
    support_chains: supportChainIds.map((chainId, index) => {
      return {
        chain_id: chainId,
        rpc_url: rpcUrls[index],
        contract_address: contractAddresses[index],
        start_block_number: startBlockNumber[index],
        confirm_blocks: confirmBlocks[index],
      };
    }),
  };
};
