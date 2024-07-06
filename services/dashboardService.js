
const db = require('../config/db');

exports.getAllStateWiseDetails = async (districtid, dateid, fromdate, todate) => {
    try {
        const pool = await db;

        let baseQuery = `
            SELECT
                COUNT(CASE WHEN t.memberStatus IN (2, 3, 4, 5, 6, 7) THEN 1 END) AS NewMemberships_All,
                COUNT(CASE WHEN t.memberStatus IN (6, 7) THEN 1 END) AS PendingMemberships_All,
                COUNT(CASE WHEN t.memberStatus = 7 THEN 1 END) AS PendingDistrictLevel_All
            FROM
                KHRA_Members t
            JOIN KHRA_Users F ON F.userId = t.memberUserId
            JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
            JOIN KHRA_Units u ON u.unitId = t.memberUnitId
            WHERE t.memberId IS NOT NULL
        `;

        if (districtid) {
            baseQuery += ` AND t.memberDistrictId = @districtid`;
        }

        if (fromdate && todate) {
            baseQuery += ` AND t.membershipDate BETWEEN @fromdate AND @todate`;
        }

        let dateCondition = '';
        let selectPart = '';

        switch (dateid) {
            case '1':
                selectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (2, 3, 4, 5, 6, 7) AND CONVERT(date, t.membershipDate) = CONVERT(date, GETDATE()) THEN 1 END) AS NewMemberships_Today,
                    COUNT(CASE WHEN t.memberStatus IN (6, 7) AND CONVERT(date, t.membershipDate) = CONVERT(date, GETDATE()) THEN 1 END) AS PendingMemberships_Today,
                    COUNT(CASE WHEN t.memberStatus = 7 AND CONVERT(date, t.membershipDate) = CONVERT(date, GETDATE()) THEN 1 END) AS PendingDistrictLevel_Today
                `;
                break;
            case '2':
                selectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (2, 3, 4, 5, 6, 7) AND t.membershipDate >= DATEADD(day, -7, GETDATE()) THEN 1 END) AS NewMemberships_LastWeek,
                    COUNT(CASE WHEN t.memberStatus IN (6, 7) AND t.membershipDate >= DATEADD(day, -7, GETDATE()) THEN 1 END) AS PendingMemberships_LastWeek,
                    COUNT(CASE WHEN t.memberStatus = 7 AND t.membershipDate >= DATEADD(day, -7, GETDATE()) THEN 1 END) AS PendingDistrictLevel_LastWeek
                `;
                break;
            case '3':
                selectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (2, 3, 4, 5, 6, 7) AND t.membershipDate >= DATEADD(month, -1, GETDATE()) THEN 1 END) AS NewMemberships_LastMonth,
                    COUNT(CASE WHEN t.memberStatus IN (6, 7) AND t.membershipDate >= DATEADD(month, -1, GETDATE()) THEN 1 END) AS PendingMemberships_LastMonth,
                    COUNT(CASE WHEN t.memberStatus = 7 AND t.membershipDate >= DATEADD(month, -1, GETDATE()) THEN 1 END) AS PendingDistrictLevel_LastMonth
                `;
                break;
            case '4':
                selectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (2, 3, 4, 5, 6, 7) AND t.membershipDate >= DATEADD(year, -1, GETDATE()) THEN 1 END) AS NewMemberships_LastYear,
                    COUNT(CASE WHEN t.memberStatus IN (6, 7) AND t.membershipDate >= DATEADD(year, -1, GETDATE()) THEN 1 END) AS PendingMemberships_LastYear,
                    COUNT(CASE WHEN t.memberStatus = 7 AND t.membershipDate >= DATEADD(year, -1, GETDATE()) THEN 1 END) AS PendingDistrictLevel_LastYear
                `;
                break;
            case '5':
                selectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (2, 3, 4, 5, 6, 7) THEN 1 END) AS NewMemberships,
                    COUNT(CASE WHEN t.memberStatus IN (6, 7) THEN 1 END) AS PendingMemberships,
                    COUNT(CASE WHEN t.memberStatus = 7 THEN 1 END) AS PendingDistrictLevel
                `;
                break;
        }

        let dataQuery = baseQuery;
        if (selectPart) {
            dataQuery = `
                SELECT
                    ${selectPart}
                FROM
                    KHRA_Members t
                JOIN KHRA_Users F ON F.userId = t.memberUserId
                JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
                JOIN KHRA_Units u ON u.unitId = t.memberUnitId
                WHERE t.memberId IS NOT NULL
                ${districtid ? ` AND t.memberDistrictId = @districtid` : ''}
                ${fromdate && todate ? ` AND t.membershipDate BETWEEN @fromdate AND @todate` : ''}
            `;
        }

        const request = pool.request();
        if (districtid) {
            request.input('districtid', districtid);
        }
        if (fromdate && todate) {
            request.input('fromdate', fromdate);
            request.input('todate', todate);
        }

        const result = await request.query(dataQuery);
        const data = result.recordset[0];

        let responseData = {};
        if (!dateid) {
            responseData = {
                All: {
                    NewMemberships_All: data.NewMemberships_All,
                    PendingMemberships_All: data.PendingMemberships_All,
                    PendingDistrictLevel_All: data.PendingDistrictLevel_All
                }
            };
        } else if (dateid === '1') {
            responseData = {
                Today: {
                    NewMemberships_Today: data.NewMemberships_Today,
                    PendingMemberships_Today: data.PendingMemberships_Today,
                    PendingDistrictLevel_Today: data.PendingDistrictLevel_Today
                }
            };
        } else if (dateid === '2') {
            responseData = {
                LastWeek: {
                    NewMemberships_LastWeek: data.NewMemberships_LastWeek,
                    PendingMemberships_LastWeek: data.PendingMemberships_LastWeek,
                    PendingDistrictLevel_LastWeek: data.PendingDistrictLevel_LastWeek
                }
            };
        } else if (dateid === '3') {
            responseData = {
                LastMonth: {
                    NewMemberships_LastMonth: data.NewMemberships_LastMonth,
                    PendingMemberships_LastMonth: data.PendingMemberships_LastMonth,
                    PendingDistrictLevel_LastMonth: data.PendingDistrictLevel_LastMonth
                }
            };
        } else if (dateid === '4') {
            responseData = {
                LastYear: {
                    NewMemberships_LastYear: data.NewMemberships_LastYear,
                    PendingMemberships_LastYear: data.PendingMemberships_LastYear,
                    PendingDistrictLevel_LastYear: data.PendingDistrictLevel_LastYear
                }
            };
        } else if (dateid === '5') {
            responseData = {
                CustomRange: {
                    NewMemberships: data.NewMemberships,
                    PendingMemberships: data.PendingMemberships,
                    PendingDistrictLevel: data.PendingDistrictLevel
                }
            };
        }

        const response = {
            status: "success",
            data: [responseData]
        };

        return response;

    } catch (error) {
        throw error;
    }
};



exports.getAllDistrictWiseDetails = async (districtid, unitid, dateid, fromdate, todate) => {
    try {
        const pool = await db;

        let baseQuery = `
            SELECT
                COUNT(CASE WHEN t.memberStatus IN (2, 3, 4, 5, 6, 7) THEN 1 END) AS NewMemberships_All,
                COUNT(CASE WHEN t.memberStatus IN (6, 7) THEN 1 END) AS PendingMemberships_All,
                COUNT(CASE WHEN t.memberStatus = 7 THEN 1 END) AS PendingDistrictLevel_All
            FROM
                KHRA_Members t
            JOIN KHRA_Users F ON F.userId = t.memberUserId
            JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
            JOIN KHRA_Units u ON u.unitId = t.memberUnitId
            WHERE t.memberId IS NOT NULL
        `;

        if (districtid) {
            baseQuery += ` AND t.memberDistrictId = @districtid`;
        }

        if (unitid) {
            baseQuery += ` AND t.memberUnitId = @unitid`;
        }

        if (fromdate && todate) {
            baseQuery += ` AND t.membershipDate BETWEEN @fromdate AND @todate`;
        }

        let selectPart = '';

        switch (dateid) {
            case '1':
                selectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (2, 3, 4, 5, 6, 7) AND CONVERT(date, t.membershipDate) = CONVERT(date, GETDATE()) THEN 1 END) AS NewMemberships_Today,
                    COUNT(CASE WHEN t.memberStatus IN (6, 7) AND CONVERT(date, t.membershipDate) = CONVERT(date, GETDATE()) THEN 1 END) AS PendingMemberships_Today,
                    COUNT(CASE WHEN t.memberStatus = 7 AND CONVERT(date, t.membershipDate) = CONVERT(date, GETDATE()) THEN 1 END) AS PendingDistrictLevel_Today
                `;
                break;
            case '2':
                selectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (2, 3, 4, 5, 6, 7) AND t.membershipDate >= DATEADD(day, -7, GETDATE()) THEN 1 END) AS NewMemberships_LastWeek,
                    COUNT(CASE WHEN t.memberStatus IN (6, 7) AND t.membershipDate >= DATEADD(day, -7, GETDATE()) THEN 1 END) AS PendingMemberships_LastWeek,
                    COUNT(CASE WHEN t.memberStatus = 7 AND t.membershipDate >= DATEADD(day, -7, GETDATE()) THEN 1 END) AS PendingDistrictLevel_LastWeek
                `;
                break;
            case '3':
                selectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (2, 3, 4, 5, 6, 7) AND t.membershipDate >= DATEADD(month, -1, GETDATE()) THEN 1 END) AS NewMemberships_LastMonth,
                    COUNT(CASE WHEN t.memberStatus IN (6, 7) AND t.membershipDate >= DATEADD(month, -1, GETDATE()) THEN 1 END) AS PendingMemberships_LastMonth,
                    COUNT(CASE WHEN t.memberStatus = 7 AND t.membershipDate >= DATEADD(month, -1, GETDATE()) THEN 1 END) AS PendingDistrictLevel_LastMonth
                `;
                break;
            case '4':
                selectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (2, 3, 4, 5, 6, 7) AND t.membershipDate >= DATEADD(year, -1, GETDATE()) THEN 1 END) AS NewMemberships_LastYear,
                    COUNT(CASE WHEN t.memberStatus IN (6, 7) AND t.membershipDate >= DATEADD(year, -1, GETDATE()) THEN 1 END) AS PendingMemberships_LastYear,
                    COUNT(CASE WHEN t.memberStatus = 7 AND t.membershipDate >= DATEADD(year, -1, GETDATE()) THEN 1 END) AS PendingDistrictLevel_LastYear
                `;
                break;
            case '5':
                selectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (2, 3, 4, 5, 6, 7) THEN 1 END) AS NewMemberships,
                    COUNT(CASE WHEN t.memberStatus IN (6, 7) THEN 1 END) AS PendingMemberships,
                    COUNT(CASE WHEN t.memberStatus = 7 THEN 1 END) AS PendingDistrictLevel
                `;
                break;
        }

        let dataQuery = baseQuery;
        if (selectPart) {
            dataQuery = `
                SELECT
                    ${selectPart}
                FROM
                    KHRA_Members t
                JOIN KHRA_Users F ON F.userId = t.memberUserId
                JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
                JOIN KHRA_Units u ON u.unitId = t.memberUnitId
                WHERE t.memberId IS NOT NULL
                ${districtid ? ` AND t.memberDistrictId = @districtid` : ''}
                ${unitid ? ` AND t.memberUnitId = @unitid` : ''}
                ${fromdate && todate ? ` AND t.membershipDate BETWEEN @fromdate AND @todate` : ''}
            `;
        }

        const request = pool.request();
        if (districtid) request.input('districtid', districtid);
        if (unitid) request.input('unitid', unitid);
        if (fromdate && todate) {
            request.input('fromdate', fromdate);
            request.input('todate', todate);
        }

        const result = await request.query(dataQuery);
        const data = result.recordset[0];

        let responseData = {};
        if (!dateid) {
            responseData = {
                All: {
                    NewMemberships_All: data.NewMemberships_All,
                    PendingMemberships_All: data.PendingMemberships_All,
                    PendingDistrictLevel_All: data.PendingDistrictLevel_All
                }
            };
        } else if (dateid === '1') {
            responseData = {
                Today: {
                    NewMemberships_Today: data.NewMemberships_Today,
                    PendingMemberships_Today: data.PendingMemberships_Today,
                    PendingDistrictLevel_Today: data.PendingDistrictLevel_Today
                }
            };
        } else if (dateid === '2') {
            responseData = {
                LastWeek: {
                    NewMemberships_LastWeek: data.NewMemberships_LastWeek,
                    PendingMemberships_LastWeek: data.PendingMemberships_LastWeek,
                    PendingDistrictLevel_LastWeek: data.PendingDistrictLevel_LastWeek
                }
            };
        } else if (dateid === '3') {
            responseData = {
                LastMonth: {
                    NewMemberships_LastMonth: data.NewMemberships_LastMonth,
                    PendingMemberships_LastMonth: data.PendingMemberships_LastMonth,
                    PendingDistrictLevel_LastMonth: data.PendingDistrictLevel_LastMonth
                }
            };
        } else if (dateid === '4') {
            responseData = {
                LastYear: {
                    NewMemberships_LastYear: data.NewMemberships_LastYear,
                    PendingMemberships_LastYear: data.PendingMemberships_LastYear,
                    PendingDistrictLevel_LastYear: data.PendingDistrictLevel_LastYear
                }
            };
        } else if (dateid === '5') {
            responseData = {
                CustomRange: {
                    NewMemberships: data.NewMemberships,
                    PendingMemberships: data.PendingMemberships,
                    PendingDistrictLevel: data.PendingDistrictLevel
                }
            };
        }

        const response = {
            status: "success",
            data: [responseData]
        };

        return response;

    } catch (error) {
        throw error;
    }
};



exports.getAllUnitWiseDetails = async (unitid, dateid, fromdate, todate) => {
    try {
        const pool = await db;

        let baseQuery = `
            SELECT
                COUNT(CASE WHEN t.memberStatus IN (2, 3, 4, 5, 6, 7) THEN 1 END) AS NewMemberships_All,
                COUNT(CASE WHEN t.memberStatus IN (6, 7) THEN 1 END) AS PendingMemberships_All,
                COUNT(CASE WHEN t.memberStatus = 7 THEN 1 END) AS PendingDistrictLevel_All
            FROM
                KHRA_Members t
            JOIN KHRA_Users F ON F.userId = t.memberUserId
            JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
            JOIN KHRA_Units u ON u.unitId = t.memberUnitId
            WHERE t.memberId IS NOT NULL AND t.memberUnitId = @unitid
        `;

        if (fromdate && todate) {
            baseQuery += ` AND t.membershipDate BETWEEN @fromdate AND @todate`;
        }

        let selectPart = '';

        switch (dateid) {
            case '1':
                selectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (2, 3, 4, 5, 6, 7) AND CONVERT(date, t.membershipDate) = CONVERT(date, GETDATE()) THEN 1 END) AS NewMemberships_Today,
                    COUNT(CASE WHEN t.memberStatus IN (6, 7) AND CONVERT(date, t.membershipDate) = CONVERT(date, GETDATE()) THEN 1 END) AS PendingMemberships_Today,
                    COUNT(CASE WHEN t.memberStatus = 7 AND CONVERT(date, t.membershipDate) = CONVERT(date, GETDATE()) THEN 1 END) AS PendingDistrictLevel_Today
                `;
                break;
            case '2':
                selectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (2, 3, 4, 5, 6, 7) AND t.membershipDate >= DATEADD(day, -7, GETDATE()) THEN 1 END) AS NewMemberships_LastWeek,
                    COUNT(CASE WHEN t.memberStatus IN (6, 7) AND t.membershipDate >= DATEADD(day, -7, GETDATE()) THEN 1 END) AS PendingMemberships_LastWeek,
                    COUNT(CASE WHEN t.memberStatus = 7 AND t.membershipDate >= DATEADD(day, -7, GETDATE()) THEN 1 END) AS PendingDistrictLevel_LastWeek
                `;
                break;
            case '3':
                selectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (2, 3, 4, 5, 6, 7) AND t.membershipDate >= DATEADD(month, -1, GETDATE()) THEN 1 END) AS NewMemberships_LastMonth,
                    COUNT(CASE WHEN t.memberStatus IN (6, 7) AND t.membershipDate >= DATEADD(month, -1, GETDATE()) THEN 1 END) AS PendingMemberships_LastMonth,
                    COUNT(CASE WHEN t.memberStatus = 7 AND t.membershipDate >= DATEADD(month, -1, GETDATE()) THEN 1 END) AS PendingDistrictLevel_LastMonth
                `;
                break;
            case '4':
                selectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (2, 3, 4, 5, 6, 7) AND t.membershipDate >= DATEADD(year, -1, GETDATE()) THEN 1 END) AS NewMemberships_LastYear,
                    COUNT(CASE WHEN t.memberStatus IN (6, 7) AND t.membershipDate >= DATEADD(year, -1, GETDATE()) THEN 1 END) AS PendingMemberships_LastYear,
                    COUNT(CASE WHEN t.memberStatus = 7 AND t.membershipDate >= DATEADD(year, -1, GETDATE()) THEN 1 END) AS PendingDistrictLevel_LastYear
                `;
                break;
            case '5':
                selectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (2, 3, 4, 5, 6, 7) THEN 1 END) AS NewMemberships,
                    COUNT(CASE WHEN t.memberStatus IN (6, 7) THEN 1 END) AS PendingMemberships,
                    COUNT(CASE WHEN t.memberStatus = 7 THEN 1 END) AS PendingDistrictLevel
                `;
                break;
        }

        let dataQuery = baseQuery;
        if (selectPart) {
            dataQuery = `
                SELECT
                    ${selectPart}
                FROM
                    KHRA_Members t
                JOIN KHRA_Users F ON F.userId = t.memberUserId
                JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
                JOIN KHRA_Units u ON u.unitId = t.memberUnitId
                WHERE t.memberId IS NOT NULL            
                ${unitid ? ` AND t.memberUnitId = @unitid` : ''}
                ${fromdate && todate ? ` AND t.membershipDate BETWEEN @fromdate AND @todate` : ''}
            `;
        }

        const request = pool.request();
        if (unitid) request.input('unitid', unitid);
        if (fromdate && todate) {
            request.input('fromdate', fromdate);
            request.input('todate', todate);
        }

        const result = await request.query(dataQuery);
        const data = result.recordset[0];

        let responseData = {};
        if (!dateid) {
            responseData = {
                All: {
                    NewMemberships_All: data.NewMemberships_All,
                    PendingMemberships_All: data.PendingMemberships_All,
                    PendingDistrictLevel_All: data.PendingDistrictLevel_All
                }
            };
        } else if (dateid === '1') {
            responseData = {
                Today: {
                    NewMemberships_Today: data.NewMemberships_Today,
                    PendingMemberships_Today: data.PendingMemberships_Today,
                    PendingDistrictLevel_Today: data.PendingDistrictLevel_Today
                }
            };
        } else if (dateid === '2') {
            responseData = {
                LastWeek: {
                    NewMemberships_LastWeek: data.NewMemberships_LastWeek,
                    PendingMemberships_LastWeek: data.PendingMemberships_LastWeek,
                    PendingDistrictLevel_LastWeek: data.PendingDistrictLevel_LastWeek
                }
            };
        } else if (dateid === '3') {
            responseData = {
                LastMonth: {
                    NewMemberships_LastMonth: data.NewMemberships_LastMonth,
                    PendingMemberships_LastMonth: data.PendingMemberships_LastMonth,
                    PendingDistrictLevel_LastMonth: data.PendingDistrictLevel_LastMonth
                }
            };
        } else if (dateid === '4') {
            responseData = {
                LastYear: {
                    NewMemberships_LastYear: data.NewMemberships_LastYear,
                    PendingMemberships_LastYear: data.PendingMemberships_LastYear,
                    PendingDistrictLevel_LastYear: data.PendingDistrictLevel_LastYear
                }
            };
        } else if (dateid === '5') {
            responseData = {
                CustomRange: {
                    NewMemberships: data.NewMemberships,
                    PendingMemberships: data.PendingMemberships,
                    PendingDistrictLevel: data.PendingDistrictLevel
                }
            };
        }

        const response = {
            status: "success",
            data: [responseData]
        };

        return response;

    } catch (error) {
        throw error;
    }
};


exports.getAllStateWiseGraphDetails = async (districtid, dateid, fromdate, todate) => {
    try {
        const pool = await db;

        let selectPart = 'SUM(t.paidAmount) as amount, d.districtName, s.settingName';
        let whereConditions = 'WHERE t.paymentStatus = \'success\'';

        if (districtid) {
            whereConditions += ' AND t.paidDistrict = @districtid';
        }

        if (fromdate && todate) {
            whereConditions += ' AND t.paidDate BETWEEN @fromdate AND @todate';
        }

        switch (dateid) {
            case '1':
                selectPart = `
                SUM(CASE WHEN CONVERT(date, t.paidDate) = CONVERT(date, GETDATE()) THEN t.paidAmount ELSE 0 END) AS amount,
                d.districtName,
                s.settingName
                `;
                break;
            case '2':
                selectPart = `
                SUM(CASE WHEN t.paidDate >= DATEADD(day, -7, GETDATE()) THEN t.paidAmount ELSE 0 END) AS amount,
                d.districtName,
                s.settingName
                `;
                break;
            case '3':
                selectPart = `
                SUM(CASE WHEN t.paidDate >= DATEADD(month, -1, GETDATE()) THEN t.paidAmount ELSE 0 END) AS amount,
                d.districtName,
                s.settingName
                `;
                break;
            case '4':
                selectPart = `
                SUM(CASE WHEN t.paidDate >= DATEADD(year, -1, GETDATE()) THEN t.paidAmount ELSE 0 END) AS amount,
                d.districtName,
                s.settingName
                `;
                break;
            case '5':
                selectPart = `
                SUM(t.paidAmount) AS amount,
                d.districtName,
                s.settingName
                `;
                break;
        }

        const baseQuery = `
        SELECT ${selectPart}
        FROM KHRA_MemberPayment t
        JOIN KHRA_Districts d ON t.paidDistrict = d.districtId
        JOIN KHRA_Settings s ON t.paymentTypeId = s.settingId
        ${whereConditions}
        GROUP BY d.districtName, s.settingName
        `;

        const request = pool.request();
        if (districtid) {
            request.input('districtid', districtid);
        }
        if (fromdate && todate) {
            request.input('fromdate', fromdate);
            request.input('todate', todate);
        }

        const result = await request.query(baseQuery);
        const records = result.recordset;

        let responseData = {};

        records.forEach(record => {
            if (!responseData[record.districtName]) {
                responseData[record.districtName] = {};
            }
            responseData[record.districtName][record.settingName] = record.amount;
        });

        const response = {
            status: "success",
            data: [responseData]
        };

        return response;

    } catch (error) {
        throw error;
    }
};


exports.getAllDistrictWiseGraphDetails = async (districtid, unitid, dateid, fromdate, todate) => {
    try {
        const pool = await db;

        let selectPart = 'SUM(t.paidAmount) as amount, d.unitName, s.settingName';
        let whereConditions = 'WHERE t.paymentStatus = \'success\'';

        if (districtid) {
            whereConditions += ' AND t.paidDistrict = @districtid';
        }

        if (unitid) {
            whereConditions += ' AND t.paidUnit = @unitid';
        }

        if (fromdate && todate) {
            whereConditions += ' AND t.paidDate BETWEEN @fromdate AND @todate';
        }

        switch (dateid) {
            case '1':
                selectPart = `
                SUM(CASE WHEN CONVERT(date, t.paidDate) = CONVERT(date, GETDATE()) THEN t.paidAmount ELSE 0 END) AS amount,
                d.unitName,
                s.settingName
                `;
                break;
            case '2':
                selectPart = `
                SUM(CASE WHEN t.paidDate >= DATEADD(day, -7, GETDATE()) THEN t.paidAmount ELSE 0 END) AS amount,
                d.unitName,
                s.settingName
                `;
                break;
            case '3':
                selectPart = `
                SUM(CASE WHEN t.paidDate >= DATEADD(month, -1, GETDATE()) THEN t.paidAmount ELSE 0 END) AS amount,
                d.unitName,
                s.settingName
                `;
                break;
            case '4':
                selectPart = `
                SUM(CASE WHEN t.paidDate >= DATEADD(year, -1, GETDATE()) THEN t.paidAmount ELSE 0 END) AS amount,
                d.unitName,
                s.settingName
                `;
                break;
            case '5':
                selectPart = `
                SUM(t.paidAmount) AS amount,
                d.unitName,
                s.settingName
                `;
                break;
        }

        const baseQuery = `
        SELECT ${selectPart}
        FROM KHRA_MemberPayment t
        JOIN KHRA_Units d ON t.paidUnit = d.unitId
        JOIN KHRA_Settings s ON t.paymentTypeId = s.settingId
        ${whereConditions}
        GROUP BY d.unitName, s.settingName
        `;

        const request = pool.request();
        if (districtid) {
            request.input('districtid', districtid);
        }
        if (unitid) {
            request.input('unitid', unitid);
        }
        if (fromdate && todate) {
            request.input('fromdate', fromdate);
            request.input('todate', todate);
        }

        const result = await request.query(baseQuery);
        const records = result.recordset;

        let responseData = {};

        records.forEach(record => {
            if (!responseData[record.unitName]) {
                responseData[record.unitName] = {};
            }
            responseData[record.unitName][record.settingName] = record.amount;
        });

        const response = {
            status: "success",
            data: [responseData]
        };

        return response;

    } catch (error) {
        throw error;
    }
};



exports.getAllStateWiseDetailsAndGraph = async (districtid, dateid, fromdate, todate) => {
    try {
        const pool = await db;

        let baseMembershipQuery = `
            SELECT
                COUNT(CASE WHEN t.memberStatus IN (7,9) THEN 1 END) AS NewMemberships_All,
                COUNT(CASE WHEN t.memberStatus IN (2,3,4,5,8) THEN 1 END) AS PendingMemberships_All,
                COUNT(CASE WHEN t.memberStatus = 6 THEN 1 END) AS PendingDistrictLevel_All
            FROM
                KHRA_Members t
            JOIN KHRA_Users F ON F.userId = t.memberUserId
            JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
            JOIN KHRA_Units u ON u.unitId = t.memberUnitId
            WHERE t.memberId IS NOT NULL
        `;

        const baseGraphQuery = `
            SELECT SUM(t.paidAmount) AS amount, d.districtName, s.settingName
            FROM KHRA_MemberPayment t
            JOIN KHRA_Districts d ON t.paidDistrict = d.districtId
            JOIN KHRA_Settings s ON t.paymentTypeId = s.settingId
            WHERE t.paymentStatus = 'success'
            ${districtid ? ` AND t.paidDistrict = @districtid` : ''}
            ${fromdate && todate ? ` AND t.paidDate BETWEEN @fromdate AND @todate` : ''}
            GROUP BY d.districtName, s.settingName;
        `;

        if (districtid) {
            baseMembershipQuery += ` AND t.memberDistrictId = @districtid`;
        }

        if (fromdate && todate) {
            baseMembershipQuery += ` AND t.membershipDate BETWEEN @fromdate AND @todate`;
        }

        let membershipSelectPart = '';
        let graphSelectPart = 'SUM(t.paidAmount) as amount, d.districtName, s.settingName';

        switch (dateid) {
            case '1':
                membershipSelectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (7,9) AND CONVERT(date, t.membershipDate) = CONVERT(date, GETDATE()) THEN 1 END) AS NewMemberships_Today,
                    COUNT(CASE WHEN t.memberStatus IN (2,3,4,5,8) AND CONVERT(date, t.membershipDate) = CONVERT(date, GETDATE()) THEN 1 END) AS PendingMemberships_Today,
                    COUNT(CASE WHEN t.memberStatus = 6 AND CONVERT(date, t.membershipDate) = CONVERT(date, GETDATE()) THEN 1 END) AS PendingDistrictLevel_Today
                `;
                graphSelectPart = `
                    SUM(CASE WHEN CONVERT(date, t.paidDate) = CONVERT(date, GETDATE()) THEN t.paidAmount ELSE 0 END) AS amount,
                    d.districtName,
                    s.settingName
                `;
                break;
            case '2':
                membershipSelectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (7,9) AND t.membershipDate >= DATEADD(day, -7, GETDATE()) THEN 1 END) AS NewMemberships_LastWeek,
                    COUNT(CASE WHEN t.memberStatus IN (2,3,4,5,8) AND t.membershipDate >= DATEADD(day, -7, GETDATE()) THEN 1 END) AS PendingMemberships_LastWeek,
                    COUNT(CASE WHEN t.memberStatus = 6 AND t.membershipDate >= DATEADD(day, -7, GETDATE()) THEN 1 END) AS PendingDistrictLevel_LastWeek
                `;
                graphSelectPart = `
                    SUM(CASE WHEN t.paidDate >= DATEADD(day, -7, GETDATE()) THEN t.paidAmount ELSE 0 END) AS amount,
                    d.districtName,
                    s.settingName
                `;
                break;
            case '3':
                membershipSelectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (7,9) AND t.membershipDate >= DATEADD(month, -1, GETDATE()) THEN 1 END) AS NewMemberships_LastMonth,
                    COUNT(CASE WHEN t.memberStatus IN (2,3,4,5,8) AND t.membershipDate >= DATEADD(month, -1, GETDATE()) THEN 1 END) AS PendingMemberships_LastMonth,
                    COUNT(CASE WHEN t.memberStatus = 6 AND t.membershipDate >= DATEADD(month, -1, GETDATE()) THEN 1 END) AS PendingDistrictLevel_LastMonth
                `;
                graphSelectPart = `
                    SUM(CASE WHEN t.paidDate >= DATEADD(month, -1, GETDATE()) THEN t.paidAmount ELSE 0 END) AS amount,
                    d.districtName,
                    s.settingName
                `;
                break;
            case '4':
                membershipSelectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (7,9) AND t.membershipDate >= DATEADD(year, -1, GETDATE()) THEN 1 END) AS NewMemberships_LastYear,
                    COUNT(CASE WHEN t.memberStatus IN (2,3,4,5,8) AND t.membershipDate >= DATEADD(year, -1, GETDATE()) THEN 1 END) AS PendingMemberships_LastYear,
                    COUNT(CASE WHEN t.memberStatus = 6 AND t.membershipDate >= DATEADD(year, -1, GETDATE()) THEN 1 END) AS PendingDistrictLevel_LastYear
                `;
                graphSelectPart = `
                    SUM(CASE WHEN t.paidDate >= DATEADD(year, -1, GETDATE()) THEN t.paidAmount ELSE 0 END) AS amount,
                    d.districtName,
                    s.settingName
                `;
                break;
            case '5':
                membershipSelectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (7,9) THEN 1 END) AS NewMemberships,
                    COUNT(CASE WHEN t.memberStatus IN (2,3,4,5,8) THEN 1 END) AS PendingMemberships,
                    COUNT(CASE WHEN t.memberStatus = 6 THEN 1 END) AS PendingDistrictLevel
                `;
                graphSelectPart = `
                    SUM(t.paidAmount) AS amount,
                    d.districtName,
                    s.settingName
                `;
                break;
            default:
                throw new Error(`Invalid dateid provided: ${dateid}`);
        }

        let membershipDataQuery = baseMembershipQuery;
        if (membershipSelectPart) {
            membershipDataQuery = `
                SELECT
                    ${membershipSelectPart}
                FROM
                    KHRA_Members t
                JOIN KHRA_Users F ON F.userId = t.memberUserId
                JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
                JOIN KHRA_Units u ON u.unitId = t.memberUnitId
                WHERE t.memberId IS NOT NULL
                ${districtid ? ` AND t.memberDistrictId = @districtid` : ''}
                ${fromdate && todate ? ` AND t.membershipDate BETWEEN @fromdate AND @todate` : ''}
            `;
        }

        let graphDataQuery = baseGraphQuery;
        if (graphSelectPart) {
            graphDataQuery = `
                SELECT
                    ${graphSelectPart}
                FROM
                    KHRA_MemberPayment t
                JOIN KHRA_Districts d ON t.paidDistrict = d.districtId
                JOIN KHRA_Settings s ON t.paymentTypeId = s.settingId
                WHERE t.paymentStatus = 'success'
                ${districtid ? ` AND t.paidDistrict = @districtid` : ''}
                ${fromdate && todate ? ` AND t.paidDate BETWEEN @fromdate AND @todate` : ''}
                GROUP BY d.districtName, s.settingName
            `;
        }

        const membershipRequest = pool.request();
        const graphRequest = pool.request();

        if (districtid) {
            membershipRequest.input('districtid', districtid);
            graphRequest.input('districtid', districtid);
        }

        if (fromdate && todate) {
            membershipRequest.input('fromdate', fromdate);
            membershipRequest.input('todate', todate);
            graphRequest.input('fromdate', fromdate);
            graphRequest.input('todate', todate);
        }

        const [membershipResult, graphResult] = await Promise.all([
            membershipRequest.query(membershipDataQuery),
            graphRequest.query(graphDataQuery)
        ]);

        const DashboardData = membershipResult.recordset[0];
        const graphData = graphResult.recordset;

        // Restructure graph data into the required format
        const graphDataFormatted = graphData.reduce((acc, item) => {
            const { districtName, settingName, amount } = item;
            if (!acc[districtName]) {
                acc[districtName] = { districtName };
            }
            acc[districtName][settingName] = amount;
            return acc;
        }, {});

        const graphDataArray = Object.values(graphDataFormatted);

        let responseData = {};

        switch (dateid) {
            case '1':
                responseData = {
                    DashboardData: {
                        NewMemberships: DashboardData.NewMemberships_Today,
                        PendingMemberships: DashboardData.PendingMemberships_Today,
                        PendingDistrictLevel: DashboardData.PendingDistrictLevel_Today
                    },
                    GraphData: graphDataArray
                };
                break;
            case '2':
                responseData = {
                    DashboardData: {
                        NewMemberships: DashboardData.NewMemberships_LastWeek,
                        PendingMemberships: DashboardData.PendingMemberships_LastWeek,
                        PendingDistrictLevel: DashboardData.PendingDistrictLevel_LastWeek
                    },
                    GraphData: graphDataArray
                };
                break;
            case '3':
                responseData = {
                    DashboardData: {
                        NewMemberships: DashboardData.NewMemberships_LastMonth,
                        PendingMemberships: DashboardData.PendingMemberships_LastMonth,
                        PendingDistrictLevel: DashboardData.PendingDistrictLevel_LastMonth
                    },
                    GraphData: graphDataArray
                };
                break;
            case '4':
                responseData = {
                    DashboardData: {
                        NewMemberships: DashboardData.NewMemberships_LastYear,
                        PendingMemberships: DashboardData.PendingMemberships_LastYear,
                        PendingDistrictLevel: DashboardData.PendingDistrictLevel_LastYear
                    },
                    GraphData: graphDataArray
                };
                break;
            case '5':
                responseData = {
                    DashboardData: {
                        NewMemberships: DashboardData.NewMemberships,
                        PendingMemberships: DashboardData.PendingMemberships,
                        PendingDistrictLevel: DashboardData.PendingDistrictLevel
                    },
                    GraphData: graphDataArray
                };
                break;
            default:
                responseData = {
                    DashboardData: {
                        NewMemberships: DashboardData.NewMemberships_All,
                        PendingMemberships: DashboardData.PendingMemberships_All,
                        PendingDistrictLevel: DashboardData.PendingDistrictLevel_All
                    },
                    GraphData: graphDataArray
                };
                break;
        }

        const response = {
            status: "success",
            data: responseData
        };

        return response;

    } catch (error) {
        throw error;
    }
};




exports.getAllDistrictWiseDetailsAndGraph = async (districtid, unitid, dateid, fromdate, todate) => {
    try {
        const pool = await db;

        // Base query for membership details
        let membershipBaseQuery = `
            SELECT
                COUNT(CASE WHEN t.memberStatus IN (7,9) THEN 1 END) AS NewMemberships_All,
                COUNT(CASE WHEN t.memberStatus IN (2,3,4,5,8) THEN 1 END) AS PendingMemberships_All,
                COUNT(CASE WHEN t.memberStatus = 6 THEN 1 END) AS PendingDistrictLevel_All
            FROM
                KHRA_Members t
            JOIN KHRA_Users F ON F.userId = t.memberUserId
            JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
            JOIN KHRA_Units u ON u.unitId = t.memberUnitId
            WHERE t.memberId IS NOT NULL
        `;

        // Applying filters for membership details
        if (districtid) {
            membershipBaseQuery += ` AND t.memberDistrictId = @districtid`;
        }

        if (unitid) {
            membershipBaseQuery += ` AND t.memberUnitId = @unitid`;
        }

        if (fromdate && todate) {
            membershipBaseQuery += ` AND t.membershipDate BETWEEN @fromdate AND @todate`;
        }

        // Select part for different date ranges
        let membershipSelectPart = '';

        switch (dateid) {
            case '1':
                membershipSelectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (7,9) AND CONVERT(date, t.membershipDate) = CONVERT(date, GETDATE()) THEN 1 END) AS NewMemberships_Today,
                    COUNT(CASE WHEN t.memberStatus IN (2,3,4,5,8) AND CONVERT(date, t.membershipDate) = CONVERT(date, GETDATE()) THEN 1 END) AS PendingMemberships_Today,
                    COUNT(CASE WHEN t.memberStatus = 6 AND CONVERT(date, t.membershipDate) = CONVERT(date, GETDATE()) THEN 1 END) AS PendingDistrictLevel_Today
                `;
                break;
            case '2':
                membershipSelectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (7,9) AND t.membershipDate >= DATEADD(day, -7, GETDATE()) THEN 1 END) AS NewMemberships_LastWeek,
                    COUNT(CASE WHEN t.memberStatus IN (2,3,4,5,8) AND t.membershipDate >= DATEADD(day, -7, GETDATE()) THEN 1 END) AS PendingMemberships_LastWeek,
                    COUNT(CASE WHEN t.memberStatus = 6 AND t.membershipDate >= DATEADD(day, -7, GETDATE()) THEN 1 END) AS PendingDistrictLevel_LastWeek
                `;
                break;
            case '3':
                membershipSelectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (7,9) AND t.membershipDate >= DATEADD(month, -1, GETDATE()) THEN 1 END) AS NewMemberships_LastMonth,
                    COUNT(CASE WHEN t.memberStatus IN (2,3,4,5,8) AND t.membershipDate >= DATEADD(month, -1, GETDATE()) THEN 1 END) AS PendingMemberships_LastMonth,
                    COUNT(CASE WHEN t.memberStatus = 6 AND t.membershipDate >= DATEADD(month, -1, GETDATE()) THEN 1 END) AS PendingDistrictLevel_LastMonth
                `;
                break;
            case '4':
                membershipSelectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (7,9) AND t.membershipDate >= DATEADD(year, -1, GETDATE()) THEN 1 END) AS NewMemberships_LastYear,
                    COUNT(CASE WHEN t.memberStatus IN (2,3,4,5,8) AND t.membershipDate >= DATEADD(year, -1, GETDATE()) THEN 1 END) AS PendingMemberships_LastYear,
                    COUNT(CASE WHEN t.memberStatus = 6 AND t.membershipDate >= DATEADD(year, -1, GETDATE()) THEN 1 END) AS PendingDistrictLevel_LastYear
                `;
                break;
            case '5':
                membershipSelectPart = `
                    COUNT(CASE WHEN t.memberStatus IN (7,9) THEN 1 END) AS NewMemberships,
                    COUNT(CASE WHEN t.memberStatus IN (2,3,4,5,8) THEN 1 END) AS PendingMemberships,
                    COUNT(CASE WHEN t.memberStatus = 6 THEN 1 END) AS PendingDistrictLevel
                `;
                break;
        }

        let membershipQuery = membershipBaseQuery;
        if (membershipSelectPart) {
            membershipQuery = `
                SELECT
                    ${membershipSelectPart}
                FROM
                    KHRA_Members t
                JOIN KHRA_Users F ON F.userId = t.memberUserId
                JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
                JOIN KHRA_Units u ON u.unitId = t.memberUnitId
                WHERE t.memberId IS NOT NULL
                ${districtid ? ` AND t.memberDistrictId = @districtid` : ''}
                ${unitid ? ` AND t.memberUnitId = @unitid` : ''}
                ${fromdate && todate ? ` AND t.membershipDate BETWEEN @fromdate AND @todate` : ''}
            `;
        }

        // Base query for graph details
        let graphSelectPart = 'SUM(t.paidAmount) as amount, d.unitName, s.settingName';
        let graphWhereConditions = 'WHERE t.paymentStatus = \'success\'';

        if (districtid) {
            graphWhereConditions += ' AND t.paidDistrict = @districtid';
        }

        if (unitid) {
            graphWhereConditions += ' AND t.paidUnit = @unitid';
        }

        if (fromdate && todate) {
            graphWhereConditions += ' AND t.paidDate BETWEEN @fromdate AND @todate';
        }

        switch (dateid) {
            case '1':
                graphSelectPart = `
                SUM(CASE WHEN CONVERT(date, t.paidDate) = CONVERT(date, GETDATE()) THEN t.paidAmount ELSE 0 END) AS amount,
                d.unitName,
                s.settingName
                `;
                break;
            case '2':
                graphSelectPart = `
                SUM(CASE WHEN t.paidDate >= DATEADD(day, -7, GETDATE()) THEN t.paidAmount ELSE 0 END) AS amount,
                d.unitName,
                s.settingName
                `;
                break;
            case '3':
                graphSelectPart = `
                SUM(CASE WHEN t.paidDate >= DATEADD(month, -1, GETDATE()) THEN t.paidAmount ELSE 0 END) AS amount,
                d.unitName,
                s.settingName
                `;
                break;
            case '4':
                graphSelectPart = `
                SUM(CASE WHEN t.paidDate >= DATEADD(year, -1, GETDATE()) THEN t.paidAmount ELSE 0 END) AS amount,
                d.unitName,
                s.settingName
                `;
                break;
            case '5':
                graphSelectPart = `
                SUM(t.paidAmount) AS amount,
                d.unitName,
                s.settingName
                `;
                break;
        }

        const graphQuery = `
            SELECT ${graphSelectPart}
            FROM KHRA_MemberPayment t
            JOIN KHRA_Units d ON t.paidUnit = d.unitId
            JOIN KHRA_Settings s ON t.paymentTypeId = s.settingId
            ${graphWhereConditions}
            GROUP BY d.unitName, s.settingName
        `;

        // Execute both queries
        const request = pool.request();
        if (districtid) request.input('districtid', districtid);
        if (unitid) request.input('unitid', unitid);
        if (fromdate && todate) {
            request.input('fromdate', fromdate);
            request.input('todate', todate);
        }

        const membershipResult = await request.query(membershipQuery);
        const graphResult = await request.query(graphQuery);

        const DashboardData = membershipResult.recordset[0];
        const graphRecords = graphResult.recordset;

        let membershipResponseData = {
            NewMemberships: DashboardData.NewMemberships_All,
            PendingMemberships: DashboardData.PendingMemberships_All,
            PendingDistrictLevel: DashboardData.PendingDistrictLevel_All
        };

        if (dateid) {
            switch (dateid) {
                case '1':
                    membershipResponseData = {
                        NewMemberships: DashboardData.NewMemberships_Today,
                        PendingMemberships: DashboardData.PendingMemberships_Today,
                        PendingDistrictLevel: DashboardData.PendingDistrictLevel_Today
                    };
                    break;
                case '2':
                    membershipResponseData = {
                        NewMemberships: DashboardData.NewMemberships_LastWeek,
                        PendingMemberships: DashboardData.PendingMemberships_LastWeek,
                        PendingDistrictLevel: DashboardData.PendingDistrictLevel_LastWeek
                    };
                    break;
                case '3':
                    membershipResponseData = {
                        NewMemberships: DashboardData.NewMemberships_LastMonth,
                        PendingMemberships: DashboardData.PendingMemberships_LastMonth,
                        PendingDistrictLevel: DashboardData.PendingDistrictLevel_LastMonth
                    };
                    break;
                case '4':
                    membershipResponseData = {
                        NewMemberships: DashboardData.NewMemberships_LastYear,
                        PendingMemberships: DashboardData.PendingMemberships_LastYear,
                        PendingDistrictLevel: DashboardData.PendingDistrictLevel_LastYear
                    };
                    break;
                case '5':
                    membershipResponseData = {
                        NewMemberships: DashboardData.NewMemberships,
                        PendingMemberships: DashboardData.PendingMemberships,
                        PendingDistrictLevel: DashboardData.PendingDistrictLevel
                    };
                    break;
            }
        }

        // Transforming graph data
        let transformedGraphData = {};

        for (const record of graphRecords) {
            const { unitName, settingName, amount } = record;
            if (!transformedGraphData[unitName]) {
                transformedGraphData[unitName] = { [settingName]: amount };
            } else {
                transformedGraphData[unitName][settingName] = amount;
            }
        }

        // Converting the transformed graph data to array
        const graphDataArray = Object.entries(transformedGraphData).map(([unitName, settings]) => {
            return { unitName, ...settings };
        });

        const responseData = {
            status: "success",
            data: {
                DashboardData: membershipResponseData,
                GraphData: graphDataArray
            }
        };

        return responseData;
    } catch (error) {
        throw error;
    }
};

                

    


               



    




