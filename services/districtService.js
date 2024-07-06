const db = require('../config/db');

// Function to get all district
exports.getAllDistrict = async () => {
    try {
      const pool = await db;
      const result = await pool.request().query('SELECT * FROM KHRA_Districts');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  };


  
  exports.updatedistrict = async (district, unitData) => {
    try {
        const pool = await db;
        const districtUpdateResult = await pool.request()
            .input('districtId', district)
            .input('contactPerson1', unitData.contactPerson1)
            .input('contactNumber1', unitData.contactNumber1)
            .input('emailAddress1', unitData.emailAddress1)
            .input('contactPerson2', unitData.contactPerson2)
            .input('contactNumber2', unitData.contactNumber2)
            .input('status', unitData.status)
            .query(`
                UPDATE KHRA_Districts
                SET contactPerson1 = @contactPerson1,
                    contactNumber1 = @contactNumber1,
                    emailAddress1 = @emailAddress1,
                    contactPerson2 = @contactPerson2,
                    contactNumber2 = @contactNumber2,
                    status = @status
                WHERE districtId = @districtId;
            `);

        if (districtUpdateResult.rowsAffected && districtUpdateResult.rowsAffected[0] > 0) {
            const userUpdateResult = await pool.request()
                .input('password', unitData.password)
                .input('userName', unitData.contactPerson1)
                .input('userDistrictId', district)
                .query(`
                    UPDATE KHRA_Users
                    SET password = @password,
                        userName = @userName
                    WHERE userDistrictId = @userDistrictId;
                `);

            if (userUpdateResult.rowsAffected && userUpdateResult.rowsAffected[0] > 0) {
                return { status: 'success', message: 'District updated successfully' };
            } else {
                return { status: 'partial success', message: 'District updated, but user update failed' };
            }
        } else {
            return { status: 'failure', message: 'District update failed' };
        }
    } catch (error) {
        throw error;
    }
};
