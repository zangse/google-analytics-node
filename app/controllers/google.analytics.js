import { google } from 'googleapis';
// key.json文件是从google分析下载的jwt密钥文件
import key from '../config/key.json';
import { analyticsConfig } from '../config/index';
import * as redisClient from '../middleware/redis.middleware';
import { dateFormat } from '../utils/index'
const viewId = analyticsConfig.viewId;
const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key, ['https://www.googleapis.com/auth/analytics', 'https://www.googleapis.com/auth/analytics.readonly'],
    null
);
// 错误回调
function returnError(res, err) {
    console.log(err);
    return res.json({
        code: '2000',
        status: 'error',
        data: err.errno
    })
}
// 成功回调
function returnSuccess(res, data) {
    res.json({
        code: '0000',
        status: 'success',
        data: data
    })
}

function configOptions(metrics, dimensions, startDate, endDate = 'today', empty = false, filters, sort) {
    let options = {
        'auth': jwtClient,
        'ids': viewId,
        'metrics': metrics,
        'dimensions': dimensions,
        'start-date': startDate,
        'end-date': endDate,
        'max-results': 100,
        'include-empty-rows':empty
    }
    if (filters) {
        options.filters = filters;
    }
    if (sort) {
        options.sort = sort;
    }
    return options;
}
async function queryData(options) {
    return new Promise((resolve, reject) => {
        google.analytics('v3').data.ga.get(options, async(err, response) => {
            if (err) {
                console.log(err)
                reject(err);
            } else {
                resolve(response)
            }
        })
    })
}


class googleAnalytics {
    constructor() {
        this.googleAuth = this.googleAuth.bind(this);
    }
    async googleAuth(req, res, next) {
        redisClient.getItem('googleAtuhToken', function(error, data) {
            if (data) {
                next();
            } else {
                jwtClient.authorize((err, tokens) => {
                    if (err) {
                        returnSuccess(res, "auth:::" + err.errno);
                    }
                    console.log("-----tokens-----" + tokens)
                    redisClient.setItem('googleAtuhToken', tokens.access_token, 59 * 60)
                    next();
                });
            }
        })
    }
    async redisData(req, res, next) {
        let key = req.url;
        redisClient.getItem(key, function(error, data) {
            if (data) {
                returnSuccess(res, JSON.parse(data));
            } else {
                next();
            }
        })
    }
    async userChart(req, res, next) {
        console.log('userChart')
        console.log(req.url)
        let redisKey = req.url;
        const dimensions = 'ga:date';
        const metrics = 'ga:users,ga:newUsers,ga:pageviews,ga:avgTimeOnPage'
        const startDate = dateFormat(new Date(), 'YYYY-MM-DD', -30);
        const endDate = dateFormat(new Date(), 'YYYY-MM-DD');
        let options = configOptions(metrics, dimensions, startDate, endDate, true)
        queryData(options).then((response) => {
            let responseData = {};
            let headers = response.data.columnHeaders;
            headers.splice(0, 1);
            let rows = response.data.rows;
            responseData.legend = headers.map((item, index) => {
                return item.name;
            })
            responseData.xAxis = rows.map((item) => {
                return item[0];
            })
            responseData.series = []
            responseData.totalData = response.data.totalsForAllResults;
            let headerlength = headers.length;
            let rowlength = rows.length;
            for (let i = 0; i < headerlength; i++) {
                let item = {};
                item.name = headers[i].name;
                item.type = 'line';
                item.data = [];
                for (let j = 0; j < rowlength; j++) {
                    item.data.push(new Number(rows[j][i + 1]))
                }
                responseData.series.push(item);
            }
            redisClient.setItem(redisKey, JSON.stringify(responseData), 60 * 60 * 23)
            returnSuccess(res, responseData)
        }, (err) => {
            console.log("---err")
            returnError(res, err);
        });

    }
    async cityChart(req, res, next) {
        console.log('cityChart')
        console.log(req.url)
        let redisKey = req.url;
        let dimensions = 'ga:country';
        if (req.query.cityType) {
            console.log(req.query.cityType)
            console.log(dimensions)
            dimensions = req.query.cityType;
        }
        const metrics = 'ga:users'
        const startDate = '2018-04-15';
        const endDate = "today";
        let filters = 'ga:city!=(not set)';
        let options = configOptions(metrics, dimensions, startDate, endDate, true, filters)
        queryData(options).then((response) => {
            console.log("response ----")
            console.log(response.data)
            let responseData = {};
            responseData.totalData = response.data.totalsForAllResults;
            responseData.rows = response.data.rows;
            let headers = response.data.columnHeaders;
            responseData.headers = headers.map((item, index) => {
                return item.name;
            })
            redisClient.setItem(redisKey, JSON.stringify(responseData), 60 * 60 * 23)
            returnSuccess(res, responseData)
        }, (err) => {
            console.log("---err")
            returnError(res, err);
        });
    }
    async deviceChart(req, res, next) {
        let redisKey = req.url;
        let dimensions = 'ga:browser';
        const metrics = 'ga:users'
        const startDate = '2018-04-15';
        const endDate = "today";
        let options = configOptions(metrics, dimensions, startDate, endDate, true, 'ga:browser!=(not set)')
        queryData(options).then((response) => {
            console.log("response ----")
            let responseData = {};
            responseData.totalData = response.data.totalsForAllResults;
            responseData.rows = response.data.rows;
            let headers = response.data.columnHeaders;
            responseData.headers = headers.map((item, index) => {
                return item.name;
            })
            redisClient.setItem(redisKey, JSON.stringify(responseData), 60 * 60 * 23)
            res.json({
                code: '0000',
                status: 'success',
                data: responseData
            })
        }, (err) => {
            console.log("---err")
            returnError(res, err);
        });
    }

    async pageViewData(req, res, next) {
        let redisKey = req.url;
        const metrics = 'ga:users,ga:newUsers,ga:pageviews,ga:timeOnPage'
        const dimensions = 'ga:pagePath,ga:pageTitle';
        // const dimensions = 'ga:hour';
        const startDate = '2018-04-15';
        const endDate = "today";
        let options = configOptions(metrics, dimensions, startDate, endDate, false)
        queryData(options).then((response) => {
            console.log("response ----")
            let responseData = {};
            let rows = response.data.rows;
            let headers = response.data.columnHeaders.map((item, index) => {
                return item.name;
            });
            console.log(rows)
            let result = rows.map((ele, index) => {
                let obj = {};
                headers.map((item, current) => {
                    let name = item.substr(3);
                    obj[name] = ele[current];
                    return obj[name];
                })
                return obj
            })
            redisClient.setItem(redisKey, JSON.stringify(result), 60 * 60 * 1);
            returnSuccess(res, result)
        }, (err) => {
            console.log("---err")
            returnError(res, err);
        });
    }
    async pageTimeData(req, res, next) {
        let redisKey = req.url;
        const metrics = 'ga:users,ga:newUsers,ga:pageviews,ga:timeOnPage'
        const dimensions = 'ga:hour';
        const startDate = '2018-04-15';
        const endDate = "today";
        let options = configOptions(metrics, dimensions, startDate, endDate, false)
        console.log(options)
        queryData(options).then((response) => {
            console.log("response ----")
            let responseData = {};
            let rows = response.data.rows;
            let headers = response.data.columnHeaders.map((item, index) => {
                return item.name;
            });
            let result = rows.map((ele, index) => {
                let obj = {};
                headers.map((item, current) => {
                    let name = item.substr(3)
                    obj[name] = ele[current];
                    return obj[name];
                })
                return obj
            })
            redisClient.setItem(redisKey, JSON.stringify(result), 60 * 60 * 1);
            returnSuccess(res, result)
        }, (err) => {
            console.log("---err")
            returnError(res, err);
        });
    }
     async pageAreaData(req, res, next) {
        let redisKey = req.url;
        const metrics = 'ga:users,ga:newUsers,ga:pageviews,ga:timeOnPage'
        const dimensions = 'ga:country,ga:city,ga:language';
        const startDate = '2018-04-15';
        const endDate = "today";
        let options = configOptions(metrics, dimensions, startDate, endDate, false)
        queryData(options).then((response) => {
            console.log("response ----")
            let responseData = {};
            let rows = response.data.rows;
            let headers = response.data.columnHeaders.map((item, index) => {
                return item.name;
            });
            let result = rows.map((ele, index) => {
                let obj = {};
                headers.map((item, current) => {
                    let name = item.substr(3)
                    obj[name] = ele[current];
                    return obj[name];
                })
                return obj
            })
            redisClient.setItem(redisKey, JSON.stringify(result), 60 * 60 * 1);
            returnSuccess(res, result)
        }, (err) => {
            console.log("---err")
            returnError(res, err);
        });
    }

}
export default new googleAnalytics();