const db = require('../config/db');


// Function to get all units
exports.getAllPayment = async () => {
    try {
      const pool = await db;
      const result = await pool.request().query('SELECT * FROM KHRA_Settings');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  };
  
  // Function to update a unit
  exports.updatePayments = async (settings) => {
    try {
        const pool = await db;
        const transaction = pool.transaction();

        try {
            await transaction.begin();

            for (const setting of settings) {
                const { settingId, settingName, settingValue, paymentGateway } = setting;

                await transaction.request()
                    .input('settingId', settingId)
                    .input('settingName', settingName)
                    .input('settingValue', settingValue)
                    .input('paymentGateway', paymentGateway)
                    .query(`
                        UPDATE KHRA_Settings
                        SET settingValue = @settingValue
                        WHERE settingId = @settingId;
                    `);
            }

            await transaction.commit();
            return { status: 'success', message: 'Amount updated successfully' };
        } catch (error) {
            await transaction.rollback();
            throw error;
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

exports.registrationPayment = async (userid, conbData) => {
    try {
      const pool = await db;
      const currentDate = new Date();
      const paidDate = formatDateToLocalTime(currentDate);
  
      const memberIdResult = await pool.request()
        .input('userid', userid)
        .query(`
          SELECT memberId 
          FROM KHRA_Members 
          WHERE memberUserId = @userid;
        `);
  
      if (memberIdResult.recordset.length === 0) {
        return { status: 'fail', message: 'User not found' };
      }
  
      const memberId = memberIdResult.recordset[0].memberId;
  
      const insertResult = await pool.request()
        .input('memberId', memberId)
        .input('paidAmount', conbData.paidAmount)
        .input('paymentTypeId', conbData.paymentTypeId)
        .input('paidDate', paidDate)
        .input('paidBy', userid)
        .input('paidDistrict', conbData.paidDistrict)
        .input('paidUnit', conbData.paidUnit)
        .input('payMode', conbData.payMode)
        .input('paymentStatus',conbData.paymentStatus)
        .input('PaymentPaymentId', conbData.PaymentRef)
        .input('PaymentOrderId', conbData.PaymentOrderId)
        .input('PaymentSignature', conbData.PaymentSignature)
        .query(`
          INSERT INTO KHRA_MemberPayment 
          (memberId, paidAmount, paymentTypeId, paidDate, paidBy, paidDistrict, paidUnit, payMode, paymentStatus, PaymentPaymentId, PaymentOrderId,PaymentSignature)
          VALUES 
          (@memberId, @paidAmount, @paymentTypeId, @paidDate, @paidBy, @paidDistrict, @paidUnit, @payMode, @paymentStatus, @PaymentPaymentId, @PaymentOrderId, @PaymentSignature);
        `);
  
      if (insertResult.rowsAffected && insertResult.rowsAffected[0] > 0) {

        let memberStatus;

        if(conbData.paymentStatus === 'success'){
          if (conbData.paymentTypeId === 1) {
            memberStatus = 3;
          } else if (conbData.paymentTypeId === 2) {
            memberStatus = 4;
          }
          else if (conbData.paymentTypeId === 4) {
            memberStatus = 11;
          }
    
          if (memberStatus) {
            await pool.request()
              .input('userid', userid)
              .input('memberStatus', memberStatus)
              .query(`
                UPDATE KHRA_Members 
                SET memberStatus = @memberStatus 
                WHERE memberUserId = @userid;
              `);
          }
        }
       
        return { status: 'success', message: 'Payment update successful' };

      } else {
        return { status: 'fail', message: 'Payment failed' };
      }
    } catch (error) {
      throw error;
    }
  };
  

  exports.contributionPayment = async (userid, conbData) => {
    try {
      const pool = await db;
      const currentDate = new Date();
      const paidDate = formatDateToLocalTime(currentDate);
  
      const memberIdResult = await pool.request()
        .input('userid', userid)
        .query(`
          SELECT memberId 
          FROM KHRA_Members 
          WHERE memberUserId = @userid;
        `);
  
      if (memberIdResult.recordset.length === 0) {
        return { status: 'fail', message: 'User not found' };
      }
  
      const memberId = memberIdResult.recordset[0].memberId;
  
      const insertResult = await pool.request()
        .input('contributionId', conbData.contributionId)
        .input('memberId', memberId)
        .input('contributionAmount', conbData.contributionAmount)
        .input('paidDate', paidDate)
        .input('paidBy', userid)
        .input('paidDistrict', conbData.paidDistrict)
        .input('paidUnit', conbData.paidUnit)
        .input('payMode', conbData.payMode)
        .input('paymentStatus', conbData.paymentStatus)
        .input('contributionPaymentId', conbData.contributionPaymentRef)
        .input('contributionOrderId', conbData.contributionOrderId)
        .input('contributionSignature', conbData.contributionSignature)
        .query(`
          INSERT INTO KHRA_MemberContributions 
          (contributionId, memberId, contributionAmount, paidDate, paidBy, paidDistrict, paidUnit, payMode, paymentStatus, contributionPaymentId, contributionOrderId, contributionSignature)
          VALUES 
          (@contributionId, @memberId, @contributionAmount, @paidDate, @paidBy, @paidDistrict, @paidUnit, @payMode, @paymentStatus, @contributionPaymentId, @contributionOrderId, @contributionSignature);
        `);
  
      if (insertResult.rowsAffected && insertResult.rowsAffected[0] > 0) {

        if(conbData.paymentStatus == 'success'){
          await pool.request()
          .input('userid', userid)
          .query(`
            UPDATE KHRA_Members 
            SET memberStatus = 9
            WHERE memberUserId = @userid;
          `);
        }
     
        return { status: 'success', message: 'contribution Payment update successful' };
        
      } else {
        return { status: 'fail', message: 'Payment failed' };
      }
    } catch (error) {
      throw error;
    }
  };
  
