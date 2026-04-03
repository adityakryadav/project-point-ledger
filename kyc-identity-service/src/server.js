const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const healthRoutes = require("./routes/health.routes");
const nsdlPanRoutes = require("./routes/nsdl_pan.routes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/", healthRoutes);
app.use("/api/v1/kyc/pan", nsdlPanRoutes);

app.listen(PORT, () => {
  console.log(`kyc-identity-service running on port ${PORT}`);
});

