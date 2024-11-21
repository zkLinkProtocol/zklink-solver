// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ZKLinkAcrossProxyModule = buildModule("ZKLinkAcrossProxyModule", (m) => {
  // Deploy the implementation contract
  const permit2 = m.getParameter("permit2");
  const depositQuoteTimeBuffer = m.getParameter("depositQuoteTimeBuffer");
  const fillDeadlineBuffer = m.getParameter("fillDeadlineBuffer");
  const implementation = m.contract("ZKLinkAcross", [permit2, depositQuoteTimeBuffer, fillDeadlineBuffer]);

  // Encode the initialize function call for the contract.
  const owner = m.getAccount(0);
  const initialize = m.encodeFunctionCall(implementation, 'initialize', [owner]);

  // Deploy the ERC1967 Proxy, pointing to the implementation
  const proxy = m.contract('ERC1967Proxy', [implementation, initialize]);
  return { proxy };
});

export const ZKLinkAcrossModule = buildModule('ZKLinkAcrossModule', (m) => {
  // Get the proxy from the previous module.
  const { proxy } = m.useModule(ZKLinkAcrossProxyModule);

  // Create a contract instance using the deployed proxy's address.
  const instance = m.contractAt('ZKLinkAcross', proxy);

  return { instance, proxy };
});

export default ZKLinkAcrossModule;
