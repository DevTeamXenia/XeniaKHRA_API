const dashboardService = require('../services/dashboardService');


exports.getAllStateWiseDetails = async (req, res, next) => {
    try {
        const districtid = req.query.districtid;
        const dateid = req.query.dateid;
        const fromdate = req.query.fromdate;
        const todate = req.query.todate;
        const dashboard = await dashboardService.getAllStateWiseDetails(districtid, dateid, fromdate, todate);
        res.json(dashboard);
    } catch (error) {
        next(error);
    }
};


exports.getAllDistrictWiseDetails = async (req, res, next) => {
    try {
        const { districtid, unitid, dateid, fromdate, todate } = req.query;
        const dashboard = await dashboardService.getAllDistrictWiseDetails(districtid, unitid, dateid, fromdate, todate);
        res.json(dashboard);
    } catch (error) {
        next(error);
    }
};



exports.getAllUnitWiseDetails = async (req, res, next) => {
    try {
        const { unitid, dateid, fromdate, todate } = req.query; 
        const dashboard = await dashboardService.getAllUnitWiseDetails(unitid, dateid, fromdate, todate);
        res.json(dashboard);
    } catch (error) {
        next(error);
    }
};



exports.getAllStateWiseGraphDetails = async (req, res, next) => {
    try {
        const districtid = req.query.districtid;
        const dateid = req.query.dateid;
        const fromdate = req.query.fromdate;
        const todate = req.query.todate;
        const dashboard = await dashboardService.getAllStateWiseGraphDetails(districtid, dateid, fromdate, todate);
        res.json(dashboard);
    } catch (error) {
        next(error);
    }
};


exports.getAllDistrictWiseGraphDetails = async (req, res, next) => {
    try {
        const { districtid, unitid, dateid, fromdate, todate } = req.query;
        const dashboard = await dashboardService.getAllDistrictWiseGraphDetails(districtid, unitid, dateid, fromdate, todate);
        res.json(dashboard);
    } catch (error) {
        next(error);
    }
};





exports.getAllStateWiseDetailsAndGraph = async (req, res, next) => {
    try {
        const districtid = req.query.districtid;
        const dateid = req.query.dateid;
        const fromdate = req.query.fromdate;
        const todate = req.query.todate;

        const dashboard = await dashboardService.getAllStateWiseDetailsAndGraph(districtid, dateid, fromdate, todate);

        res.json(dashboard);
    } catch (error) {
        next(error);
    }
};


exports.getAllDistrictWiseDetailsAndGraph = async (req, res, next) => {
    try {
        const districtid = req.query.districtid;
        const unitid = req.query.unitid;
        const dateid = req.query.dateid;
        const fromdate = req.query.fromdate;
        const todate = req.query.todate;

        const dashboard = await dashboardService.getAllDistrictWiseDetailsAndGraph(districtid, unitid, dateid, fromdate, todate);

        res.json(dashboard);
    } catch (error) {
        next(error);
    }
};