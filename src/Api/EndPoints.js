// Sirf URLs yahan rakhte hain
const BASE_URL = "http://loadcrm.com/datamangement/api";


export const ENDPOINTS = {BASE_URL,

  // AUTH APIs
  LOGIN: `${BASE_URL}/Login/Login`,

   GET_DASHBOARD_TOTALS:
    `${BASE_URL}/DashBoard/GetTotalAmount`,

  // BOOKING APIs
  INSERT_NEW_BOOKING: `${BASE_URL}/NewBooking/Insert_NewBooking`,

  GET_NEW_BOOKINGS: `${BASE_URL}/NewBooking/GetDataNewBooking`,

  GET_SINGLE_BOOKING: `${BASE_URL}/NewBooking/GetSingleData_NewBooking`,

  UPDATE_BOOKING:     `${BASE_URL}/NewBooking/Update_NewBooking`,
    
  DELETE_BOOKING: `${BASE_URL}/NewBooking/Delete_NewBooking`,

  GET_TOTAL_REVENUE: `${BASE_URL}/NewBooking/TotalRevelue`,

  GET_REVENUE_DETAILS:`${BASE_URL}/NewBooking/GetDataRevelue`,

INSERT_ENQUIRY:      `${BASE_URL}/Enquiry/Insert_Enquiry`,
UPDATE_ENQUIRY:      `${BASE_URL}/Enquiry/Update_Enquiry`,
GET_ENQUIRIES:       `${BASE_URL}/Enquiry/GetDataEnquiry`,
GET_SINGLE_ENQUIRY:  `${BASE_URL}/Enquiry/GetSingleData_Enquiry`, 
DELETE_ENQUIRY:      `${BASE_URL}/Enquiry/Delet_Enquiry`,         

    // EXPENSE APIs

  INSERT_EXPENSE: `${BASE_URL}/Expense/Insert_Expense`,

  UPDATE_EXPENSE: `${BASE_URL}/Expense/Update_Expense`,

  GET_EXPENSES: `${BASE_URL}/Expense/GetDataExpense`,

  // USER ID APIs

  UPLOAD_GUEST_IDS: `${BASE_URL}/File/SaveBookingID`,
  
};

