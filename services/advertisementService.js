
const db = require('../config/db');


exports.createadvertisement = async (conbData) => {
    try {
        const pool = await db;
        
        const currentDate = new Date();

        const advertisementCreatedDate = formatDateToLocalTime(currentDate);
  
        const result = await pool.request()
            .input('advertisementName', conbData.advertisementName)
            .input('districtId', conbData.districtId)
            .input('fileUrl', conbData.fileUrl)
            .input('advertisementCreatedUser', conbData.advertisementCreatedUser)
            .input('advertisementCreatedDate', advertisementCreatedDate)
            .input('advertisementContent', conbData.advertisementContent)
            .input('advertisementStartDate', conbData.advertisementStartDate)
            .input('advertisementEndDate', conbData.advertisementEndDate)
            .input('advertisementStatus', 'Created')
            .input('activeStatus', false)
            .input('advertisementApproveStatus', 0)
            .query(`
                INSERT INTO KHRA_Advertisement 
                (advertisementName, districtId, fileUrl, advertisementCreatedUser, advertisementCreatedDate, advertisementContent, advertisementStartDate, advertisementEndDate, advertisementStatus, activeStatus, advertisementApproveStatus)
                VALUES 
                (@advertisementName, @districtId, @fileUrl, @advertisementCreatedUser, @advertisementCreatedDate, @advertisementContent, @advertisementStartDate, @advertisementEndDate, @advertisementStatus, @activeStatus, @advertisementApproveStatus);
            `);
  
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            return { status: 'success', message: 'Advertisement created successfully' };
        } else {
            return { status: 'fail', message: 'Advertisement not created' };
        }
    } catch (error) {
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


  exports.updateAdvertisement = async (advertisementId, conbData) => {
    try {
      const pool = await db;

      const currentDate = new Date();

      const advertisementModifiedDate = formatDateToLocalTime(currentDate);
  
      const result = await pool.request()
      .input('advertisementId', advertisementId)  
      .input('advertisementName', conbData.advertisementName)   
      .input('districtId', conbData.districtId)
      .input('fileUrl', conbData.fileUrl) 
      .input('advertisementModifiedUser', conbData.advertisementModifiedUser) 
      .input('advertisementModifiedDate', advertisementModifiedDate) 
      .input('advertisementContent', conbData.advertisementContent) 
      .input('advertisementStartDate', conbData.advertisementStartDate) 
      .input('advertisementEndDate', conbData.advertisementEndDate) 
      .input('advertisementStatus', 'Updated')
        .query(`
          UPDATE KHRA_Advertisement
          SET advertisementName = @advertisementName, districtId=@districtId, fileUrl = @fileUrl, advertisementModifiedUser = @advertisementModifiedUser, advertisementModifiedDate = @advertisementModifiedDate, advertisementContent = @advertisementContent, advertisementStartDate = @advertisementStartDate, advertisementEndDate = @advertisementEndDate, advertisementStatus=@advertisementStatus              
          WHERE advertisementId = @advertisementId;
        `);
        
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            return { status: 'success', message: 'Advertisement Updated successfully'};
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
            .query(`SELECT t.advertisementId, t.advertisementName, d.districtName
                    FROM KHRA_Advertisement t
                    JOIN KHRA_Districts d ON t.districtId = d.districtId
                    WHERE t.advertisementName LIKE @partialName
                    OR d.districtName LIKE @partialName`);

        return result.recordset.map(row => ({ 
            advertisementId: row.advertisementId, 
            advertisementName: row.advertisementName, 
            districtName: row.districtName 
        }));
    } catch (error) {
        throw error;
    }
};



exports.getStateadvertisement = async ({ page, limit, searchText, districtid, fromdate, todate, advertisementId }) => {
    const offset = (page - 1) * limit;
    try {
        const pool = await db;

        let totalQuery = `
            SELECT COUNT(*) as total 
            FROM KHRA_Advertisement t 
            JOIN KHRA_Districts d 
            ON t.districtId = d.districtId
            WHERE 1=1
        `;

        let dataQuery = `
            SELECT t.advertisementId,
                   d.districtName,
                   t.districtId,
                   t.advertisementName, 
                   t.activeStatus,
                   FORMAT(t.advertisementStartDate, 'yyyy-MM-dd') as advertisementStartDate,
                   FORMAT(t.advertisementEndDate, 'yyyy-MM-dd') as advertisementEndDate
        `;

        if (advertisementId) {
            dataQuery += `,
                   t.fileUrl,
                   t.advertisementContent
            `;
        }

        dataQuery += `
            FROM KHRA_Advertisement t 
            JOIN KHRA_Districts d 
            ON t.districtId = d.districtId
            WHERE 1=1
        `;

        const inputParams = {
            searchText: `%${searchText}%`,
            districtid,
            fromdate,
            todate,
            advertisementId,
            limit,
            offset
        };

        if (searchText) {
            totalQuery += ` AND (d.districtName LIKE @searchText OR t.advertisementName LIKE @searchText)`;
            dataQuery += ` AND (d.districtName LIKE @searchText OR t.advertisementName LIKE @searchText)`;
        }

        if (districtid) {
            totalQuery += ` AND t.districtId = @districtid`;
            dataQuery += ` AND t.districtId = @districtid`;
        }

        if (fromdate && todate) {
            totalQuery += ` AND t.advertisementCreatedDate BETWEEN @fromdate AND @todate`;
            dataQuery += ` AND t.advertisementCreatedDate BETWEEN @fromdate AND @todate`;
        }

        if (advertisementId) {
            totalQuery += ` AND t.advertisementId = @advertisementId`;
            dataQuery += ` AND t.advertisementId = @advertisementId`;
        }

        dataQuery += `
            ORDER BY t.advertisementId ASC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `;

        const totalResult = await pool.request()
            .input('searchText', inputParams.searchText)
            .input('districtid', inputParams.districtid)
            .input('fromdate', inputParams.fromdate)
            .input('todate', inputParams.todate)
            .input('advertisementId', inputParams.advertisementId)
            .query(totalQuery);

        const total = totalResult.recordset[0].total;

        const result = await pool.request()
            .input('searchText', inputParams.searchText)
            .input('districtid', inputParams.districtid)
            .input('fromdate', inputParams.fromdate)
            .input('todate', inputParams.todate)
            .input('advertisementId', inputParams.advertisementId)
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



exports.ApproveAdvertisement = async (advertisementId, activeStatus) => {
    try {
      const pool = await db;
  
      let result;
      if (activeStatus === true) {
        result = await pool.request()
          .input('advertisementId', advertisementId)
          .input('activeStatus', activeStatus)
          .query(`
            UPDATE KHRA_Advertisement
            SET activeStatus = @activeStatus, advertisementApproveStatus = 1, advertisementStatus='Approved'
            WHERE advertisementId = @advertisementId;
          `);
      } else {
        result = await pool.request()
          .input('advertisementId', advertisementId)
          .input('activeStatus', activeStatus)
          .query(`
            UPDATE KHRA_Advertisement
            SET activeStatus = @activeStatus, advertisementApproveStatus = 11, advertisementStatus='Rejected'
            WHERE advertisementId = @advertisementId;
          `);
      }
  
      if (result.rowsAffected && result.rowsAffected[0] > 0) {
        return { status: 'success', message: activeStatus ? 'Advertisement Approved Successfully' : 'Advertisement Rejected Successfully' };
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  };


  exports.getadvertisementList = async () => {
    try {
        const pool = await db;
        const result = await pool.request()
            .query(`SELECT advertisementName,
                           fileUrl,
                           advertisementContent 
                    FROM KHRA_Advertisement 
                    WHERE activeStatus=1 
                      AND advertisementApproveStatus=1`);

        return result.recordset.map(row => ({
            advertisementName: row.advertisementName,
            fileUrl: row.fileUrl,
            advertisementContent: row.advertisementContent
        }));
    } catch (error) {
        throw error;
    }
};