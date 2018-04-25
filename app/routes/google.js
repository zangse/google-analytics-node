'use strict';
import express from 'express';
import bodyParser from 'body-parser';
import googleAnalytics from '../controllers/google.analytics.js'
const router = express.Router();
router.get('/userChart', googleAnalytics.googleAuth, googleAnalytics.redisData, googleAnalytics.userChart);
router.get('/cityChart', googleAnalytics.googleAuth, googleAnalytics.redisData, googleAnalytics.cityChart);
router.get('/deviceChart', googleAnalytics.googleAuth, googleAnalytics.redisData, googleAnalytics.deviceChart);
router.get('/pageViewData', googleAnalytics.googleAuth, googleAnalytics.redisData, googleAnalytics.pageViewData);
router.get('/pageTimeData', googleAnalytics.googleAuth, googleAnalytics.redisData, googleAnalytics.pageTimeData);
router.get('/pageAreaData', googleAnalytics.googleAuth, googleAnalytics.redisData, googleAnalytics.pageAreaData);

export default router;