// MIDDLEWARE
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
// ROUTES + CONFIGS
const authRouter = require("./server/routes/auth")
const { IS_TESTING } = require("./server/utils/config");
const { NotFoundError } = require("./server/utils/errors");
//USING MIDDLEWARE
const app = express();
app.use(cors()); // cross origin resource sharing *need to restrict only to origin hosting front-end*
app.use(express.json()); // json pre-processing
app.use(morgan("tiny")); // console logging
// ROUTES
app.use("/auth", authRouter); // authentication routes handler
// app.use("/user", userRouter); // TO BE IMPLEMENTED
// health check
app.get("/",  (req, res) => {
    return res.status(200).json({
      ping: "pong",
    })
  })
/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
    return next(new NotFoundError())
})
/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
    if (!config.IS_TESTING) console.error(err.stack)
    const status = err.status || 500
    const message = err.message

    return res.status(status).json({
        error: { message, status },
    })
})
  
  module.exports = app