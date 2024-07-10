const db = require('../config/db');


exports.getAccStatusAndPaymentHistory = async (userId) => {
  try {
    const pool = await db;

    const statusResult = await pool.request()
      .input('userId', userId)
      .query('SELECT t.status, t.statusId, d.memberId FROM KHRA_Status t, KHRA_Members d WHERE t.statusId = d.memberStatus AND d.memberUserId = @userId');

    const userStatus = statusResult.recordset[0];

    if (userStatus.statusId === 2) {
      const paymentHistoryResult = await pool.request()
        .input('memberId', userStatus.memberId)
        .query(`
          SELECT ph.PaymentOrderId, ph.PaymentPaymentId, ph.PaymentSignature
          FROM KHRA_MemberPayment ph
          WHERE ph.paymentStatus = 'pending' AND ph.memberId = @memberId
        `);

      const pendingPayments = paymentHistoryResult.recordset;


      if (pendingPayments.length > 0) {
        return {
          status: userStatus,
          pendingPayments: pendingPayments
        };
      }
    }else if(userStatus.statusId === 3){
      const paymentCoHistoryResult = await pool.request()
      .input('memberId', userStatus.memberId)
      .query(`
        SELECT ph.contributionPaymentId, ph.contributionPaymentId, ph.contributionSignature
        FROM KHRA_MemberContributions ph
        WHERE ph.paymentStatus = 'pending' AND ph.memberId = @memberId
      `);

    const pendingCoPayments = paymentCoHistoryResult.recordset;


    if (pendingCoPayments.length > 0) {
      return {
        status: userStatus,
        pendingPayments: pendingCoPayments
      };
    }
        
  }

    return { status: userStatus};
  } catch (error) {
    throw error;
  }
};


  exports.getTermsAndConditions = async (statusId) => {
    try {
        const pool = await db;
        
        let column;
        switch (statusId) {
            case '1':
                column = 'assTermsAndConditionsENG';
                break;
            case '2':
                column = 'assTermsAndConditionsHND';
                break;
            case '3':
                column = 'assTermsAndConditionsML';
                break;
            case '4':
                column = 'assTermsAndConditionsTN';
                break;
            default:
                throw new Error('Invalid statusId');
        }
        
        const query = `SELECT ${column} AS TermsAndConditions FROM KHRA_CompanyProfile t WHERE ${column} IS NOT NULL`;
        
        const result = await pool.request()
            .input('statusId', statusId)
            .query(query);
        
        const jsonTerms = result.recordset[0].TermsAndConditions;
        const termsObject = JSON.parse(jsonTerms);


        let html = "<html><body>";
        
        for (let section in termsObject) {
            html += `<h2>${section}</h2><ul>`;
            for (let item of termsObject[section]) {
                html += `<p>${item}</p>`;
            }
            html += "</ul>";
        }
        
        html += "</body></html>";

        return html;
    } catch (error) {
        throw error;
    }
};



exports.getPrivacyPolicy = async (statusId) => {
  try {
    const pool = await db;

    let column;
    switch (statusId) {
      case '1':
        column = 'assPrivacyPolicyENG';
        break;
      case '2':
        column = 'assPrivacyPolicyHND';
        break;
      case '3':
        column = 'assPrivacyPolicyML';
        break;
      case '4':
        column = 'assPrivacyPolicyTN';
        break;
      default:
        throw new Error('Invalid statusId');
    }

    const query = `SELECT ${column} AS PrivacyPolicy FROM KHRA_CompanyProfile t WHERE ${column} IS NOT NULL`;

    const result = await pool.request()
      .input('statusId', statusId)
      .query(query);

    const jsonPolicy = result.recordset[0].PrivacyPolicy;
    const policyObject = JSON.parse(jsonPolicy);

    let html = "<html><body>";

    for (let section in policyObject) {
      html += `<h2>${section}</h2><ul>`;
      for (let item of policyObject[section]) {
        // Replace text wrapped with ** with bold HTML tags
        item = item.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
        html += `<p>${item}</p>`;
      }
      html += "</ul>";
    }

    html += "</body></html>";

    return html;
  } catch (error) {
    throw error;
  }
};



  

exports.getfamilymember = async (userId) => {
    try {
      const pool = await db;
      const result = await pool.request()
        .input('userId', userId)
        .query('SELECT t.memberBusinessName, t.memberBusinessAddress, d.districtName, u.unitName, t.memberUserId, t.memberDistrictId, t.memberUnitId FROM KHRA_Members t JOIN KHRA_Districts d ON t.memberDistrictId = d.districtId JOIN KHRA_Units u ON t.memberUnitId = u.unitId WHERE t.memberUserId = @userId');
  
      if (result.recordset.length === 1) {
        return result.recordset[0];
      } else if (result.recordset.length > 1) {
        return result.recordset; 
      } else {
        return null; 
      }
    } catch (error) {
      throw error;
    }
  };
  
  
  