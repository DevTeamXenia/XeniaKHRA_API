const db = require('../config/db');



exports.getmember = async (membershipNumberPrefix, membershipNumber) => {
  try {
    const pool = await db;
    const query = `
      SELECT t.memberBusinessName, t.memberBusinessAddress, s.districtName, u.unitName, t.memberUserId, t.memberDistrictId, t.memberUnitId  
      FROM KHRA_Members t
      JOIN KHRA_Nominee d ON t.memberId = d.nomineeMemberId
      JOIN KHRA_Users f ON f.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      WHERE d.nomineeStatus = 1 
            AND t.membershipNumberPrefix = @prefix 
            AND t.membershipNumber = @number`;

    const result = await pool.request()
      .input('prefix', membershipNumberPrefix)
      .input('number', membershipNumber)
      .query(query);

    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return { status: 'success', data: result.recordset };
    } else {
      return { status: 'failed', data: null };
    }
  } catch (error) {
    throw error;
  }
};



exports.getAllStateWiseMembers = async ({ active, pending, page, limit, searchText, districtid, unitid }) => {
  const offset = (page - 1) * limit;
  try {
    const pool = await db;

    let totalQuery = `
      SELECT COUNT(*) as total
      FROM KHRA_Members t 
      JOIN KHRA_Users f ON f.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberGroups g ON g.groupId = t.memberGroupId AND g.groupId = f.userGroupId
      WHERE t.memberActiveStatus = @active
    `;

    let dataQuery = `
      SELECT 
        t.memberid, 
        s.districtName, 
        u.unitName, 
        g.groupLevel as UserType, 
        t.memberBusinessName, 
        t.memberName, 
        t.memberMobilenumber, 
        t.memberStatus,
        CONCAT(t.membershipNumberPrefix, t.membershipNumber) AS membershipNumber 
      FROM KHRA_Members t 
      JOIN KHRA_Users f ON f.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberGroups g ON g.groupId = t.memberGroupId AND g.groupId = f.userGroupId
      WHERE t.memberActiveStatus = @active
    `;

    const inputParams = {
      active,
      pending,
      searchText: `%${searchText}%`,
      districtid,
      unitid,
      limit,
      offset
    };

    if (pending) {
      totalQuery += ` AND t.memberStatus = @pending`;
      dataQuery += ` AND t.memberStatus = @pending`;
    }

    if (searchText) {
      totalQuery += ` AND (t.memberBusinessName LIKE @searchText OR t.memberName LIKE @searchText)`;
      dataQuery += ` AND (t.memberBusinessName LIKE @searchText OR t.memberName LIKE @searchText)`;
    }

    if (districtid) {
      totalQuery += ` AND t.memberDistrictId = @districtid`;
      dataQuery += ` AND t.memberDistrictId = @districtid`;
    }

    if (unitid) {
      totalQuery += ` AND t.memberUnitId = @unitid`;
      dataQuery += ` AND t.memberUnitId = @unitid`;
    }

    dataQuery += `
      ORDER BY t.memberid ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const totalResult = await pool.request()
      .input('active', inputParams.active)
      .input('pending', inputParams.pending)
      .input('searchText', inputParams.searchText)
      .input('districtid', inputParams.districtid)
      .input('unitid', inputParams.unitid)
      .query(totalQuery);

    const total = totalResult.recordset[0].total;

    const result = await pool.request()
      .input('active', inputParams.active)
      .input('pending', inputParams.pending)
      .input('searchText', inputParams.searchText)
      .input('districtid', inputParams.districtid)
      .input('unitid', inputParams.unitid) 
      .input('limit', inputParams.limit)
      .input('offset', inputParams.offset)
      .query(dataQuery);

    return {
      records: result.recordset,
      total
    };
  } catch (error) {
    throw error;
  }
};


exports.getAllDistrictWiseMember = async ({ active, districtid, page = 1, limit = 10, searchText = '' }) => {
  const offset = (page - 1) * limit;

  try {
    const pool = await db;

    let totalQuery = `
      SELECT COUNT(*) as total
      FROM KHRA_Members t
      JOIN KHRA_Users f ON f.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberGroups g ON g.groupId = t.memberGroupId AND g.groupId = f.userGroupId
      WHERE t.memberActiveStatus = @active AND t.memberDistrictId = @districtid
    `;

    let dataQuery = `
      SELECT 
        t.memberid,
        s.districtName,
        u.unitName,
        g.groupLevel as UserType,
        t.memberBusinessName,
        t.memberName,
        t.memberMobilenumber,
        t.memberStatus,
        CONCAT(t.membershipNumberPrefix, t.membershipNumber) AS membershipNumber
      FROM KHRA_Members t
      JOIN KHRA_Users f ON f.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberGroups g ON g.groupId = t.memberGroupId AND g.groupId = f.userGroupId
      WHERE t.memberActiveStatus = @active AND t.memberDistrictId = @districtid
    `;

    if (searchText) {
      totalQuery += ` AND (t.memberBusinessName LIKE @searchText OR t.memberName LIKE @searchText)`;
      dataQuery += ` AND (t.memberBusinessName LIKE @searchText OR t.memberName LIKE @searchText)`;
    }

    if (active==false) {
      dataQuery += ` AND t.memberStatus = 6`;
      totalQuery += ` AND t.memberStatus = 6`;
    }

    dataQuery += `
      ORDER BY t.memberid ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const totalResult = await pool.request()
      .input('active', active)
      .input('districtid', districtid)
      .input('searchText', `%${searchText}%`)
      .query(totalQuery);

    const total = totalResult.recordset[0].total;

    const result = await pool.request()
      .input('active', active)
      .input('districtid', districtid)
      .input('searchText', `%${searchText}%`)
      .input('limit', limit)
      .input('offset', offset)
      .query(dataQuery);

    return {
      records: result.recordset,
      total
    };
  } catch (error) {
    throw error;
  }
};



exports.getAllUnitWiseMember =  async ({ active, unitid, page = 1, limit = 10, searchText = '' }) => {
  const offset = (page - 1) * limit;

  try {
    const pool = await db;

    let totalQuery = `
      SELECT COUNT(*) as total
      FROM KHRA_Members t
      JOIN KHRA_Users f ON f.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberGroups g ON g.groupId = t.memberGroupId AND g.groupId = f.userGroupId
      WHERE t.memberActiveStatus = @active AND t.memberUnitId = @unitid
    `;

    let dataQuery = `
      SELECT 
        t.memberid,
        s.districtName,
        u.unitName,
        g.groupLevel as UserType,
        t.memberBusinessName,
        t.memberName,
        t.memberMobilenumber,
        t.memberStatus,
        CONCAT(t.membershipNumberPrefix, t.membershipNumber) AS membershipNumber
      FROM KHRA_Members t
      JOIN KHRA_Users f ON f.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberGroups g ON g.groupId = t.memberGroupId AND g.groupId = f.userGroupId
      WHERE t.memberActiveStatus = @active AND t.memberUnitId = @unitid
    `;

    if (searchText) {
      totalQuery += ` AND (t.memberBusinessName LIKE @searchText OR t.memberName LIKE @searchText)`;
      dataQuery += ` AND (t.memberBusinessName LIKE @searchText OR t.memberName LIKE @searchText)`;
    }

    

    if (active==false) {
      dataQuery += ` AND t.memberStatus in(4,5)`;
      totalQuery += ` AND t.memberStatus in(4,5)`;
    }

    dataQuery += `
      ORDER BY t.memberid ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const totalResult = await pool.request()
      .input('active', active)
      .input('unitid', unitid)
      .input('searchText', `%${searchText}%`)
      .query(totalQuery);

    const total = totalResult.recordset[0].total;

    const result = await pool.request()
      .input('active', active)
      .input('unitid', unitid)
      .input('searchText', `%${searchText}%`)
      .input('limit', limit)
      .input('offset', offset)
      .query(dataQuery);

    return {
      records: result.recordset,
      total
    };
  } catch (error) {
    throw error;
  }
};


exports.getmemberdtls = async (memberid) => {
  try {
    let memberData = {};
    let membersubData = {};
    const pool = await db;
    const resultGroupIdCheck = await pool.request()
      .input('memberid', memberid)
      .query('SELECT memberGroupId FROM KHRA_Members WHERE memberid = @memberid');

    const memberGroupId = resultGroupIdCheck.recordset[0].memberGroupId;

    let query;
    let responseData;

    if (memberGroupId === 4) {

      query = `SELECT *
      FROM KHRA_Members t
      JOIN KHRA_Nominee d ON t.memberId = d.nomineeMemberId
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      WHERE  t.memberid = @memberid`;

      const result = await pool.request()
        .input('memberid', memberid)
        .query(query);

      if (result.recordset.length > 0) {
        memberData = result.recordset[0];
        responseData = {
          memberData: {
            membername: memberData.memberName,
            memberAddress: memberData.memberAddress,
            memberEmail: memberData.memberEmail,
            memberMobilenumber: memberData.memberMobilenumber,
            memberIdProofNumber: memberData.memberIdProofNumber,
            memberBankAcName: memberData.memberBankAcName,
            memberBankName: memberData.memberBankName,
            memberBankAcNumber: memberData.memberBankAcNumber,
            memberBankBranch: memberData.memberBankBranch,
            memberIfsc: memberData.memberIfsc,
            memberImage: memberData.userImageUrl,
            memberIdUrl1: memberData.memberIdUrl1,
            memberIdUrl2: memberData.memberIdUrl2,
            nomineeName: memberData.nomineeName,
            nomineeAddress: memberData.nomineeAddress,
            nomineeMobilenumber: memberData.nomineeMobilenumber,
            nomineeEmail: memberData.nomineeEmail,
            relation: memberData.nomineeRelation,
            nomineeIdProofNumber: memberData.nomineeIdProofNumber,
            nomineeBankAcName: memberData.nomineeBankAcName,
            nomineeBankName: memberData.nomineeBankName,
            nomineeBankAcNumber: memberData.nomineeBankAcNumber,
            nomineeBankBranch: memberData.nomineeBankBranch,
            nomineeIfsc: memberData.nomineeIfsc,
            nomineeIdUrl1: memberData.nomineeIdUrl1,
            nomineeIdUrl2: memberData.nomineeIdUrl2,
          },
          membersubData:{

          },
          
          businessDetail: {
            memberBusinessName: memberData.memberBusinessName,
            memberBusinessAddress: memberData.memberBusinessAddress,
            memberdistrictName: memberData.districtName,
            memberunitName: memberData.unitName,
         
          }

        };
      }

    } else if (memberGroupId === 5 || memberGroupId === 6 || memberGroupId === 7) {
     
      query = `SELECT *
      FROM KHRA_Members t
      JOIN KHRA_Nominee d ON t.memberId = d.nomineeMemberId
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      WHERE  t.memberid = @memberid`;

      const result = await pool.request()
        .input('memberid', memberid)
        .query(query);
      console.log(result);

      if (result.recordset.length > 0) {
        memberData = result.recordset[0];


        if (memberData.memberParentId) {
          const query2 = `SELECT *
                    FROM KHRA_Members t
                    JOIN KHRA_Nominee d ON t.memberId = d.nomineeMemberId
                    JOIN KHRA_Users F ON F.userId = t.memberUserId
                    JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
                    JOIN KHRA_Units u ON u.unitId = t.memberUnitId
                    WHERE  t.memberuserId = @memberuserId`;

          const result2 = await pool.request()
            .input('memberuserId', memberData.memberParentId)
            .query(query2);

          if (result2.recordset.length > 0) {
            membersubData = result2.recordset[0];
          }
        }

        responseData = {
          memberData: {
            membername: memberData.memberName,
            memberAddress: memberData.memberAddress,
            memberEmail: memberData.memberEmail,
            memberMobilenumber: memberData.memberMobilenumber,
            memberIdProofNumber: memberData.memberIdProofNumber,
            memberBankAcName: memberData.memberBankAcName,
            memberBankName: memberData.memberBankName,
            memberBankAcNumber: memberData.memberBankAcNumber,
            memberBankBranch: memberData.memberBankBranch,
            memberIfsc: memberData.memberIfsc,
            memberImage: memberData.userImageUrl,
            memberIdUrl1: memberData.memberIdUrl1,
            memberIdUrl2: memberData.memberIdUrl2,
            nomineeName: memberData.nomineeName,
            nomineeAddress: memberData.nomineeAddress,
            nomineeMobilenumber: memberData.nomineeMobilenumber,
            nomineeEmail: memberData.nomineeEmail,
            relation: memberData.nomineeRelation,
            nomineeIdProofNumber: memberData.nomineeIdProofNumber,
            nomineeBankAcName: memberData.nomineeBankAcName,
            nomineeBankName: memberData.nomineeBankName,
            nomineeBankAcNumber: memberData.nomineeBankAcNumber,
            nomineeBankBranch: memberData.nomineeBankBranch,
            nomineeIfsc: memberData.nomineeIfsc,
            nomineeIdUrl1: memberData.nomineeIdUrl1,
            nomineeIdUrl2: memberData.nomineeIdUrl2,
          },

          //membersubData: membersubData,

          membersubData:{
            membername: membersubData.memberName,
            memberMobilenumber: membersubData.memberMobilenumber,
            memberAddress: membersubData.memberAddress,
            memberEmail: membersubData.memberEmail,
            relation: membersubData.nomineeRelation,
            memberIdProofNumber: membersubData.memberIdProofNumber,
            memberDob: membersubData.memberDob,
            age: membersubData.memberAge,
            memberBankAcName: membersubData.memberBankAcName,
            memberBankName: membersubData.memberBankName,
            memberBankAcNumber: membersubData.memberBankAcNumber,
            memberBankBranch: membersubData.memberBankBranch,
            memberIfsc: membersubData.memberIfsc,
            memberImage: membersubData.userImageUrl,
            memberIdUrl1: membersubData.memberIdUrl1,
            memberIdUrl2: membersubData.memberIdUrl2,
          },

          businessDetail: {
            memberBusinessName: membersubData.memberBusinessName,
            memberBusinessAddress: membersubData.memberBusinessAddress,
            memberdistrictName: membersubData.districtName,
            memberunitName: membersubData.unitName,
         
          }


        };
      }
    } else {
      throw new Error('Unsupported memberGroupId');
    }

    return responseData;
  } catch (error) {
    throw error;
  }
};


exports.updatememstatus = async (memberUserId, memberStatus, memberReviseRemarks) => {
  try {
      const pool = await db;
      //console.log('Service Inputs:', { memberUserId, memberStatus, memberReviseRemarks })----;
      
      let query;
      const request = pool.request()
          .input('memberUserId', memberUserId)
          .input('memberStatus', memberStatus)
          .input('memberReviseRemarks', memberReviseRemarks)
          .input('memberActiveStatus', true);

      if (memberStatus === "7") {
          query = `
              UPDATE KHRA_Members
              SET memberStatus = @memberStatus, memberReviseRemarks = @memberReviseRemarks, memberActiveStatus = @memberActiveStatus
              WHERE memberId = @memberUserId;
          `;
      }else {
        query = `
          UPDATE KHRA_Members
          SET memberStatus = @memberStatus, memberReviseRemarks = @memberReviseRemarks
          WHERE memberId = @memberUserId;
        `;
      }

      console.log('Query:', query);

      const result = await request.query(query);

      if (result.rowsAffected && result.rowsAffected[0] > 0) {
          return { status: 'success', message: 'Member status updated successfully' };
      } else {
          return { status: 'failure', message: 'No rows were updated' };
      }
  } catch (error) {
      throw error;
  }
};



//---------Child Members Outstanding amount------//

exports.getmemOutstanding = async (userId) => {
    try {
        const pool = await db;
        const result = await pool.request()
            .input('userId',  userId) 
            .query(`
                SELECT COUNT(*) * (
                    SELECT settingValue 
                    FROM KHRA_Settings 
                    WHERE settingId = 3
                ) AS OutstandingAmount
                FROM KHRA_Users u
                JOIN KHRA_Members m ON u.userId = m.memberParentId 
                WHERE u.userId = @userId
            `);
        return result.recordset[0];
    } catch (error) {
        throw error;
    }
};



exports.getpendingApproveDetails = async (userId) => {
  try {
      const pendingMembers = await getMembersByStatusAndParentId(userId, 2); // Status 2 for pending
      const approvedMembers = await getMembersByStatusAndParentId(userId, 5); // Status 5 for approved

      return {
          status: "success",
          data: [{
              pending: pendingMembers,
              approve: approvedMembers
          }]
      };
  } catch (error) {
      throw error;
  }
};

async function getMembersByStatusAndParentId(userId, status) {
  try {
      const pool = await db;
      const result = await pool.request().query(`
          SELECT m.memberId, m.memberName, g.groupLevel
          FROM KHRA_Users u
          JOIN KHRA_Members m ON u.userId = m.memberParentId 
          JOIN KHRA_MemberGroups g ON g.groupId = m.memberGroupId 
          WHERE m.memberStatus = ${status} AND m.memberParentId = ${userId}
      `);

      return result.recordset.map(row => ({
          memberId: row.memberId,
          memberName: row.memberName,
          groupLevel: row.groupLevel
      }));
  } catch (error) {
      throw error;
  }
}



exports.childMemberApprove = async (userId, memberStatus, memberAction) => {
  try {
    const pool = await db;
    let result;

    if (memberAction === true) {
      result = await pool.request()
        .input('userId', userId)
        .input('memberStatus', memberStatus)
        .query(`
          UPDATE KHRA_Members 
          SET memberStatus = @memberStatus
          WHERE memberId = @userId;
        `);
    } else {
      result = await pool.request()
        .input('userId', userId)
        .input('memberStatus', memberStatus)
        .query(`
          UPDATE KHRA_Members 
          SET memberStatus = @memberStatus
          WHERE memberId = @userId;
        `);
    }

    if (result.rowsAffected[0] > 0) {
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    throw error;
  }
};







