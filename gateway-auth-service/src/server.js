const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const healthRoutes = require("./routes/health.routes");
const { requestLogger } = require("./middleware");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use("/", healthRoutes);

app.listen(PORT, () => {
  console.log(`gateway-auth-service running on port ${PORT}`);
});
