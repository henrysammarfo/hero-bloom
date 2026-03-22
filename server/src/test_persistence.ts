import { createAgentWallet, resolveManagedIndex } from "./services/wdk.service.js";
import { assertConfig } from "./config.js";
import fs from "node:fs";
import path from "node:path";

async function test() {
  try {
    assertConfig();
    console.log("Creating first agent wallet...");
    const { address } = await createAgentWallet();
    console.log(`Created: ${address}`);

    const mapPath = path.resolve(process.cwd(), ".circuit-wallet-map.json");
    if (fs.existsSync(mapPath)) {
      console.log(`SUCCESS: Persistence file created at ${mapPath}`);
      const content = fs.readFileSync(mapPath, "utf8");
      console.log("File content:", content);
    } else {
      console.error("FAILURE: Persistence file NOT created.");
    }

    console.log("Verifying resolution from cache/file...");
    const index = await resolveManagedIndex(address as `0x${string}`);
    console.log(`Resolved index: ${index}`);
    if (index !== undefined) {
      console.log("SUCCESS: Index resolved correctly.");
    } else {
      console.error("FAILURE: Index not resolved.");
    }

  } catch (e: any) {
    console.error("Test failed:", e.message);
  }
}

test();
