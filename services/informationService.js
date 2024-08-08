
const db = require('../config/db');


exports.createInformation = async (conbData) => {
    try {
        const pool = await db;
        
        const currentDate = new Date();

        const informationCreatedDate = formatDateToLocalTime(currentDate);
  
        const result = await pool.request()
            .input('informationName', conbData.informationName)
            .input('districtId', conbData.districtId)
            .input('informationImgUrl', conbData.informationImgUrl)
            .input('informationCreatedUser', conbData.informationCreatedUser)
            .input('informationCreatedDate', informationCreatedDate)
            .input('informationContent', conbData.informationContent)
            .input('informationStartDate', conbData.informationStartDate)
            .input('informationEndDate', conbData.informationEndDate)
            .input('informationStatus', 'Created')
            .input('activeStatus', false)
            .input('informationApproveStatus', 0)
            .query(`
                INSERT INTO KHRA_Information 
                (informationName, districtId, informationImgUrl, informationCreatedUser, informationCreatedDate, informationContent, informationStartDate, informationEndDate, informationStatus, activeStatus, informationApproveStatus)
                VALUES 
                (@informationName, @districtId, @informationImgUrl, @informationCreatedUser, @informationCreatedDate, @informationContent, @informationStartDate, @informationEndDate, @informationStatus, @activeStatus, @informationApproveStatus);
            `);
  
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            return { status: 'success', message: 'Information created successfully' };
        } else {
            return { status: 'fail', message: 'Information not created' };
        }
    } catch (error) {
        throw error;
    }
};

function formatDateToLocalTime(date) {
    const pad = (number) => number.toString().padStart(2, '0');
  const padMilliseconds = (number) => number.toString().padStart(3, '0');

  // Convert UTC to IST
  const istOffset = 330; // 5 hours 30 minutes in minutes
  const localDate = new Date(date.getTime() + istOffset * 60000); // 60000 ms per minute

  const year = localDate.getFullYear();
  const month = pad(localDate.getMonth() + 1);
  const day = pad(localDate.getDate());
  const hours = pad(localDate.getHours());
  const minutes = pad(localDate.getMinutes());
  const seconds = pad(localDate.getSeconds());
  const milliseconds = padMilliseconds(localDate.getMilliseconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  }




  exports.updateInformation = async (informationId, conbData) => {
    try {
      const pool = await db;

      const currentDate = new Date();

      const informationModifiedDate = formatDateToLocalTime(currentDate);
  
      const result = await pool.request()
      .input('informationId', informationId)  
      .input('informationName', conbData.informationName)   
      .input('districtId', conbData.districtId)
      .input('informationImgUrl', conbData.informationImgUrl) 
      .input('informationModifiedUser', conbData.informationModifiedUser) 
      .input('informationModifiedDate', informationModifiedDate) 
      .input('informationContent', conbData.informationContent) 
      .input('informationStartDate', conbData.informationStartDate) 
      .input('informationEndDate', conbData.informationEndDate) 
      .input('informationStatus', 'Updated')
        .query(`
          UPDATE KHRA_Information
          SET informationName = @informationName, districtId=@districtId, informationImgUrl = @informationImgUrl, informationModifiedUser = @informationModifiedUser, informationModifiedDate = @informationModifiedDate, informationContent = @informationContent, informationStartDate = @informationStartDate, informationEndDate = @informationEndDate, informationStatus=@informationStatus              
          WHERE informationId = @informationId;
        `);
        
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            return { status: 'success', message: 'Information Updated successfully'};
          }
        
    } catch (error) {
      throw error;
    }
  };


  exports.getIndormationByPartialName = async (partialName) => {
    try {
        const pool = await db;
        const result = await pool.request()
            .input('partialName', '%' + partialName + '%')
            .query(`SELECT t.informationId, t.informationName, d.districtName
                    FROM KHRA_Information t
                    JOIN KHRA_Districts d ON t.districtId = d.districtId
                    WHERE t.informationName LIKE @partialName
                    OR d.districtName LIKE @partialName`);

        return result.recordset.map(row => ({ 
            informationId: row.informationId, 
            informationName: row.informationName, 
            districtName: row.districtName 
        }));
    } catch (error) {
        throw error;
    }
};


exports.getStateInformation = async ({ page, limit, searchText, districtid, fromdate, todate, informationId }) => {
    const offset = (page - 1) * limit;
    try {
        const pool = await db;

        let totalQuery = `
            SELECT COUNT(*) as total 
            FROM KHRA_Information t 
            JOIN KHRA_Districts d 
            ON t.districtId = d.districtId
            WHERE 1=1
        `;

        let dataQuery = `
            SELECT t.informationId,
                   d.districtName,
                   t.districtId,
                   t.informationName, 
                   t.activeStatus,
                   FORMAT(t.informationStartDate, 'yyyy-MM-dd') as informationStartDate,
                   FORMAT(t.informationEndDate, 'yyyy-MM-dd') as informationEndDate
        `;

        if (informationId) {
            dataQuery += `,
                   t.informationImgUrl,
                   t.informationContent
            `;
        }

        dataQuery += `
            FROM KHRA_Information t 
            JOIN KHRA_Districts d 
            ON t.districtId = d.districtId
            WHERE 1=1
        `;

        const inputParams = {
            searchText: `%${searchText}%`,
            districtid,
            fromdate,
            todate,
            informationId,
            limit,
            offset
        };

        if (searchText) {
            totalQuery += ` AND (d.districtName LIKE @searchText OR t.informationName LIKE @searchText)`;
            dataQuery += ` AND (d.districtName LIKE @searchText OR t.informationName LIKE @searchText)`;
        }

        if (districtid) {
            totalQuery += ` AND t.districtId = @districtid`;
            dataQuery += ` AND t.districtId = @districtid`;
        }

        if (fromdate && todate) {
            totalQuery += ` AND t.informationCreatedDate BETWEEN @fromdate AND @todate`;
            dataQuery += ` AND t.informationCreatedDate BETWEEN @fromdate AND @todate`;
        }

        if (informationId) {
            totalQuery += ` AND t.informationId = @informationId`;
            dataQuery += ` AND t.informationId = @informationId`;
        }

        dataQuery += `
            ORDER BY t.informationId ASC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `;

        const totalResult = await pool.request()
            .input('searchText', inputParams.searchText)
            .input('districtid', inputParams.districtid)
            .input('fromdate', inputParams.fromdate)
            .input('todate', inputParams.todate)
            .input('informationId', inputParams.informationId)
            .query(totalQuery);

        const total = totalResult.recordset[0].total;

        const result = await pool.request()
            .input('searchText', inputParams.searchText)
            .input('districtid', inputParams.districtid)
            .input('fromdate', inputParams.fromdate)
            .input('todate', inputParams.todate)
            .input('informationId', inputParams.informationId)
            .input('limit', inputParams.limit)
            .input('offset', inputParams.offset)
            .query(dataQuery);

        return {
            records: result.recordset,
            total,
            amount: total 
        };
    } catch (error) {
        throw error;
    }
};


exports.ApproveInformation = async (informationId, activeStatus) => {
    try {
      const pool = await db;
  
      let result;
      if (activeStatus === true) {
        result = await pool.request()
          .input('informationId', informationId)
          .input('activeStatus', activeStatus)
          .query(`
            UPDATE KHRA_Information
            SET activeStatus = @activeStatus, informationApproveStatus = 1, informationStatus='Approved'
            WHERE informationId = @informationId;
          `);
      } else {
        result = await pool.request()
          .input('informationId', informationId)
          .input('activeStatus', activeStatus)
          .query(`
            UPDATE KHRA_Information
            SET activeStatus = @activeStatus, informationApproveStatus = 11, informationStatus='Rejected'
            WHERE informationId = @informationId;
          `);
      }
  
      if (result.rowsAffected && result.rowsAffected[0] > 0) {
        return { status: 'success', message: activeStatus ? 'Information Approved Successfully' : 'Information Rejected Successfully' };
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  };
