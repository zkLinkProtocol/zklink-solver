import { Command } from "commander";
import {
  formatUnits,
  JsonRpcProvider,
  parseUnits,
  Wallet,
  ZeroAddress,
} from "ethers";
import { ZKLinkAcross__factory } from "../typechain-types";
import { encodeAcrossFillerData, encodeRelayData } from "./erc7683";
import { V3SpokePoolInterface } from "../typechain-types/contracts/interfaces/V3SpokePoolInterface";
import { addressToBytes32 } from "./utils";

async function main() {
  const program = new Command();

  program.version("0.1.0").name("fill").description("fill order");

  program
    .option("--rpc-url <rpc-url>")
    .option("--private-key <private-key>")
    .option("--gas-price <private-key>")
    .option("--across <acorss>")
    .option("--order-id <order-id>")
    .option("--depositor <depositor>")
    .option("--recipient <recipient>")
    .option("--exclusive-relayer <exclusive-relayer>")
    .option("--input-token <input-token>")
    .option("--output-token <output-token>")
    .option("--input-amount <input-amount>")
    .option("--output-amount <output-amount>")
    .option("--origin-chain-id <origin-chain-id>")
    .option("--repayment-chain-id <repayment-chain-id>")
    .option("--deposit-id <deposit-id>")
    .option("--fill-deadline <fill-deadline>", "The fill deadline")
    .option(
      "--exclusivity-deadline <exclusivity-deadline>",
      "The exclusivity deadline",
    )
    .action(async (cmd) => {
      const provider = new JsonRpcProvider(cmd.rpcUrl);
      const filler = new Wallet(cmd.privateKey, provider);
      console.log(`Using filler wallet: ${filler.address}`);

      const gasPrice = cmd.gasPrice
        ? parseUnits(cmd.gasPrice, "gwei")
        : (await provider.getFeeData()).gasPrice!;
      console.log(`Using gas price: ${formatUnits(gasPrice, "gwei")} gwei`);

      const orderData: V3SpokePoolInterface.V3RelayDataStruct = {
        depositor: addressToBytes32(cmd.depositor),
        recipient: addressToBytes32(cmd.recipient),
        exclusiveRelayer: addressToBytes32(cmd.exclusiveRelayer),
        inputToken: addressToBytes32(cmd.inputToken),
        inputAmount: BigInt(cmd.inputAmount),
        outputToken: addressToBytes32(cmd.outputToken),
        outputAmount: BigInt(cmd.outputAmount),
        originChainId: cmd.originChainId,
        depositId: cmd.depositId,
        fillDeadline: cmd.fillDeadline,
        exclusivityDeadline: cmd.exclusivityDeadline,
        message: "0x",
      };
      console.log(
        `Order data: ${JSON.stringify(orderData, (_, value) =>
          typeof value === "bigint" ? value.toString() : value,
        )}`,
      );

      const orderId = cmd.orderId;
      console.log(`Order ID: ${orderId}`);
      const originData = encodeRelayData(orderData);
      console.log(`Origin data: ${originData}`);
      const fillerData = encodeAcrossFillerData(cmd.repaymentChainId);
      console.log(`Filler data: ${fillerData}`);

      const across = ZKLinkAcross__factory.connect(cmd.across, filler);
      const tx = await across.fill(orderId, originData, fillerData, {
        gasPrice,
        from: filler.address,
      });
      console.log(`Fill tx: ${tx.hash}`);
    });

  await program.parseAsync(process.argv);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
