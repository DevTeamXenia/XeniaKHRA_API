
const db = require('../config/db');
const { generateToken } = require('../utils/JWTtokenService');
const { Transaction } = require('mssql');


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



exports.createUser = async (userData) => {
  let transaction;
  try {
    const pool = await db;
    transaction = new Transaction(pool);

    await transaction.begin();

    const existingUser = await transaction.request()
      .input('userName', userData.userName)
      .query('SELECT TOP 1 userName FROM KHRA_Users WHERE userName = @userName');

    if (existingUser.recordset.length > 0) {
      await transaction.rollback();
      return { status: 'failed', message: 'Username already exists' };
    }


    const currentDate = new Date();
    const UserCreatedOn = formatDateToLocalTime(currentDate);

    const resultUser = await transaction.request()
      .input('userGroupId', userData.userGroupId)
      .input('usercompanyId', 1)
      .input('userDistrictId', userData.userDistrictId)
      .input('userUnitId', userData.userUnitId)
      .input('userName', userData.userName)
      .input('password', userData.password)
      .input('userImageUrl', userData.userImageUrl)
      .input('firebaseToken', userData.firebaseToken)
      .input('UserCreatedOn', UserCreatedOn)
      .input('userStatus', true)
      .query(`
      INSERT INTO KHRA_Users (UserGroupId, companyId,UserDistrictId, UserUnitId, UserName, Password, userImageUrl, firebaseToken, UserStatus, UserCreatedOn)
      OUTPUT INSERTED.userId 
      VALUES (@userGroupId, @usercompanyId , @userDistrictId, @userUnitId, @userName, @password, @userImageUrl, @firebaseToken, @userStatus, @UserCreatedOn)
      `);

    if (resultUser.rowsAffected && resultUser.rowsAffected[0] > 0) {
      const userId = resultUser.recordset[0].userId;
 
      const paddedUserId = userId.toString().padStart(4, '0'); 
      const newMembershipNumber = paddedUserId; 

      const currentDate = new Date();
      const membershipDate = formatDateToLocalTime(currentDate);

      const resultMember = await transaction.request()
        .input('memberGroupId', userData.userGroupId)
        .input('memberParentId', userData.memberParentId)
        .input('memberDistrictId', userData.userDistrictId)
        .input('memberUnitId', userData.userUnitId)
        .input('memberUserId', userId)
        .input('memberStatus', 2)
        .input('memberReviseRemarks', userData.memberReviseRemarks)
        .input('membershipNumberPrefix', 'KHRA')
        .input('membershipNumber', newMembershipNumber)
        .input('membershipDate', membershipDate)
        .input('memberActiveStatus', false)
        .input('memberName', userData.memberName)
        .input('memberAddress', userData.memberAddress)
        .input('memberEmail', userData.memberEmail)
        .input('memberMobilenumber', userData.memberMobilenumber)
        .input('memberDob', userData.memberDob)
        .input('memberIdProofNumber', userData.memberIdProofNumber)
        .input('memberBankName', userData.memberBankName)
        .input('memberBankAcName', userData.memberBankAcName)
        .input('memberBankAcNumber', userData.memberBankAcNumber)
        .input('memberBankBranch', userData.memberBankBranch)
        .input('memberIfsc', userData.memberIfsc)
        .input('memberIdUrl1', userData.memberIdUrl1)
        .input('memberIdUrl2', userData.memberIdUrl2)
        .input('memberBusinessName', userData.memberBusinessName)
        .input('memberBusinessAddress', userData.memberBusinessAddress)
        .input('memberAge', userData.memberAge)
        .query(`
          INSERT INTO KHRA_Members (
            memberGroupId, memberParentId, memberDistrictId, memberUnitId, memberUserId, memberStatus,
            memberReviseRemarks, membershipNumberPrefix, membershipNumber, membershipDate, memberActiveStatus,
            memberName, memberAddress, memberEmail, memberMobilenumber, memberDob, memberIdProofNumber,
            memberBankName, memberBankAcName, memberBankAcNumber, memberBankBranch, memberIfsc,
            memberIdUrl1, memberIdUrl2, memberBusinessName, memberBusinessAddress, memberAge
          )
          OUTPUT INSERTED.memberId 
          VALUES (
            @memberGroupId, @memberParentId, @memberDistrictId, @memberUnitId, @memberUserId, @memberStatus,
            @memberReviseRemarks, @membershipNumberPrefix, @membershipNumber, @membershipDate, @memberActiveStatus,
            @memberName, @memberAddress, @memberEmail, @memberMobilenumber, @memberDob, @memberIdProofNumber,
            @memberBankName, @memberBankAcName, @memberBankAcNumber, @memberBankBranch, @memberIfsc,
            @memberIdUrl1, @memberIdUrl2, @memberBusinessName, @memberBusinessAddress, @memberAge
          )
        `);

      if (resultMember.rowsAffected && resultMember.rowsAffected[0] > 0) {
        const memberId = resultMember.recordset[0].memberId;

        const prefixResult = await transaction.request()
          .input('memberId', memberId)
          .query(`
            SELECT CONCAT(
              (SELECT c.assMemberSchmPrefix FROM KHRA_CompanyProfile c),
              s.districtMemberSchmPrefix,
              u.unitMemNumberPrefix
            ) AS membershipNumberPrefix
            FROM KHRA_Members t
            JOIN KHRA_Users f ON f.userId = t.memberUserId
            JOIN KHRA_Districts s ON s.districtId = t.memberDistrictId
            JOIN KHRA_Units u ON u.unitId = t.memberUnitId
            WHERE t.memberId = @memberId
          `);

        const newPrefix = prefixResult.recordset[0].membershipNumberPrefix;

        await transaction.request()
          .input('memberId', memberId)
          .input('membershipNumberPrefix', newPrefix)
          .query(`
            UPDATE KHRA_Members
            SET membershipNumberPrefix = @membershipNumberPrefix
            WHERE memberId = @memberId
          `);

        const resultNominee = await transaction.request()
          .input('nomineeMemberId', memberId)
          .input('nomineeName', userData.nomineeName)
          .input('nomineeAddress', userData.nomineeAddress)
          .input('nomineeEmail', userData.nomineeEmail)
          .input('nomineeMobilenumber', userData.nomineeMobilenumber)
          .input('nomineeIdProof', userData.nomineeIdProof)
          .input('nomineeIdProofNumber', userData.nomineeIdProofNumber)
          .input('nomineeBankName', userData.nomineeBankName)
          .input('nomineeBankAcName', userData.nomineeBankAcName)
          .input('nomineeBankAcNumber', userData.nomineeBankAcNumber)
          .input('nomineeBankBranch', userData.nomineeBankBranch)
          .input('nomineeIfsc', userData.nomineeIfsc)
          .input('nomineeIdUrl1', userData.nomineeIdUrl1)
          .input('nomineeIdUrl2', userData.nomineeIdUrl2)
          .input('nomineeApprovalStatus', 0)
          .input('nomineeStatus', userData.nomineeStatus)
          .input('nomineeRelation', userData.nomineeRelation)
          .query(`
              INSERT INTO KHRA_Nominee (
                nomineeMemberId, nomineeName, nomineeAddress, nomineeEmail, nomineeMobilenumber, nomineeIdProof,
                nomineeIdProofNumber, nomineeBankName, nomineeBankAcName, nomineeBankAcNumber, nomineeBankBranch,
                nomineeIfsc, nomineeIdUrl1, nomineeIdUrl2, nomineeApprovalStatus, nomineeStatus, nomineeRelation
              )
              OUTPUT INSERTED.nomineeMemberId 
              VALUES (
                @nomineeMemberId, @nomineeName, @nomineeAddress, @nomineeEmail, @nomineeMobilenumber, @nomineeIdProof,
                @nomineeIdProofNumber, @nomineeBankName, @nomineeBankAcName, @nomineeBankAcNumber, @nomineeBankBranch,
                @nomineeIfsc, @nomineeIdUrl1, @nomineeIdUrl2, @nomineeApprovalStatus, @nomineeStatus, @nomineeRelation
              )
            `);

        if (resultNominee.rowsAffected && resultNominee.rowsAffected[0] > 0) {
          await transaction.commit();
          const userobj = { "userType": userData.userGroupId, "userName": userData.userName, "userId": userId, "districtId": userData.userDistrictId, "unitId": userData.userUnitId };
          const token = generateToken(userobj);
          return { status: 'success', message: 'User created successfully', token: token };
        } else {
          await transaction.rollback();
          throw new Error('Failed to create nominee. No rows affected.');
        }
      } else {
        await transaction.rollback();
        throw new Error('Failed to create member. No rows affected.');
      }
    } else {
      await transaction.rollback();
      throw new Error('Failed to create user. No rows affected.');
    }
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};



exports.loginUser = async (userData) => {
  try {
    const pool = await db;
    const result = await pool.request()
      .input('username', userData.username)
      .input('password', userData.password)
      .query('SELECT * FROM KHRA_Users WHERE userName = @username and userStatus=1');
    const user = result.recordset[0];

    if (!user) {
      return { error: 'Invalid username...!' }; 
    }

    if (user.password !== userData.password) {
      return { error: 'Invalid password..!' }; 
    }

    if (userData.firebaseToken) {
      await pool.request()
        .input('userId', user.userId)
        .input('firebaseToken', userData.firebaseToken)
        .query('UPDATE KHRA_Users SET firebaseToken = @firebaseToken WHERE userId = @userId');
    }
      
        const userobj={"userType":user.userGroupId,"userName":user.userName,"userId":user.userId,"loginId":user.userUnitId,"districtId":user.userDistrictId,"unitId":user.userUnitId}
        const token = generateToken(userobj); 
        return { token }; 
      
    } catch (error) {
      throw error;
    }
  };
  