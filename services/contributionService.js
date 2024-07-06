const admin = require('firebase-admin');
const db = require('../config/db');
const { Transaction } = require('mssql');

const serviceAccount = require('../firebase/service-account-file.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


exports.createContribution = async (conbData) => {
  let transaction;
  try {
      const pool = await db;

      transaction = new Transaction(pool);

      await transaction.begin();
  
      const existingUser = await transaction.request()
        .input('contributionMemberId', conbData.contributionMemberId)
        .query('select t.contributionMemberId from KHRA_Contributions t,KHRA_Members d where t.contributionMemberId=d.memberId and t.contributionMemberId = @contributionMemberId');
  
      if (existingUser.recordset.length > 0) {
        await transaction.rollback();
        return { status: 'failed', message: 'This Member Cotribution already added..!' };
      }

      const settingsQuery = await pool.request()
          .input('settingId', 3)
          .query('SELECT settingValue FROM KHRA_Settings WHERE settingId = @settingId');
      const contributionAmount = settingsQuery.recordset[0].settingValue;

      const currentDate = new Date();

      const contributionInitiatedDate = formatDateToLocalTime(currentDate);

      const contributionDueDate = new Date(currentDate);
      contributionDueDate.setDate(contributionDueDate.getDate() + 30);
      const contributionDueDateString = formatDateToLocalTime(contributionDueDate);

      const result = await pool.request()
          .input('contributionMemberId', conbData.contributionMemberId)
          .input('contributionImgUrl', conbData.contributionImgUrl)
          .input('contributionText', conbData.contributionText)
          .input('contributionContent', conbData.contributionContent)
          .input('contributionAmount', contributionAmount)
          .input('contributionInitiatedDate', contributionInitiatedDate)
          .input('contributionDueDate', contributionDueDateString)
          .input('contributionStatus', 'Created')
          .input('activeStatus', false)
          .input('contributionApprovalStatus', 0)
          .query(`
              INSERT INTO KHRA_Contributions 
              (contributionMemberId, contributionImgUrl, contributionText, contributionContent, contributionAmount, contributionInitiatedDate, contributionDueDate, contributionStatus, activeStatus, contributionApprovalStatus)
              VALUES 
              (@contributionMemberId, @contributionImgUrl, @contributionText, @contributionContent, @contributionAmount, @contributionInitiatedDate, @contributionDueDate, @contributionStatus, @activeStatus, @contributionApprovalStatus);
          `);


          if (result.rowsAffected && result.rowsAffected[0] > 0) {
            await transaction.commit();
      
            // Fetch firebase tokens excluding the contributionMemberId
            const tokensResult = await pool.request()
              .input('contributionMemberId', conbData.contributionMemberId)
              .query('SELECT firebaseToken FROM KHRA_Users WHERE userStatus = 1 AND firebaseToken IS NOT NULL AND userId != @contributionMemberId');
      
            const tokens = tokensResult.recordset.map(record => record.firebaseToken);
      
            // Send notifications to all tokens
            const message = {
              notification: {
                title: 'KHRA Contribution',
                body: 'A new contribution has been added that needs your attention.'
              }
            };
      
            const messagingPromises = tokens.map(token => {
              return admin.messaging().send({
                ...message,
                token: token
              });
            });
      
            await Promise.all(messagingPromises);
      
            return { status: 'success', message: 'Contribution created successfully and notifications sent.' };
          } else {
            await transaction.rollback();
            return { status: 'fail', message: 'Contribution not created' };
          }
        } catch (error) {
          if (transaction) {
            await transaction.rollback();
          }
          throw error;
        }
      };


function formatDateToLocalTime(date) {
  const pad = (number) => number.toString().padStart(2, '0');
  const padMilliseconds = (number) => number.toString().padStart(3, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const milliseconds = padMilliseconds(date.getMilliseconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

  


exports.getMembersByPartialName = async (partialName) => {
  try {
      const pool = await db;
      const result = await pool.request()
          .input('partialName', '%' + partialName + '%')
          .query(`
              SELECT 
                  t.memberId,        
                  t.memberName, 
                  t.memberBusinessName, 
                  CONCAT(t.membershipNumberPrefix, t.membershipNumber) AS membershipNumber 
              FROM KHRA_Members t 
              JOIN KHRA_Users f ON f.userId = t.memberUserId
              JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
              JOIN KHRA_Units u ON u.unitId = t.memberUnitId
              WHERE t.memberName LIKE @partialName 
              OR t.memberBusinessName LIKE @partialName 
              OR CONCAT(t.membershipNumberPrefix, t.membershipNumber) LIKE @partialName
          `);

      return result.recordset.map(row => ({
          memberId: row.memberId,
          memberName: row.memberName,
          memberBusinessName: row.memberBusinessName,
          membershipNumber: row.membershipNumber
      }));
  } catch (error) {
      throw error;
  }
};


exports.updateContribution = async (ContributionId, conbData) => {
  try {
    const pool = await db;

    const result = await pool.request()
    .input('contributionId', ContributionId)  
    .input('contributionMemberId', conbData.contributionMemberId)   
    .input('contributionImgUrl', conbData.contributionImgUrl)
    .input('contributionText', conbData.contributionText) 
    .input('contributionContent', conbData.contributionContent) 
    .input('contributionStatus', 'Updated')
      .query(`
        UPDATE KHRA_Contributions
        SET contributionMemberId = @contributionMemberId, contributionImgUrl=@contributionImgUrl, contributionText = @contributionText, contributionContent = @contributionContent, contributionStatus=@contributionStatus             
        WHERE contributionId = @ContributionId;
      `);
      
      if (result.rowsAffected && result.rowsAffected[0] > 0) {
          return { status: 'success', message: 'Contribution Updated successfully'};
        }
      
  } catch (error) {
    throw error;
  }
};

 

exports.getContribution = async (ContributionId) => {

  try {

    const pool = await db;

    const result = await pool.request()
      .input('ContributionId', ContributionId)
      .query('select d.contributionId, d.contributionText,t.memberName,d.contributionImgUrl,d.contributionContent,t.memberId from KHRA_Members t,KHRA_Contributions d where d.contributionMemberId=t.memberId and d.contributionId = @ContributionId');

    if (result.recordset.length > 0) {
      const contributionData = result.recordset[0];    
      return contributionData;
    }
    
  } catch (error) {
    throw error;
  }
};


exports.getDistrictPendingContribution = async ({ page, limit, searchText, districtid }) => {
  const offset = (page - 1) * limit;
  try {
    const pool = await db;

    let baseQuery = `
      FROM KHRA_Members t
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
      JOIN KHRA_Contributions k ON k.contributionId <> g.contributionId
      WHERE g.memberId = t.memberId AND k.contributionMemberId NOT IN (
                SELECT memberId 
                FROM KHRA_MemberContributions                
            )
    `;

    if (districtid) {
      baseQuery += ` AND t.memberDistrictId = @districtid`;
    }

    if (searchText) {
      baseQuery += ` AND k.contributionText LIKE @searchText`;
    }

    const totalQuery = `SELECT COUNT(*) as total ${baseQuery}`;
    const dataQuery = `
      SELECT k.contributionId, 
             k.contributionText, 
             k.contributionInitiatedDate 
      ${baseQuery}
      ORDER BY k.contributionId ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const totalResult = await pool.request()
      .input('searchText', `%${searchText}%`)
      .input('districtid', districtid)
      .query(totalQuery);

    const total = totalResult.recordset[0].total;

    const result = await pool.request()
      .input('searchText', `%${searchText}%`)
      .input('limit', limit)
      .input('districtid', districtid)
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




exports.getDisrtictApproveContribution = async ({ page, limit, searchText, districtid }) => {
  const offset = (page - 1) * limit;
  try {
    const pool = await db;

    let baseQuery = `
      FROM KHRA_Members t
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
      JOIN KHRA_Contributions k ON k.contributionId = g.contributionId
      WHERE g.memberId = t.memberId AND k.contributionMemberId IN (
                SELECT memberId 
                FROM KHRA_MemberContributions 
                WHERE contributionPaymentRef IS NOT NULL          
            )
    `;

    if (districtid) {
      baseQuery += ` AND t.memberDistrictId = @districtid`;
    }

    if (searchText) {
      baseQuery += ` AND k.contributionText LIKE @searchText`;
    }

    const totalQuery = `SELECT COUNT(*) as total ${baseQuery}`;
    const dataQuery = `
      SELECT k.contributionId, 
             k.contributionText, 
             k.contributionInitiatedDate 
      ${baseQuery}
      ORDER BY k.contributionId ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const totalResult = await pool.request()
      .input('searchText', `%${searchText}%`)
      .input('districtid', districtid)
      .query(totalQuery);

    const total = totalResult.recordset[0].total;

    const result = await pool.request()
      .input('searchText', `%${searchText}%`)
      .input('limit', limit)
      .input('districtid', districtid)
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


exports.getUnitPendingContribution = async ({ page, limit, searchText, unitid }) => {
  const offset = (page - 1) * limit;
  try {
    const pool = await db;

    let baseQuery = `
      FROM KHRA_Members t
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
      JOIN KHRA_Contributions k ON k.contributionId <> g.contributionId
      WHERE g.memberId = t.memberId AND k.contributionMemberId NOT IN (
                SELECT memberId 
                FROM KHRA_MemberContributions                
            )
    `;

    if (unitid) {
      baseQuery += ` AND t.memberUnitId = @unitid`;
    }

    if (searchText) {
      baseQuery += ` AND k.contributionText LIKE @searchText`;
    }

    const totalQuery = `SELECT COUNT(*) as total ${baseQuery}`;
    const dataQuery = `
      SELECT k.contributionId, 
             k.contributionText, 
             k.contributionInitiatedDate 
      ${baseQuery}
      ORDER BY k.contributionId ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const totalResult = await pool.request()
      .input('searchText', `%${searchText}%`)
      .input('unitid', unitid)
      .query(totalQuery);

    const total = totalResult.recordset[0].total;

    const result = await pool.request()
      .input('searchText', `%${searchText}%`)
      .input('limit', limit)
      .input('unitid', unitid)
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


exports.getUnitApproveContribution = async ({ page, limit, searchText, unitid }) => {
  const offset = (page - 1) * limit;
  try {
    const pool = await db;

    let baseQuery = `
      FROM KHRA_Members t
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
      JOIN KHRA_Contributions k ON k.contributionId = g.contributionId
      WHERE g.memberId = t.memberId AND k.contributionMemberId IN (
                SELECT memberId 
                FROM KHRA_MemberContributions 
                WHERE contributionPaymentRef IS NOT NULL          
            )
    `;

    if (unitid) {
      baseQuery += ` AND t.memberUnitId = @unitid`;
    }

    if (searchText) {
      baseQuery += ` AND k.contributionText LIKE @searchText`;
    }

    const totalQuery = `SELECT COUNT(*) as total ${baseQuery}`;
    const dataQuery = `
      SELECT k.contributionId, 
             k.contributionText, 
             k.contributionInitiatedDate 
      ${baseQuery}
      ORDER BY k.contributionId ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const totalResult = await pool.request()
      .input('searchText', `%${searchText}%`)
      .input('unitid', unitid)
      .query(totalQuery);

    const total = totalResult.recordset[0].total;

    const result = await pool.request()
      .input('searchText', `%${searchText}%`)
      .input('limit', limit)
      .input('unitid', unitid)
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

exports.getStatePendingContribution = async ({ page, limit, searchText }) => {
  const offset = (page - 1) * limit;
  try {
    const pool = await db;

    let totalQuery = `
      SELECT COUNT(*) as total
        FROM KHRA_Members t
        JOIN KHRA_Users F ON F.userId = t.memberUserId
        JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
        JOIN KHRA_Units u ON u.unitId = t.memberUnitId
        JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
        JOIN KHRA_Contributions k ON k.contributionId <> g.contributionId
        WHERE g.memberId = t.memberId AND k.contributionMemberId NOT IN (
                  SELECT memberId 
                  FROM KHRA_MemberContributions                
              )
    `;
    let dataQuery = `
    SELECT k.contributionId, 
           k.contributionText, 
           k.contributionInitiatedDate
      FROM KHRA_Members t
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
      JOIN KHRA_Contributions k ON k.contributionId <> g.contributionId
      WHERE g.memberId = t.memberId AND k.contributionMemberId NOT IN (
                SELECT memberId 
                FROM KHRA_MemberContributions                
            )
    `;

    if (searchText) {
      totalQuery += ` AND k.contributionText LIKE @searchText`;
      dataQuery += ` AND k.contributionText LIKE @searchText`;
    }

    dataQuery += `
      ORDER BY k.contributionId ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const totalResult = await pool.request()
      .input('searchText', `%${searchText}%`)
      .query(totalQuery);

    const total = totalResult.recordset[0].total;

    const result = await pool.request()
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



exports.getStateApproveContribution = async ({ page, limit, searchText }) => {
  const offset = (page - 1) * limit;
  try {
    const pool = await db;

    let totalQuery = `
      SELECT COUNT(*) as total
        FROM KHRA_Members t
        JOIN KHRA_Users F ON F.userId = t.memberUserId
        JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
        JOIN KHRA_Units u ON u.unitId = t.memberUnitId
        JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
        JOIN KHRA_Contributions k ON k.contributionId = g.contributionId
        WHERE g.memberId = t.memberId AND k.contributionMemberId IN (
                  SELECT memberId 
                  FROM KHRA_MemberContributions 
                  WHERE contributionPaymentRef IS NOT NULL          
              )
    `;
    let dataQuery = `
    SELECT k.contributionId, 
           k.contributionText, 
           k.contributionInitiatedDate
      FROM KHRA_Members t
      JOIN KHRA_Users F ON F.userId = t.memberUserId
      JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
      JOIN KHRA_Units u ON u.unitId = t.memberUnitId
      JOIN KHRA_MemberContributions g ON g.memberId = t.memberId
      JOIN KHRA_Contributions k ON k.contributionId = g.contributionId
      WHERE g.memberId = t.memberId AND k.contributionMemberId IN (
                SELECT memberId 
                FROM KHRA_MemberContributions 
                WHERE contributionPaymentRef IS NOT NULL          
            )
    `;

    if (searchText) {
      totalQuery += ` AND k.contributionText LIKE @searchText`;
      dataQuery += ` AND k.contributionText LIKE @searchText`;
    }

    dataQuery += `
      ORDER BY k.contributionId ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const totalResult = await pool.request()
      .input('searchText', `%${searchText}%`)
      .query(totalQuery);

    const total = totalResult.recordset[0].total;

    const result = await pool.request()
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



//-----Contribution Pending Details------//

exports.conPendingDetails = async () => {
    try {
        const pool = await db;
        const result = await pool.request().query(`
            SELECT DISTINCT m.memberBusinessName, m.memberName as ownerName, d.memberName, g.groupLevel as memberType, c.contributionAmount, c.contributionId, d.memberUserId
            FROM KHRA_Users u
            JOIN KHRA_Members m ON u.userId = m.memberUserId
            JOIN KHRA_Members d ON u.userId = d.memberParentId
            JOIN KHRA_MemberGroups g ON d.memberGroupId = g.groupId
            JOIN KHRA_Contributions c ON m.memberId = c.contributionMemberId
            WHERE c.contributionMemberId NOT IN (
                SELECT memberId 
                FROM KHRA_MemberContributions                
            ) AND d.memberStatus<>9
        `);

        const groupedResult = result.recordset.reduce((acc, row) => {
            let owner = acc.find(o => o.ownerData.memberBusinessName === row.memberBusinessName && o.ownerData.ownerName === row.ownerName);
            if (!owner) {
                owner = {
                    ownerData: {
                        memberBusinessName: row.memberBusinessName,
                        ownerName: row.ownerName
                    },
                    MemberSubData: []
                };
                acc.push(owner);
            }

            owner.MemberSubData.push({
                contributionId: row.contributionId,
                memberType: row.memberType,
                memberName: row.memberName,
                contributionAmount: row.contributionAmount,
                memberUserId: row.memberUserId
            });

            return acc;
        }, []);

        return groupedResult;

    } catch (error) {
        throw error;
    }
};



exports.ApproveContribution = async (contributionId, activeStatus) => {
  try {
    const pool = await db;

    let result;
    if (activeStatus === true) {
      result = await pool.request()
        .input('contributionId', contributionId)
        .input('activeStatus', activeStatus)
        .query(`
          UPDATE KHRA_Contributions
          SET activeStatus = @activeStatus, contributionApprovalStatus = 1, contributionStatus='Approved'
          WHERE contributionId = @contributionId;
        `);
    } else {
      result = await pool.request()
        .input('contributionId', contributionId)
        .input('activeStatus', activeStatus)
        .query(`
          UPDATE KHRA_Contributions
          SET activeStatus = @activeStatus, contributionApprovalStatus = 10, contributionStatus='Rejected'
          WHERE contributionId = @contributionId;
        `);
    }

    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return { status: 'success', message: activeStatus ? 'Contribution Approved Successfully' : 'Contribution Rejected Successfully' };
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};



//-----Contribution Payed Details------//
// exports.conPayedDetails = async () => {
//     try {
//         const pool = await db;
//         const result = await pool.request().query(`
//             SELECT DISTINCT 
//                 CONCAT(c.contributionText, '(', m.memberName, ')') AS contributionDetail,
//                 k.paidDate,
//                 k.contributionPaymentRef
//             FROM KHRA_Users u
//             JOIN KHRA_Members m ON u.userId = m.memberUserId
//             JOIN KHRA_Members d ON u.userId = d.memberParentId
//             JOIN KHRA_MemberContributions k ON d.memberId = k.memberId
//             JOIN KHRA_MemberGroups g ON d.memberGroupId = g.groupId
//             JOIN KHRA_Contributions c ON d.memberId = c.contributionMemberId
//             WHERE c.contributionMemberId IN (
//                 SELECT memberId 
//                 FROM KHRA_MemberContributions 
//                 WHERE contributionPaymentRef IS NOT NULL
//             );
//         `);

//         return result.recordset;
//     } catch (error) {
//         throw error;
//     }
// };

exports.conPayedDetails = async () => {
  try {
      const pool = await db;
      const result = await pool.request().query(`
          				SELECT DISTINCT 
                CONCAT(c.contributionText, '(', m.memberName, ')') AS contributionDetail,
                k.paidDate,
                k.contributionPaymentRef  
				FROM KHRA_Users u
            JOIN KHRA_Members m ON u.userId = m.memberUserId
            JOIN KHRA_MemberContributions k ON m.memberId = k.memberId
            JOIN KHRA_MemberGroups g ON m.memberGroupId = g.groupId
            JOIN KHRA_Contributions c ON k.contributionId = c.contributionId
            WHERE m.memberStatus=9
      `);
      return result.recordset;
  } catch (error) {
      throw error;
  }
};


exports.getContributionDetails = async (ContributionId) => {

  try {

    const pool = await db;

    const result = await pool.request()
      .input('ContributionId', ContributionId)
      .query('select d.contributionId, d.contributionText,t.memberName,d.contributionImgUrl,d.contributionContent,t.memberId from KHRA_Members t,KHRA_Contributions d where d.contributionMemberId=t.memberId and d.contributionId = @ContributionId');

    if (result.recordset.length > 0) {
      const contributionData = result.recordset[0];    
      return contributionData;
    }
    
  } catch (error) {
    throw error;
  }
};



exports.contibutionAmountNotification = async (memberid) => {
  try {
    const pool = await db;

    const result = await pool.request()
      .input('memberid',  memberid)
      .query(`
        SELECT 
          t.contributionId, 
          t.contributionText, 
          t.contributionContent, 
          m.memberName,
		      m.memberBusinessName,
          d.districtName, 
          u.unitName,
          t.contributionAmount,
		      t.contributionImgUrl 
        FROM 
          KHRA_Contributions t
        INNER JOIN 
          KHRA_Members m ON t.contributionMemberId = m.memberId
        INNER JOIN 
          KHRA_Districts d ON m.memberDistrictId = d.districtId
        INNER JOIN 
          KHRA_Units u ON m.memberUnitId = u.unitId
        WHERE 
        t.contributionMemberId = @memberid
      `);

    return result.recordset;
  } catch (error) {
    throw new Error(`Error fetching contribution amount notification: ${error.message}`);
  }
};
