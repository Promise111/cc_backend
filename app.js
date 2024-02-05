const express = require("express");
const app = express();
require("dotenv").config();
require("./src/db/connection")();
const cors = require("cors");
const errorHandler = require("./src/middlewares/error.middleware");
const userRoutes = require("./src/user/user.routes");
const adminRoutes = require("./src/admin/admin.routes");
const PORT = process.env.PORT || 8001;
const path = require("path");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

app.listen(PORT, () => console.log("Listening on port " + PORT));
