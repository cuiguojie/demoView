var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var proxy = require('express-http-proxy');

var projectConfig = require('./config');

// 路由定义 begin
var routes = require('./routes/index');

// 路由定义 end

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// 静态文件目录配置 begin
app.use(projectConfig.localPath.url, express.static(projectConfig.localPath.path));

// 静态文件目录配置 end


app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

app.use(projectConfig.proxy.url, proxy(projectConfig.proxy.path, {
    filter: function(req, res) {
       return req.method == 'GET';
    },
    forwardPath: function(req, res) {
      return require('url').parse(req.url).path;
    }
}));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;