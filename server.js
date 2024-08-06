const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./config/swaggerConfig');
const path = require("path");
const cors = require("cors");


const app = express();
require('dotenv').config();

const authRoutes = require("./routes/authRoutes");
const unitRoutes = require("./routes/unitRoutes");
const districtRoutes = require("./routes/districtRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const memberRoutes = require("./routes/memberRoutes");
const nomineeRoutes = require("./routes/nomineeRoutes");
const reportRoutes = require("./routes/reportRoutes");
const statusRoutes = require("./routes/statusRoutes");
const contributionRoutes = require("./routes/contributionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const informationRoutes = require("./routes/informationRoutes");
const advertisementRoutes = require("./routes/advertisementRoutes");


app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "views")));
app.get("/", (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "views", "index.html"));
  } catch (error) {
    console.error("Error rendering HTML page:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/v1/api/user", authRoutes);
app.use("/v1/api/unit", unitRoutes);
app.use("/v1/api/district", districtRoutes);
app.use("/v1/api/payment", paymentRoutes);
app.use("/v1/api/member", memberRoutes);
app.use("/v1/api/nominee", nomineeRoutes);
app.use("/v1/api/report", reportRoutes);
app.use("/v1/api/status", statusRoutes);
app.use("/v1/api/contribution", contributionRoutes);
app.use("/v1/api/dashboard", dashboardRoutes);
app.use("/v1/api/information", informationRoutes);
app.use("/v1/api/advertisement", advertisementRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
