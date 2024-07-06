
const db = require('../config/db');


exports.getnominee = async (userId) => {
  console.log(userId);
  try {
    const pool = await db;

    const nomineeResult = await pool.request()
      .input('userId', userId)
      .query('SELECT memberId FROM KHRA_Members WHERE memberUserId  = @userId');

    const memberId = nomineeResult.recordset[0].memberId;

    const result = await pool.request()
      .input('memberId', memberId)
      .query('SELECT * FROM KHRA_Nominee WHERE nomineeMemberId = @memberId');

    if (result.recordset.length > 0) {
      let responseData = {
        currentNominee: {},
        newNominee: {}
      };

      result.recordset.forEach(nominee => {
        if (nominee.nomineeStatus === true) {
          responseData.currentNominee = {
            nomineeId: nominee.nomineeId,
            nomineeMemberId: nominee.nomineeMemberId,
            nomineeName: nominee.nomineeName,
            nomineeAddress: nominee.nomineeAddress,
            nomineeEmail: nominee.nomineeEmail,
            nomineeMobilenumber: nominee.nomineeMobilenumber,
            nomineeIdProof: nominee.nomineeIdProof,
            nomineeIdProofNumber: nominee.nomineeIdProofNumber,
            nomineeBankName: nominee.nomineeBankName,
            nomineeBankAcName: nominee.nomineeBankAcName,
            nomineeBankAcNumber: nominee.nomineeBankAcNumber,
            nomineeBankBranch: nominee.nomineeBankBranch,
            nomineeIfsc: nominee.nomineeIfsc,
            nomineeIdUrl1: nominee.nomineeIdUrl1,
            nomineeIdUrl2: nominee.nomineeIdUrl2,
            nomineeApprovalStatus: nominee.nomineeApprovalStatus,
            nomineeStatus: nominee.nomineeStatus,
            nomineeRelation: nominee.nomineeRelation
          };
        } else {
          responseData.newNominee = {
            nomineeId: nominee.nomineeId,
            nomineeMemberId: nominee.nomineeMemberId,
            nomineeName: nominee.nomineeName,
            nomineeAddress: nominee.nomineeAddress,
            nomineeEmail: nominee.nomineeEmail,
            nomineeMobilenumber: nominee.nomineeMobilenumber,
            nomineeIdProof: nominee.nomineeIdProof,
            nomineeIdProofNumber: nominee.nomineeIdProofNumber,
            nomineeBankName: nominee.nomineeBankName,
            nomineeBankAcName: nominee.nomineeBankAcName,
            nomineeBankAcNumber: nominee.nomineeBankAcNumber,
            nomineeBankBranch: nominee.nomineeBankBranch,
            nomineeIfsc: nominee.nomineeIfsc,
            nomineeIdUrl1: nominee.nomineeIdUrl1,
            nomineeIdUrl2: nominee.nomineeIdUrl2,
            nomineeApprovalStatus: nominee.nomineeApprovalStatus,
            nomineeStatus: nominee.nomineeStatus,
            nomineeRelation: nominee.nomineeRelation
          };
        }
      });

      return responseData;
    }
  } catch (error) {
    throw error;
  }
};


exports.getAllNominees = async (page, limit, search, unitid) => {
  try {
    const offset = (page - 1) * parseInt(limit, 10); 
    const parsedLimit = parseInt(limit, 10); 
    const pool = await db;

    // Base queries
    let totalQuery = `
      SELECT 
        COUNT(*) as totalRecords
      FROM 
        KHRA_Nominee t
        JOIN KHRA_Members d ON d.memberId = t.nomineeMemberId
      WHERE 
        nomineeApprovalStatus = 0 
        AND nomineeStatus = 0 
        AND (
          d.memberBusinessName LIKE @search OR 
          d.memberName LIKE @search OR 
          d.memberMobilenumber LIKE @search
        )`;

    let dataQuery = `
      SELECT 
        d.memberuserId,
        d.memberBusinessName,
        d.memberName,
        d.memberMobilenumber
      FROM 
        KHRA_Nominee t
        JOIN KHRA_Members d ON d.memberId = t.nomineeMemberId
      WHERE 
        nomineeApprovalStatus = 0 
        AND nomineeStatus = 0 
        AND (
          d.memberBusinessName LIKE @search OR 
          d.memberName LIKE @search OR 
          d.memberMobilenumber LIKE @search
        )`;

    // Add unitid condition if provided
    if (unitid) {
      totalQuery += ` AND d.memberUnitId = @unitid`;
      dataQuery += ` AND d.memberUnitId = @unitid`;
    }

    // Continue data query
    dataQuery += `
      ORDER BY d.memberName
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY;`;

    // Execute total query
    const totalResult = await pool.request()
      .input('search', `%${search}%`)
      .input('unitid', unitid)
      .query(totalQuery);

    const totalRecords = totalResult.recordset[0].totalRecords;
    const totalPages = Math.ceil(totalRecords / parsedLimit);

    // Execute data query
    const result = await pool.request()
      .input('search', `%${search}%`)
      .input('limit', parsedLimit)
      .input('offset', offset)
      .input('unitid', unitid)
      .query(dataQuery);

    return {
      nominees: result.recordset,
      totalRecords,
      totalPages,
      currentPage: page,
      limit: parsedLimit
    };
  } catch (error) {
    throw error;
  }
};



exports.updatenominee = async (userId, nomineeData) => {
  try {
    const pool = await db;

    const memberIdResult = await pool.request()
      .input('userId', userId)
      .query('SELECT memberId FROM KHRA_Members WHERE memberUserId = @userId');

    if (memberIdResult.recordset.length === 0) {
      throw new Error('Member not found');
    }

    const memberId = memberIdResult.recordset[0].memberId;

    const result = await pool.request()
      .input('nomineeMemberId', memberId)
      .input('nomineeName', nomineeData.nomineeName)
      .input('nomineeAddress', nomineeData.nomineeAddress)
      .input('nomineeEmail', nomineeData.nomineeEmail)
      .input('nomineeMobilenumber', nomineeData.nomineeMobilenumber)
      .input('nomineeIdProof', nomineeData.nomineeIdProof)
      .input('nomineeIdProofNumber', nomineeData.nomineeIdProofNumber)
      .input('nomineeBankName', nomineeData.nomineeBankName)
      .input('nomineeBankAcName', nomineeData.nomineeBankAcName)
      .input('nomineeBankAcNumber', nomineeData.nomineeBankAcNumber)
      .input('nomineeBankBranch', nomineeData.nomineeBankBranch)
      .input('nomineeIfsc', nomineeData.nomineeIfsc)
      .input('nomineeIdUrl1', nomineeData.nomineeIdUrl1)
      .input('nomineeIdUrl2', nomineeData.nomineeIdUrl2)
      .input('nomineeApprovalStatus', 0)
      .input('nomineeStatus', 0)
      .input('nomineeRelation', nomineeData.nomineeRelation)
      .query(`
          INSERT INTO KHRA_Nominee (
              nomineeMemberId,
              nomineeName,
              nomineeAddress,
              nomineeEmail,
              nomineeMobilenumber,
              nomineeIdProof,
              nomineeIdProofNumber,
              nomineeBankName,
              nomineeBankAcName,
              nomineeBankAcNumber,
              nomineeBankBranch,
              nomineeIfsc,
              nomineeIdUrl1,
              nomineeIdUrl2,
              nomineeApprovalStatus,
              nomineeStatus,
              nomineeRelation
          )
          VALUES (
              @nomineeMemberId,
              @nomineeName,
              @nomineeAddress,
              @nomineeEmail,
              @nomineeMobilenumber,
              @nomineeIdProof,
              @nomineeIdProofNumber,
              @nomineeBankName,
              @nomineeBankAcName,
              @nomineeBankAcNumber,
              @nomineeBankBranch,
              @nomineeIfsc,
              @nomineeIdUrl1,
              @nomineeIdUrl2,
              @nomineeApprovalStatus,
              @nomineeStatus,
              @nomineeRelation
          );
      `);

    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return { status: 'success', message: 'Nominee updated successfully' };
    } else {
      return { status: 'error', message: 'Nominee not found or no changes made' };
    }
  } catch (error) {
    throw error;
  }
};


exports.approveNominee = async (memberUserId, memberStatus) => {
  try {
    const pool = await db;

  if (memberStatus === true) {
    const countQuery1 = `
      SELECT COUNT(*) AS count
      FROM KHRA_Nominee
      WHERE nomineeStatus = 1 AND nomineeMemberId = @memberUserId;
    `;
    const result1 = await pool.request()
      .input('memberUserId', memberUserId)
      .query(countQuery1);

    const count1 = result1.recordset[0].count;

    if (count1 > 0) {

      const updateQuery1 = `
        UPDATE KHRA_Nominee
        SET nomineeApprovalStatus = 1
        WHERE nomineeStatus = 1 AND nomineeMemberId = @memberUserId;
      `;
      await pool.request()
        .input('memberUserId', memberUserId)
        .query(updateQuery1);
    }


    const countQuery2 = `
      SELECT COUNT(*) AS count
      FROM KHRA_Nominee
      WHERE nomineeMemberId = @memberUserId;
    `;
    const result2 = await pool.request()
      .input('memberUserId', memberUserId)
      .query(countQuery2);

    const count2 = result2.recordset[0].count;

    if (count2 > 1) {
  
      const updateQuery2 = `
        UPDATE KHRA_Nominee
        SET nomineeStatus = CASE WHEN nomineeApprovalStatus = 1 THEN 0 ELSE 1 END,
            nomineeApprovalStatus = CASE WHEN nomineeApprovalStatus = 0 THEN 1 ELSE nomineeApprovalStatus END
        WHERE nomineeMemberId = @memberUserId;
      `;
      await pool.request()
        .input('memberUserId', memberUserId)
        .query(updateQuery2);
    }

    return { status: 'success', message: 'Nominee approved successfully' };

  }
    
  else if (memberStatus === false) {
    const updateQueryReject = `
      UPDATE KHRA_Nominee
      SET nomineeStatus = 0,nomineeApprovalStatus=10
      WHERE nomineeStatus = 0 AND nomineeApprovalStatus = 0 AND nomineeMemberId = @memberUserId;
    `;
    await pool.request()
      .input('memberUserId', memberUserId)
      .query(updateQueryReject);

    return { status: 'success', message: 'Nominee rejected' };
  }

} catch (error) {
  throw error;
}
};
