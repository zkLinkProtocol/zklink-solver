// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ZKLinkAcrossProxyModule } from "./ZKLinkAcross";

const ZKLinkAcrossUpgradeModule = buildModule('ZKLinkAcrossUpgradeModule', (m) => {
  const { proxy } = m.useModule(ZKLinkAcrossProxyModule);
  // Deploy the implementation contract
  const permit2 = m.getParameter("permit2");
  const depositQuoteTimeBuffer = m.getParameter("depositQuoteTimeBuffer");
  const fillDeadlineBuffer = m.getParameter("fillDeadlineBuffer");

  const implementation = m.contract("ZKLinkAcrossV2", [permit2, depositQuoteTimeBuffer, fillDeadlineBuffer]);

  // Execute the upgrade
  const uups = m.contractAt('UUPSUpgradeable', proxy);
  m.call(uups, 'upgradeTo', [implementation], { from: m.getAccount(0) });

  return { proxy };
});

const ZKLinkAcrossV2Module = buildModule('ZKLinkAcrossV2Module', (m) => {
  const { proxy } = m.useModule(ZKLinkAcrossUpgradeModule);

  const implementation = m.contractAt("ZKLinkAcrossV2", proxy);

  return { implementation };
});

export default ZKLinkAcrossV2Module;
