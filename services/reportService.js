const db = require('../config/db');


exports.StatePendingContribution = async ({ page, limit, searchText, districtid, unitid ,fromdate, todate, event}) => {
  const offset = (page - 1) * limit;
  try {
    const pool = await db;
    let totalQuery = `
      SELECT COUNT(*) as total, SUM(g.contributionAmount) as amount
      FROM KHRA_Members t
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
      JOIN KHRA_Contributions k ON k.contributionId <> g.contributionId
      WHERE g.memberId = t.memberId and  k.contributionMemberId  NOT IN (
                SELECT memberId 
                FROM KHRA_MemberContributions                
            )
    `;

    let dataQuery = `
      SELECT 
        s.districtName, 
        u.unitName, 
        k.contributionText as event, 
        t.memberBusinessName, 
        u.unitContactPerson, 
        u.unitContactNumber, 
        g.paymentStatus, 
        g.paidDate, 
        g.contributionAmount,
        g.payMode, 
        g.contributionPaymentId,
        k.contributionId, 
        k.contributionText
      FROM KHRA_Members t
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
      JOIN KHRA_Contributions k ON k.contributionId <> g.contributionId
      WHERE g.memberId = t.memberId and  k.contributionMemberId  NOT IN (
                SELECT memberId 
                FROM KHRA_MemberContributions                
            )
    `;

    const inputParams = {
      searchText: `%${searchText}%`,
      districtid,
      unitid,
      fromdate,
      todate,
      event,
      limit,
      offset
    };

    if (searchText) {
      totalQuery += ` AND (t.memberBusinessName LIKE @searchText OR u.unitName LIKE @searchText OR s.districtName LIKE @searchText OR k.contributionText LIKE @searchText)`;
      dataQuery += ` AND (t.memberBusinessName LIKE @searchText OR u.unitName LIKE @searchText OR s.districtName LIKE @searchText OR k.contributionText LIKE @searchText)`;
    }

    if (districtid) {
      totalQuery += ` AND t.memberDistrictId = @districtid`;
      dataQuery += ` AND t.memberDistrictId = @districtid`;
    }

    if (unitid) {
      totalQuery += ` AND t.memberUnitId = @unitid`;
      dataQuery += ` AND t.memberUnitId = @unitid`;
    }

    if (fromdate && todate) {
      totalQuery += ` AND k.contributionInitiatedDate BETWEEN @fromdate AND @todate`;
      dataQuery += ` AND k.contributionInitiatedDate BETWEEN @fromdate AND @todate`;
    }

    if (event) {
      totalQuery += ` AND k.contributionId = @event`;
      dataQuery += ` AND k.contributionId = @event`;
    }

    dataQuery += `
      ORDER BY t.memberId ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const totalResult = await pool.request()
      .input('searchText', inputParams.searchText)
      .input('districtid', inputParams.districtid)
      .input('unitid', inputParams.unitid)
      .input('fromdate', inputParams.fromdate)
      .input('todate', inputParams.todate)
      .input('event', inputParams.event)
      .query(totalQuery);

    const total = totalResult.recordset[0].total;
    const amount = totalResult.recordset[0].amount;

    const result = await pool.request()
      .input('searchText', inputParams.searchText)
      .input('districtid', inputParams.districtid)
      .input('unitid', inputParams.unitid)
      .input('fromdate', inputParams.fromdate)
      .input('todate', inputParams.todate)
      .input('event', inputParams.event)
      .input('limit', inputParams.limit)
      .input('offset', inputParams.offset)
      .query(dataQuery);

    return {
      records: result.recordset,
      total,
      amount
    };
  } catch (error) {
    throw error;
  }
};


exports.StatePayedContribution = async ({ page, limit, searchText, districtid, unitid ,fromdate, todate, event}) => {
  const offset = (page - 1) * limit;
  try {
    const pool = await db;

    let totalQuery = `
      SELECT COUNT(*) as total, SUM(g.contributionAmount) as amount
      FROM KHRA_Members t
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
      JOIN KHRA_Contributions k ON k.contributionId = g.contributionId
      WHERE g.memberId = t.memberId and  k.contributionMemberId  IN (
                SELECT memberId 
                FROM KHRA_MemberContributions 
                WHERE contributionPaymentId IS NOT NULL          
            )
    `;

    let dataQuery = `
      SELECT 
        s.districtName, 
        u.unitName, 
        k.contributionText as event, 
        t.memberBusinessName, 
        u.unitContactPerson, 
        u.unitContactNumber, 
        g.paymentStatus, 
        g.paidDate, 
        g.contributionAmount,
        g.payMode, 
        g.contributionPaymentId,
        k.contributionId,
        k.contributionText 
      FROM KHRA_Members t
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
      JOIN KHRA_Contributions k ON k.contributionId = g.contributionId
      WHERE g.memberId = t.memberId and  k.contributionMemberId  IN (
                SELECT memberId 
                FROM KHRA_MemberContributions 
                WHERE contributionPaymentId IS NOT NULL          
            )
    `;

    const inputParams = {
      searchText: `%${searchText}%`,
      districtid,
      unitid,
      fromdate,
      todate,
      event,
      limit,
      offset
    };

    if (searchText) {
      totalQuery += ` AND (t.memberBusinessName LIKE @searchText OR u.unitName LIKE @searchText OR s.districtName LIKE @searchText OR k.contributionText LIKE @searchText)`;
      dataQuery += ` AND (t.memberBusinessName LIKE @searchText OR u.unitName LIKE @searchText OR s.districtName LIKE @searchText OR k.contributionText LIKE @searchText)`;
    }

    if (districtid) {
      totalQuery += ` AND t.memberDistrictId = @districtid`;
      dataQuery += ` AND t.memberDistrictId = @districtid`;
    }

    if (unitid) {
      totalQuery += ` AND t.memberUnitId = @unitid`;
      dataQuery += ` AND t.memberUnitId = @unitid`;
    }

    if (fromdate && todate) {
      totalQuery += ` AND k.contributionInitiatedDate BETWEEN @fromdate AND @todate`;
      dataQuery += ` AND k.contributionInitiatedDate BETWEEN @fromdate AND @todate`;
    }

    if (event) {
      totalQuery += ` AND k.contributionId = @event`;
      dataQuery += ` AND k.contributionId = @event`;
    }

    dataQuery += `
      ORDER BY t.memberId ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const totalResult = await pool.request()
      .input('searchText', inputParams.searchText)
      .input('districtid', inputParams.districtid)
      .input('unitid', inputParams.unitid)
      .input('fromdate', inputParams.fromdate)
      .input('todate', inputParams.todate)
      .input('event', inputParams.event)
      .query(totalQuery);

    const total = totalResult.recordset[0].total;
    const amount = totalResult.recordset[0].amount;

    const result = await pool.request()
      .input('searchText', inputParams.searchText)
      .input('districtid', inputParams.districtid)
      .input('unitid', inputParams.unitid)
      .input('fromdate', inputParams.fromdate)
      .input('todate', inputParams.todate)
      .input('event', inputParams.event)
      .input('limit', inputParams.limit)
      .input('offset', inputParams.offset)
      .query(dataQuery);

    return {
      records: result.recordset,
      total,
      amount
    };
  } catch (error) {
    throw error;
  }
};
  


exports.DistrictPendingContribution = async ({ page, limit, searchText, districtid, unitid ,fromdate, todate, event}) => {
  const offset = (page - 1) * limit;
  try {
    const pool = await db;

    let totalQuery = `
      SELECT COUNT(*) as total, SUM(g.contributionAmount) as amount
      FROM KHRA_Members t
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
      JOIN KHRA_Contributions k ON k.contributionId <> g.contributionId
      WHERE g.memberId = t.memberId and  k.contributionMemberId  NOT IN (
                SELECT memberId 
                FROM KHRA_MemberContributions                
            )
    `;

    let dataQuery = `
      SELECT 
        s.districtName, 
        u.unitName, 
        k.contributionText as event, 
        t.memberBusinessName, 
        u.unitContactPerson, 
        u.unitContactNumber, 
        g.paymentStatus, 
        g.paidDate, 
        g.contributionAmount,
        g.payMode, 
        g.contributionPaymentId,
        k.contributionId,
        k.contributionText 
      FROM KHRA_Members t
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
      JOIN KHRA_Contributions k ON k.contributionId <> g.contributionId
      WHERE g.memberId = t.memberId and  k.contributionMemberId  NOT IN (
                SELECT memberId 
                FROM KHRA_MemberContributions                
            )
    `;

    const inputParams = {
      searchText: `%${searchText}%`,
      districtid,
      unitid,
      fromdate,
      todate,
      event,
      limit,
      offset
    };

    if (searchText) {
      totalQuery += ` AND (t.memberBusinessName LIKE @searchText OR u.unitName LIKE @searchText OR s.districtName LIKE @searchText OR k.contributionText LIKE @searchText)`;
      dataQuery += ` AND (t.memberBusinessName LIKE @searchText OR u.unitName LIKE @searchText OR s.districtName LIKE @searchText OR k.contributionText LIKE @searchText)`;
    }

    if (districtid) {
      totalQuery += ` AND t.memberDistrictId = @districtid`;
      dataQuery += ` AND t.memberDistrictId = @districtid`;
    }

    if (unitid) {
      totalQuery += ` AND t.memberUnitId = @unitid`;
      dataQuery += ` AND t.memberUnitId = @unitid`;
    }

    if (fromdate && todate) {
      totalQuery += ` AND k.contributionInitiatedDate BETWEEN @fromdate AND @todate`;
      dataQuery += ` AND k.contributionInitiatedDate BETWEEN @fromdate AND @todate`;
    }

    if (event) {
      totalQuery += ` AND k.contributionId = @event`;
      dataQuery += ` AND k.contributionId = @event`;
    }

    dataQuery += `
      ORDER BY t.memberId ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const totalResult = await pool.request()
      .input('searchText', inputParams.searchText)
      .input('districtid', inputParams.districtid)
      .input('unitid', inputParams.unitid)
      .input('fromdate', inputParams.fromdate)
      .input('todate', inputParams.todate)
      .input('event', inputParams.event)

      .query(totalQuery);

    const total = totalResult.recordset[0].total;
    const amount = totalResult.recordset[0].amount;

    const result = await pool.request()
      .input('searchText', inputParams.searchText)
      .input('districtid', inputParams.districtid)
      .input('unitid', inputParams.unitid)
      .input('fromdate', inputParams.fromdate)
      .input('todate', inputParams.todate)
      .input('event', inputParams.event)
      .input('limit', inputParams.limit)
      .input('offset', inputParams.offset)
      .query(dataQuery);

    return {
      records: result.recordset,
      total,
      amount
    };
  } catch (error) {
    throw error;
  }
};



exports.DistrictPayedContribution = async ({ page, limit, searchText, districtid, unitid ,fromdate, todate, event}) => {
  const offset = (page - 1) * limit;
  try {
    const pool = await db;

    let totalQuery = `
      SELECT COUNT(*) as total, SUM(g.contributionAmount) as amount
      FROM KHRA_Members t
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
      JOIN KHRA_Contributions k ON k.contributionId = g.contributionId
      WHERE g.memberId = t.memberId and  k.contributionMemberId  IN (
                SELECT memberId 
                FROM KHRA_MemberContributions 
                WHERE contributionPaymentId IS NOT NULL          
            )
    `;

    let dataQuery = `
      SELECT 
        s.districtName, 
        u.unitName, 
        k.contributionText as event, 
        t.memberBusinessName, 
        u.unitContactPerson, 
        u.unitContactNumber, 
        g.paymentStatus, 
        g.paidDate, 
        g.contributionAmount,
        g.payMode, 
        g.contributionPaymentId,
        k.contributionId,
        k.contributionText 
      FROM KHRA_Members t
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
      JOIN KHRA_Contributions k ON k.contributionId = g.contributionId
      WHERE g.memberId = t.memberId and  k.contributionMemberId  IN (
                SELECT memberId 
                FROM KHRA_MemberContributions 
                WHERE contributionPaymentId IS NOT NULL          
            )
    `;

    const inputParams = {
      searchText: `%${searchText}%`,
      districtid,
      unitid,
      fromdate,
      todate,
      event,
      limit,
      offset
    };

    if (searchText) {
      totalQuery += ` AND (t.memberBusinessName LIKE @searchText OR u.unitName LIKE @searchText OR s.districtName LIKE @searchText OR k.contributionText LIKE @searchText)`;
      dataQuery += ` AND (t.memberBusinessName LIKE @searchText OR u.unitName LIKE @searchText OR s.districtName LIKE @searchText OR k.contributionText LIKE @searchText)`;
    }

    if (districtid) {
      totalQuery += ` AND t.memberDistrictId = @districtid`;
      dataQuery += ` AND t.memberDistrictId = @districtid`;
    }

    if (unitid) {
      totalQuery += ` AND t.memberUnitId = @unitid`;
      dataQuery += ` AND t.memberUnitId = @unitid`;
    }

    if (fromdate && todate) {
      totalQuery += ` AND k.contributionInitiatedDate BETWEEN @fromdate AND @todate`;
      dataQuery += ` AND k.contributionInitiatedDate BETWEEN @fromdate AND @todate`;
    }

    if (event) {
      totalQuery += ` AND k.contributionId = @event`;
      dataQuery += ` AND k.contributionId = @event`;
    }

    dataQuery += `
      ORDER BY t.memberId ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const totalResult = await pool.request()
      .input('searchText', inputParams.searchText)
      .input('districtid', inputParams.districtid)
      .input('unitid', inputParams.unitid)
      .input('fromdate', inputParams.fromdate)
      .input('todate', inputParams.todate)
      .input('event', inputParams.event)
      .query(totalQuery);

    const total = totalResult.recordset[0].total;
    const amount = totalResult.recordset[0].amount;

    const result = await pool.request()
      .input('searchText', inputParams.searchText)
      .input('districtid', inputParams.districtid)
      .input('unitid', inputParams.unitid)
      .input('fromdate', inputParams.fromdate)
      .input('todate', inputParams.todate)
      .input('event', inputParams.event)
      .input('limit', inputParams.limit)
      .input('offset', inputParams.offset)
      .query(dataQuery);

    return {
      records: result.recordset,
      total,
      amount
    };
  } catch (error) {
    throw error;
  }
};


exports.UnitPendingContribution = async ({ page, limit, searchText, unitid ,fromdate, todate, event}) => {
  const offset = (page - 1) * limit;
  try {

    const pool = await db;

    let totalQuery = `
      SELECT COUNT(*) as total, SUM(g.contributionAmount) as amount
      FROM KHRA_Members t
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
      JOIN KHRA_Contributions k ON k.contributionId <> g.contributionId
      WHERE g.memberId = t.memberId and  k.contributionMemberId  NOT IN (
                SELECT memberId 
                FROM KHRA_MemberContributions                
            )
    `;

    let dataQuery = `
      SELECT 
        s.districtName, 
        u.unitName, 
        k.contributionText as event, 
        t.memberBusinessName, 
        u.unitContactPerson, 
        u.unitContactNumber, 
        g.paymentStatus, 
        g.paidDate, 
        g.contributionAmount,
        g.payMode, 
        g.contributionPaymentId,
        k.contributionId,
        k.contributionText  
      FROM KHRA_Members t
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
      JOIN KHRA_Contributions k ON k.contributionId <> g.contributionId
      WHERE g.memberId = t.memberId and  k.contributionMemberId  NOT IN (
                SELECT memberId 
                FROM KHRA_MemberContributions                
            )
    `;

    const inputParams = {
      searchText: `%${searchText}%`,
      unitid,
      fromdate,
      todate,
      event,
      limit,
      offset
    };

    if (searchText) {
      totalQuery += ` AND (t.memberBusinessName LIKE @searchText OR u.unitName LIKE @searchText OR s.districtName LIKE @searchText OR k.contributionText LIKE @searchText)`;
      dataQuery += ` AND (t.memberBusinessName LIKE @searchText OR u.unitName LIKE @searchText OR s.districtName LIKE @searchText OR k.contributionText LIKE @searchText)`;
    }
 
 
    if (unitid) {
      totalQuery += ` AND t.memberUnitId = @unitid`;
      dataQuery += ` AND t.memberUnitId = @unitid`;
     }

     if (fromdate && todate) {
      totalQuery += ` AND k.contributionInitiatedDate BETWEEN @fromdate AND @todate`;
      dataQuery += ` AND k.contributionInitiatedDate BETWEEN @fromdate AND @todate`;
    }

    if (event) {
      totalQuery += ` AND k.contributionId = @event`;
      dataQuery += ` AND k.contributionId = @event`;
    }

    dataQuery += `
      ORDER BY t.memberId ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const totalResult = await pool.request()
      .input('searchText', inputParams.searchText)
      .input('unitid', inputParams.unitid)
      .input('fromdate', inputParams.fromdate)
      .input('todate', inputParams.todate)
      .input('event', inputParams.event)
      .query(totalQuery);

    const total = totalResult.recordset[0].total;
    const amount = totalResult.recordset[0].amount;

    const result = await pool.request()
      .input('searchText', inputParams.searchText)
      .input('unitid', inputParams.unitid)
      .input('fromdate', inputParams.fromdate)
      .input('todate', inputParams.todate)
      .input('event', inputParams.event)
      .input('limit', inputParams.limit)
      .input('offset', inputParams.offset)
      .query(dataQuery);

    return {
      records: result.recordset,
      total,
      amount
    };
  } catch (error) {
    throw error;
  }
};


exports.UnitPayedContribution = async ({ page, limit, searchText, unitid ,fromdate, todate, event }) => {
  const offset = (page - 1) * limit;
  try {
    const pool = await db;

    let totalQuery = `
      SELECT COUNT(*) as total, SUM(g.contributionAmount) as amount
      FROM KHRA_Members t
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
      JOIN KHRA_Contributions k ON k.contributionId = g.contributionId
      WHERE g.memberId = t.memberId and  k.contributionMemberId  IN (
                SELECT memberId 
                FROM KHRA_MemberContributions 
                WHERE contributionPaymentId IS NOT NULL          
            )
    `;

    let dataQuery = `
      SELECT 
        s.districtName, 
        u.unitName, 
        k.contributionText as event, 
        t.memberBusinessName, 
        u.unitContactPerson, 
        u.unitContactNumber, 
        g.paymentStatus, 
        g.paidDate, 
        g.contributionAmount,
        g.payMode, 
        g.contributionPaymentId,
        k.contributionId,
        k.contributionText 
      FROM KHRA_Members t
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
      JOIN KHRA_Contributions k ON k.contributionId = g.contributionId
      WHERE g.memberId = t.memberId and  k.contributionMemberId  IN (
                SELECT memberId 
                FROM KHRA_MemberContributions 
                WHERE contributionPaymentId IS NOT NULL          
            )
    `;

    const inputParams = {
      searchText: `%${searchText}%`,
      unitid,
      fromdate,
      todate,
      event,
      limit,
      offset
    };

    if (searchText) {
      totalQuery += ` AND (t.memberBusinessName LIKE @searchText OR u.unitName LIKE @searchText OR s.districtName LIKE @searchText OR k.contributionText LIKE @searchText)`;
      dataQuery += ` AND (t.memberBusinessName LIKE @searchText OR u.unitName LIKE @searchText OR s.districtName LIKE @searchText OR k.contributionText LIKE @searchText)`;
    }

    if (unitid) {
      totalQuery += ` AND t.memberUnitId = @unitid`;
      dataQuery += ` AND t.memberUnitId = @unitid`;
    }

    if (fromdate && todate) {
      totalQuery += ` AND k.contributionInitiatedDate BETWEEN @fromdate AND @todate`;
      dataQuery += ` AND k.contributionInitiatedDate BETWEEN @fromdate AND @todate`;
    }

    if (event) {
      totalQuery += ` AND k.contributionId = @event`;
      dataQuery += ` AND k.contributionId = @event`;
    }

    dataQuery += `
      ORDER BY t.memberId ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const totalResult = await pool.request()
      .input('searchText', inputParams.searchText)
      .input('unitid', inputParams.unitid)
      .input('fromdate', inputParams.fromdate)
      .input('todate', inputParams.todate)
      .input('event', inputParams.event)
      .query(totalQuery);

    const total = totalResult.recordset[0].total;
    const amount = totalResult.recordset[0].amount;

    const result = await pool.request()
      .input('searchText', inputParams.searchText)
      .input('unitid', inputParams.unitid)
      .input('fromdate', inputParams.fromdate)
      .input('todate', inputParams.todate)
      .input('event', inputParams.event)
      .input('limit', inputParams.limit)
      .input('offset', inputParams.offset)
      .query(dataQuery);

    return {
      records: result.recordset,
      total,
      amount
    };
  } catch (error) {
    throw error;
  }
};


exports.paymentcontribution = async ({ page, limit, searchText, districtid, unitid, fromdate, todate, paytype }) => {
  const offset = (page - 1) * limit;
  try {
    const pool = await db;

    let totalQuery = `
      SELECT COUNT(*) as total,sum(g.contributionAmount) as amount
      FROM KHRA_Members t
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
      JOIN KHRA_Contributions k ON k.contributionId = g.contributionId
      WHERE g.memberId = t.memberId and g.contributionPaymentId is not null
    `;

    let dataQuery = `
      SELECT g.paidDate, u.unitName, 'Contributions' as type, k.contributionText as event, t.memberBusinessName, u.unitContactPerson, u.unitContactNumber, g.contributionPaymentId
      FROM KHRA_Members t
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
      JOIN KHRA_Contributions k ON k.contributionId = g.contributionId
      WHERE g.memberId = t.memberId and g.contributionPaymentId is not null
    `;

    const inputParams = {
      searchText: `%${searchText}%`,
      districtid,
      unitid,
      fromdate,
      todate,
      limit,
      offset
    };

    if (searchText) {
      totalQuery += ` AND (k.contributionText LIKE @searchText OR t.memberBusinessName LIKE @searchText OR u.unitContactPerson LIKE @searchText)`;
      dataQuery += ` AND (k.contributionText LIKE @searchText OR t.memberBusinessName LIKE @searchText OR u.unitContactPerson LIKE @searchText)`;
    }

    if (districtid) {
      totalQuery += ` AND t.memberDistrictId = @districtid`;
      dataQuery += ` AND t.memberDistrictId = @districtid`;
    }

    if (unitid) {
      totalQuery += ` AND t.memberUnitId = @unitid`;
      dataQuery += ` AND t.memberUnitId = @unitid`;
    }

    if (fromdate && todate) {
      totalQuery += ` AND g.paidDate BETWEEN @fromdate AND @todate`;
      dataQuery += ` AND g.paidDate BETWEEN @fromdate AND @todate`;
    }

    dataQuery += `
      ORDER BY g.contributionId ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const totalResult = await pool.request()
      .input('searchText', inputParams.searchText)
      .input('districtid', inputParams.districtid)
      .input('unitid', inputParams.unitid)
      .input('fromdate', inputParams.fromdate)
      .input('todate', inputParams.todate)
      .query(totalQuery);

    const total = totalResult.recordset[0].total;
    const amount = totalResult.recordset[0].amount;

    const result = await pool.request()
      .input('searchText', inputParams.searchText)
      .input('districtid', inputParams.districtid)
      .input('unitid', inputParams.unitid)
      .input('fromdate', inputParams.fromdate)
      .input('todate', inputParams.todate)
      .input('limit', inputParams.limit)
      .input('offset', inputParams.offset)
      .query(dataQuery);

    return {
      records: result.recordset,
      total,
      amount
    };
  } catch (error) {
    throw error;
  }
};
  


exports.paymentothers = async ({ page, limit, searchText, districtid, unitid, fromdate, todate, paytype }) => {
  const offset = (page - 1) * limit;
  try {
    const pool = await db;

    let totalQuery = `
    SELECT COUNT(*) as total, sum(g.paidAmount) as amount
    FROM KHRA_Members t
    JOIN KHRA_Users F ON F.userId = t.memberUserId
    JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
    JOIN KHRA_Units u ON u.unitId = t.memberUnitId
    JOIN KHRA_MemberPayment g ON g.memberId = t.memberId
    JOIN KHRA_Settings x ON x.settingId = g.paymentTypeId
    WHERE g.memberId = t.memberId and g.PaymentPaymentId is not null`;

    let dataQuery = `
    SELECT g.paidDate, u.unitName, x.settingName as type, x.settingName as event, t.memberBusinessName, u.unitContactPerson, u.unitContactNumber, g.PaymentPaymentId
    FROM KHRA_Members t
    JOIN KHRA_Users F ON F.userId = t.memberUserId
    JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
    JOIN KHRA_Units u ON u.unitId = t.memberUnitId
    JOIN KHRA_MemberPayment g ON g.memberId = t.memberId
    JOIN KHRA_Settings x ON x.settingId = g.paymentTypeId
    WHERE g.memberId = t.memberId and g.PaymentPaymentId is not null`;

    const inputParams = {
      searchText: `%${searchText}%`,
      districtid,
      unitid,
      fromdate,
      todate,
      paytype,
      limit,
      offset
    };

    if (searchText) {
      totalQuery += ` AND (u.unitName LIKE @searchText OR t.memberBusinessName LIKE @searchText OR u.unitContactPerson LIKE @searchText)`;
      dataQuery += ` AND (u.unitName LIKE @searchText OR t.memberBusinessName LIKE @searchText OR u.unitContactPerson LIKE @searchText)`;
    }

    if (districtid) {
      totalQuery += ` AND t.memberDistrictId = @districtid`;
      dataQuery += ` AND t.memberDistrictId = @districtid`;
    }

    if (unitid) {
      totalQuery += ` AND t.memberUnitId = @unitid`;
      dataQuery += ` AND t.memberUnitId = @unitid`;
    }

    if (fromdate && todate) {
      totalQuery += ` AND g.paidDate BETWEEN @fromdate AND @todate`;
      dataQuery += ` AND g.paidDate BETWEEN @fromdate AND @todate`;
    }

    if (paytype) {
      totalQuery += ` AND g.paymentTypeId = @paytype`;
      dataQuery += ` AND g.paymentTypeId = @paytype`;
    }

    dataQuery += `
      ORDER BY g.transactionId ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const totalResult = await pool.request()
      .input('searchText', inputParams.searchText)
      .input('districtid', inputParams.districtid)
      .input('unitid', inputParams.unitid)
      .input('fromdate', inputParams.fromdate)
      .input('todate', inputParams.todate)
      .input('paytype', inputParams.paytype)
      .query(totalQuery);

    const total = totalResult.recordset[0].total;
    const amount = totalResult.recordset[0].amount;

    const result = await pool.request()
      .input('searchText', inputParams.searchText)
      .input('districtid', inputParams.districtid)
      .input('unitid', inputParams.unitid)
      .input('fromdate', inputParams.fromdate)
      .input('todate', inputParams.todate)
      .input('paytype', inputParams.paytype)
      .input('limit', inputParams.limit)
      .input('offset', inputParams.offset)
      .query(dataQuery);

    return {
      records: result.recordset,
      total,
      amount
    };
  } catch (error) {
    throw error;
  }
};



exports.paymentAll = async ({ page, limit, searchText, districtid, unitid, fromdate, todate }) => {
  const offset = (page - 1) * limit;
  try {
    const pool = await db;

    let totalQuery = `
    SELECT 
    COUNT(*) AS total,
    SUM(contributionAmount) + SUM(paidAmount) AS amount 
FROM (
    SELECT 
        g.paidDate, 
        u.unitName, 
        'Contributions' AS type, 
        k.contributionText AS event, 
        t.memberBusinessName, 
        u.unitContactPerson, 
        u.unitContactNumber, 
        g.contributionPaymentId,
        g.contributionAmount,
        0 AS paidAmount 
    FROM  KHRA_Members t
    JOIN KHRA_Users F ON F.userId = t.memberUserId
    JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
    JOIN KHRA_Units u ON u.unitId = t.memberUnitId
    JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
    JOIN  KHRA_Contributions k ON k.contributionId = g.contributionId
    WHERE g.memberId = t.memberId AND g.contributionPaymentId IS NOT NULL
    UNION ALL
    SELECT 
        g.paidDate, 
        u.unitName, 
        x.settingName AS type, 
        x.settingName AS event, 
        t.memberBusinessName, 
        u.unitContactPerson, 
        u.unitContactNumber, 
        g.PaymentPaymentId,
        0 AS contributionAmount, 
        g.paidAmount
    FROM 
        KHRA_Members t JOIN 
        KHRA_Users F ON F.userId = t.memberUserId
    JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
    JOIN KHRA_Units u ON u.unitId = t.memberUnitId
    JOIN KHRA_MemberPayment g ON g.memberId = t.memberId
    JOIN KHRA_Settings x  ON x.settingId=g.paymentTypeId
    WHERE g.memberId = t.memberId AND g.PaymentPaymentId IS NOT NULL
) AS combined_data`;

    let dataQuery = `
    SELECT g.paidDate, u.unitName, 'Contributions' as type, k.contributionText as event, t.memberBusinessName, u.unitContactPerson, u.unitContactNumber, g.contributionPaymentId
      FROM KHRA_Members t
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
      JOIN KHRA_Contributions k ON k.contributionId = g.contributionId
      WHERE g.memberId = t.memberId and g.contributionPaymentId is not null
	  union all
	  SELECT g.paidDate, u.unitName, x.settingName as type, x.settingName as event, t.memberBusinessName, u.unitContactPerson, u.unitContactNumber, g.PaymentPaymentId
      FROM KHRA_Members t
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberPayment g ON g.memberId = t.memberId
	  JOIN KHRA_Settings x  ON x.settingId=g.paymentTypeId
      WHERE g.memberId = t.memberId and g.PaymentPaymentId is not null`;

    const inputParams = {
      searchText: `%${searchText}%`,
      districtid,
      unitid,
      fromdate,
      todate,
      limit,
      offset
    };

    if (searchText) {
      totalQuery += ` AND (u.unitName LIKE @searchText OR t.memberBusinessName LIKE @searchText OR u.unitContactPerson LIKE @searchText)`;
      dataQuery += ` AND (u.unitName LIKE @searchText OR t.memberBusinessName LIKE @searchText OR u.unitContactPerson LIKE @searchText)`;
    }

    if (districtid) {
      totalQuery += ` AND t.memberDistrictId = @districtid`;
      dataQuery += ` AND t.memberDistrictId = @districtid`;
    }

    if (unitid) {
      totalQuery += ` AND t.memberUnitId = @unitid`;
      dataQuery += ` AND t.memberUnitId = @unitid`;
    }

    if (fromdate && todate) {
      totalQuery += ` AND g.paidDate BETWEEN @fromdate AND @todate`;
      dataQuery += ` AND g.paidDate BETWEEN @fromdate AND @todate`;
    }

  //   dataQuery += `
  //   ORDER BY g.transactionId ASC
  //   OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  // `;


    const totalResult = await pool.request()
      .input('searchText', inputParams.searchText)
      .input('districtid', inputParams.districtid)
      .input('unitid', inputParams.unitid)
      .input('fromdate', inputParams.fromdate)
      .input('todate', inputParams.todate)
      .query(totalQuery);

    const total = totalResult.recordset[0].total;
    const amount = totalResult.recordset[0].amount;

    const result = await pool.request()
      .input('searchText', inputParams.searchText)
      .input('districtid', inputParams.districtid)
      .input('unitid', inputParams.unitid)
      .input('fromdate', inputParams.fromdate)
      .input('todate', inputParams.todate)
      .input('limit', inputParams.limit)
      .input('offset', inputParams.offset)
      .query(dataQuery);

    return {
      records: result.recordset,
      total,
      amount
    };
  } catch (error) {
    throw error;
  }
};




exports.getEvent = async (searchText) => {
  try {
      const pool = await db;
      let query = `
          SELECT 
              c.contributionId, 
              CONCAT(c.contributionText, '(', m.memberName, ')') AS contributionDetail
          FROM KHRA_Members m    
          JOIN KHRA_Contributions c ON m.memberId = c.contributionMemberId
      `;
      
      if (searchText) {
          query += `
              WHERE c.contributionText LIKE @searchText 
              OR m.memberName LIKE @searchText
          `;
      }

      const result = await pool.request()
          .input('searchText', `%${searchText}%`)
          .query(query);
      return result.recordset;
  } catch (error) {
      throw error;
  }
};

