import { Command } from "commander";
import {
  formatUnits,
  JsonRpcProvider,
  parseUnits,
  Wallet,
  ZeroAddress,
} from "ethers";
import { ZKLinkAcross__factory } from "../typechain-types";
import { ACROSS_ORDER_DATA_TYPE_HASH, encodeAcrossOrderData } from "./erc7683";
import { AcrossOrderDataStruct } from "../typechain-types/contracts/ZKLinkAcross";
import { addressToBytes32 } from "./utils";

async function main() {
  const program = new Command();

  program.version("0.1.0").name("open").description("open order");

  program
    .option("--rpc-url <rpc-url>")
    .option("--private-key <private-key>")
    .option("--gas-price <private-key>")
    .option("--across <acorss>")
    .option("--destination-chain-id <destination-chain-id>")
    .option("--recipient <recipient>")
    .option("--input-token <input-token>")
    .option("--output-token <output-token>")
    .option("--input-amount <input-amount>")
    .option("--output-amount <output-amount>")
    .option(
      "--fill-expire <fill-expire>",
      "The fill expire time in seconds",
      "86400",
    )
    .option(
      "--input-token-decimals <input-token-decimals>",
      "The input token decimals",
      "18",
    )
    .option(
      "--output-token-decimals <output-token-decimals>",
      "The input token decimals",
      "18",
    )
    .action(async (cmd) => {
      const provider = new JsonRpcProvider(cmd.rpcUrl);
      const depositor = new Wallet(cmd.privateKey, provider);
      console.log(`Using depositor wallet: ${depositor.address}`);

      const gasPrice = cmd.gasPrice
        ? parseUnits(cmd.gasPrice, "gwei")
        : (await provider.getFeeData()).gasPrice!;
      console.log(`Using gas price: ${formatUnits(gasPrice, "gwei")} gwei`);

      const orderData: AcrossOrderDataStruct = {
        inputToken: cmd.inputToken,
        inputAmount: parseUnits(
          cmd.inputAmount,
          Number(cmd.inputTokenDecimals),
        ),
        outputToken: addressToBytes32(cmd.outputToken),
        outputAmount: parseUnits(
          cmd.outputAmount,
          Number(cmd.outputTokenDecimals),
        ),
        destinationChainId: cmd.destinationChainId,
        recipient: addressToBytes32(cmd.recipient),
        exclusiveRelayer: addressToBytes32(ZeroAddress),
        exclusivityPeriod: 0,
        message: "0x",
      };
      console.log(
        `Order data: ${JSON.stringify(orderData, (_, value) =>
          typeof value === "bigint" ? value.toString() : value,
        )}`,
      );

      const now = BigInt(Math.floor(new Date().getTime() / 1000));
      const fillDeadline = now + BigInt(Number(cmd.fillExpire));
      console.log(`Fill deadline: ${fillDeadline}`);

      const order = {
        fillDeadline: fillDeadline,
        orderDataType: ACROSS_ORDER_DATA_TYPE_HASH,
        orderData: encodeAcrossOrderData(orderData),
      };
      const across = ZKLinkAcross__factory.connect(cmd.across, depositor);
      const tx = await across.open(order, {
        gasPrice,
      });
      console.log(`Open tx: ${tx.hash}`);
    });

  await program.parseAsync(process.argv);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
