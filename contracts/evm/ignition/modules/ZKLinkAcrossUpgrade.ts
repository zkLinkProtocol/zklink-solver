// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ZKLinkAcrossModule } from "./ZKLinkAcross";

const ZKLinkAcrossUpgradeModule = buildModule('ZKLinkAcrossUpgradeModule', (m) => {
  const { proxy } = m.useModule(ZKLinkAcrossModule);
  // Deploy the implementation contract
  const permit2 = m.getParameter("permit2");
  const depositQuoteTimeBuffer = m.getParameter("depositQuoteTimeBuffer");
  const fillDeadlineBuffer = m.getParameter("fillDeadlineBuffer");

  const implementation = m.contract("ZKLinkAcross", [permit2, depositQuoteTimeBuffer, fillDeadlineBuffer]);

  // Execute the upgrade
  m.call(proxy, 'upgradeTo', [implementation]);

  return { implementation };
});

const ZKLinkAcrossTargetModule = buildModule('ZKLinkAcrossTargetModule', (m) => {
  // Deploy the implementation contract
  const permit2 = m.getParameter("permit2");
  const depositQuoteTimeBuffer = m.getParameter("depositQuoteTimeBuffer");
  const fillDeadlineBuffer = m.getParameter("fillDeadlineBuffer");

  const implementation = m.contract("ZKLinkAcross", [permit2, depositQuoteTimeBuffer, fillDeadlineBuffer]);

  return { implementation };
});

export default ZKLinkAcrossTargetModule;
