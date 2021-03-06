const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morganlogger = require('morgan');
const cron = require('node-cron');
const logger = require('./logger');
const expressWinston = require('express-winston');
const graphqlHTTP = require('express-graphql');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const categoriesRouter = require('./routes/categories');
const friendsRouter = require('./routes/friends');
const pushRouter = require('./routes/push');
const agreementsRouter = require('./routes/agreements');
const dailyAuthenticationsRouter = require('./routes/dailyAuthentications');
const dailyJudgesRouter = require('./routes/dailyJudges');
const plansRouter = require('./routes/plans');
const pointsRouter = require('./routes/points');
const noticesRouter = require('./routes/notices');
const planTemplatesRouter = require('./routes/planTemplates');
const detailedCategoriesRouter = require('./routes/detailedCategories');
const customerMessagesRouter = require('./routes/customerMessage');
const reportJudgesRouter = require('./routes/reportJudges');
const testRouter = require('./routes/test');
const pushTestRouter = require('./routes/push_test');
const {GraphQLSchema} = require('graphql');
const bodyParser = require('body-parser');
const swaggerOption = require('./routes/swagger');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerSpec = swaggerJSDoc(swaggerOption);
const swaggerUi = require('swagger-ui-express');
const paginate = require('express-paginate');
const dailyJudgeAfterOneday = require('./cron_jobs/dailyJudgeAfterOneday.js');
const planEndAfterEndDate = require('./cron_jobs/planEndAfterEndDate.js');
const planEndOutofPoint = require('./cron_jobs/planEndOutofPoint.js');
var options = {
    exclude: ["users"]
};
const {generateSchema} = require('sequelize-graphql-schema')(options);

const models = require('./models');

var app = express();
app.disable('etag');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(morganlogger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/categories', categoriesRouter);
app.use('/friends', friendsRouter);
app.use('/test', testRouter);
app.use('/push', pushRouter);
app.use('/notices', noticesRouter);
app.use('/push_test', pushTestRouter);
app.use('/points', pointsRouter);
app.use('/agreements',agreementsRouter);
app.use('/plan_templates', planTemplatesRouter);
app.use('/daily_judges', dailyJudgesRouter);
app.use('/report_judges', reportJudgesRouter);
app.use('/daily_authentications', dailyAuthenticationsRouter);
app.use('/customer_service',customerMessagesRouter);
app.use('/plans', plansRouter);
app.use('/detailedCategories',detailedCategoriesRouter);

app.use('/graphql', graphqlHTTP({
    schema: new GraphQLSchema(generateSchema(models)),
    graphiql: true,
}));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(expressWinston.logger({ // use logger to log every requests
    transports: [logger],
    meta: false, // optional: control whether you want to log the meta data about the request (default to true)
    msg: `{{req.ip}} - {{res.statusCode}} - {{req.method}} - {{res.responseTime}}ms - {{req.url}} - {{req.headers['user-agent']}}`,
    // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: false, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: true
}));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

cron.schedule('0 * * * *', function(){
    dailyJudgeAfterOneday.authIsDone()
});
cron.schedule('10 * * * *', function(){
    planEndAfterEndDate.planEndAfterEndDate()
});
cron.schedule('20 * * * *', function(){
    planEndOutofPoint.planEndOutofPoint()
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
//
// app.listen(3000, function() {
//     console.log('RUNNING ON 8080. Graphiql http://localhost:8080/graphql')
// })
module.exports = app;
