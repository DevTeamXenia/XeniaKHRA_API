const db = require('../config/db');

// Function to create a new unit
exports.createUnit = async (unitData) => {
  try {
    const pool = await db;

    const existingUser = await pool.request()
      .input('unitContactPerson', unitData.unitContactPerson)
      .query('SELECT TOP 1 userName FROM KHRA_Users WHERE userName = @unitContactPerson');

    if (existingUser.recordset.length > 0) {
      return { status: 'failed', message: 'Username already exists' };
    }

    const resultMaxMembershipNumber = await pool.request()
      .query('SELECT MAX(CAST(lastMembershipNumber AS INT)) AS maxMembershipNumber FROM KHRA_Units');

    let lastMembershipNumber = 0;
    if (resultMaxMembershipNumber.recordset.length > 0 && resultMaxMembershipNumber.recordset[0].maxMembershipNumber !== null) {
      lastMembershipNumber = parseInt(resultMaxMembershipNumber.recordset[0].maxMembershipNumber, 10);
    }

    const nextMembershipNumber = (lastMembershipNumber + 1).toString().padStart(3, '0');

        const unitDistrictId = unitData.unitDistrictId || 0;

    const result = await pool.request()
      .input('unitName', unitData.unitName)
      .input('unitCode', unitData.unitCode)
      .input('unitDistrictId', unitDistrictId)
      .input('unitContactPerson', unitData.unitContactPerson)
      .input('unitContactPerson2', unitData.unitContactPerson2)
      .input('unitContactNumber', unitData.unitContactNumber)
      .input('unitContactNumber2', unitData.unitContactNumber2)
      .input('unitEmailAddress', unitData.unitEmailAddress)
      .input('unitMemNumberPrefix', 'KHRA')
      .input('lastMembershipNumber', nextMembershipNumber)
      .input('status', true)
      .query(`
        INSERT INTO KHRA_Units (unitName, unitCode, unitDistrictId, unitContactPerson, unitContactPerson2, unitContactNumber, unitContactNumber2, unitEmailAddress, unitMemNumberPrefix, lastMembershipNumber, status)
        OUTPUT INSERTED.unitId 
        VALUES (@unitName, @unitCode, @unitDistrictId, @unitContactPerson, @unitContactPerson2, @unitContactNumber, @unitContactNumber2, @unitEmailAddress, @unitMemNumberPrefix, @lastMembershipNumber, @status);
      `);

    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      const unitId = result.recordset[0].unitId;

      const resultUser = await pool.request()
        .input('userGroupId', 3)
        .input('companyId', 1)
        .input('userDistrictId', unitDistrictId)
        .input('userUnitId', unitId)
        .input('userName', unitData.unitContactPerson)
        .input('password', unitData.password)
        .input('userStatus', true)
        .query(`
          INSERT INTO KHRA_Users (UserGroupId, companyId, UserDistrictId, UserUnitId, UserName, Password, UserStatus)
          OUTPUT INSERTED.userId
          VALUES (@userGroupId, @companyId, @userDistrictId, @userUnitId, @userName, @password, @userStatus)
        `);

        if (resultUser.rowsAffected && resultUser.rowsAffected[0] > 0) {
          return { status: 'success', message: 'Unit created successfully' };
        }

      else{
        return { status: 'faile', message: 'Unit not created' };
      }
    }
  } catch (error) {
    throw error;
  }
};




// Function to update a unit
exports.updateUnit = async (unitId, unitData) => {
  try {
    const pool = await db;
    const result = await pool.request()
      .input('unitId', unitId)
      .input('unitName', unitData.unitName)
      .input('unitCode', unitData.unitCode)
      .input('unitDistrictId', unitData.unitDistrictId)
      .input('unitContactPerson', unitData.unitContactPerson)
      .input('unitContactPerson2', unitData.unitContactPerson2)
      .input('unitContactNumber', unitData.unitContactNumber)
      .input('unitContactNumber2', unitData.unitContactNumber2)
      .input('unitEmailAddress', unitData.unitEmailAddress)
      .input('status', unitData.status)
      .query(`
        UPDATE KHRA_Units
        SET unitName = @unitName, unitCode=@unitCode, unitDistrictId = @unitDistrictId, unitContactPerson = @unitContactPerson,
        unitContactPerson2 = @unitContactPerson2,unitContactNumber = @unitContactNumber,unitContactNumber2 = @unitContactNumber2, unitEmailAddress = @unitEmailAddress,        
        status = @status
        WHERE unitId = @unitId;
      `);
      
      if (result.rowsAffected && result.rowsAffected[0] > 0) {
        const unitupdate = await pool.request()
          .input('userName', unitData.unitContactPerson) 
          .input('password', unitData.password) 
          .input('userStatus', unitData.userStatus) 
          .input('unitId', unitId)
          .query(`
            UPDATE KHRA_Users
            SET                     
              userName = @userName,
              password = @password,
              userStatus = @userStatus
            WHERE userUnitId = @unitId;
          `);

        if (unitupdate.rowsAffected && unitupdate.rowsAffected[0] > 0) {
          return { status: 'success', message: 'Unit Updated successfully'};
        }
      }
  } catch (error) {
    throw error;
  }
};


// Function to delete a unit
exports.deleteUnit = async (unitId) => {
  try {
    const pool = await db;
    const result = await pool.request()
      .input('unitId', unitId)
      .query('DELETE FROM KHRA_Units WHERE unitId = @unitId');
      if (result.rowsAffected && result.rowsAffected[0] > 0) {
        return { status: 'success', message: 'Unit Deleted successfully'};
      }
  } catch (error) {
    throw error;
  }
};


// Function to get all units


exports.getdistrictUnits = async (userId, page, limit, search) => {
  try {
    const pool = await db;

    const districtResult = await pool.request()
      .input('userId', userId)
      .query('SELECT userDistrictId FROM KHRA_Users WHERE userId = @userId');

    const districtId = districtResult.recordset[0].userDistrictId;

    const offset = (page - 1) * limit;

    let searchQuery = '';
    if (search) {
      searchQuery = ` AND (unitName LIKE @search OR unitContactPerson LIKE @search OR unitEmailAddress LIKE @search)`;
    }

    const countQuery = `SELECT COUNT(*) AS totalRecords FROM KHRA_Units WHERE unitDistrictId = @districtId${searchQuery}`;
    const countResult = await pool.request()
      .input('districtId', districtId)
      .input('search', `%${search}%`)
      .query(countQuery);

    const totalRecords = countResult.recordset[0].totalRecords;

    const resultQuery = `SELECT * FROM KHRA_Units WHERE unitDistrictId = @districtId${searchQuery} ORDER BY unitId OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    const result = await pool.request()
      .input('districtId', districtId)
      .input('offset', offset)
      .input('limit', limit)
      .input('search', `%${search}%`)
      .query(resultQuery);

    return {
      units: result.recordset,
      totalRecords
    };
  } catch (error) {
    throw error;
  }
};


exports.getAllstateUnits = async (districtid) => {
  try {
    const pool = await db;
    let query = 'SELECT t.*, d.districtName FROM KHRA_Units t INNER JOIN KHRA_Districts d ON t.unitDistrictId = d.districtId';
      query += ' WHERE t.unitDistrictId = @districtid';
          
    const result = await pool.request()
      .input('districtid', districtid)
      .query(query);

    return result.recordset;
  } catch (error) {
    throw error;
  }
};

// exports.getAllUnits = async () => {
//   try {
//     const pool = await db;
//     let query = 'SELECT t.*, d.districtName FROM KHRA_Units t INNER JOIN KHRA_Districts d ON t.unitDistrictId = d.districtId';
//     const result = await pool.request()
//       .query(query);

//     return result.recordset;
//   } catch (error) {
//     throw error;
//   }
// };

exports.getAllUnits = async (search = '', page = 1, limit = 10) => {
  try {
    const pool = await db;
    let offset = (page - 1) * limit;

    let query = `
      SELECT t.*, d.districtName 
      FROM KHRA_Units t 
      INNER JOIN KHRA_Districts d ON t.unitDistrictId = d.districtId 
      WHERE t.unitName LIKE @search 
        OR t.unitContactPerson LIKE @search 
        OR t.unitEmailAddress LIKE @search
      ORDER BY t.unitId
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
    `;

    let countQuery = `
      SELECT COUNT(*) as totalRecords 
      FROM KHRA_Units t 
      INNER JOIN KHRA_Districts d ON t.unitDistrictId = d.districtId 
      WHERE t.unitName LIKE @search 
        OR t.unitContactPerson LIKE @search 
        OR t.unitEmailAddress LIKE @search;
    `;

    const result = await pool.request()
      .input('search',  `%${search}%`)
      .input('offset',  offset)
      .input('limit',  limit)
      .query(query);

    const countResult = await pool.request()
      .input('search',  `%${search}%`)
      .query(countQuery);

    const totalRecords = countResult.recordset[0].totalRecords;
    const totalPages = Math.ceil(totalRecords / limit);

    return {
      units: result.recordset,
      totalPages,
      currentPage: page,
      limit,
      totalRecords
    };
  } catch (error) {
    throw error;
  }
};


//------Unit level member details API
exports.getunitmember = async () => {
  try {
    const pool = await db;
    const result = await pool.request().query('SELECT * FROM KHRA_Units');
    return result.recordset;
  } catch (error) {
    throw error;
  }
};