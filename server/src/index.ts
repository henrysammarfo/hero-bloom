/**
 * CIRCUIT backend: Express API + WDK (draw/repay) + autonomous repayment monitor.
 */
import cors from "cors";
import express from "express";
import { assertConfig, config } from "./config.js";
import { agentsRouter } from "./routes/agents.js";
import { opportunitiesRouter } from "./routes/opportunities.js";
import { operatorRouter } from "./routes/operator.js";
import { poolRouter } from "./routes/pool.js";
import { startRepaymentMonitor } from "./services/repayment.service.js";
import { startAgentStrategyService } from "./services/agent.strategy.service.js";

assertConfig();

const app = express();
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "circuit-api" });
});

app.use("/agent", agentsRouter);
app.use("/opportunities", opportunitiesRouter);
app.use("/operator", operatorRouter);
app.use("/pool", poolRouter);

app.listen(config.port, () => {
  console.log(`CIRCUIT API listening on http://localhost:${config.port}`);
  startRepaymentMonitor();
  startAgentStrategyService();
});
