import AxiosClient from "./AxoisClient";
import { ENDPOINTS } from "./EndPoints";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ======================================================
// LOGIN
// ======================================================

export const loginUser = async (username, password) => {
  try {
    const response = await AxiosClient.post(ENDPOINTS.LOGIN, {
      Username: username,
      Password: password,
    });

    const token = response.data?.AccessToken;

    if (!token) {
      return { success: false, message: "Token not found" };
    }

    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("userData", JSON.stringify(response.data));

    return { success: true, data: response.data };

  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Login failed",
    };
  }
};

// ======================================================
// LOGOUT
// ======================================================

export const logoutUser = async () => {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("userData");
};

// ======================================================
// GET STORED TOKEN
// ======================================================

export const getStoredToken = async () => {
  return await AsyncStorage.getItem("token");
};

// ======================================================
// DASHBOARD
// ======================================================

export const getDashboardTotals = async (
  filterType = "Today",
  fromDate = "",
  toDate = ""
) => {
  try {
    const payload = {
      FilterType: filterType,
      FromDttm:   fromDate,
      ToDttm:     toDate,
    };

    const response = await AxiosClient.post(
      ENDPOINTS.GET_DASHBOARD_TOTALS,
      payload
    );

    let dashboardArray = [];
    try {
      dashboardArray =
        typeof response.data.data === "string"
          ? JSON.parse(response.data.data)
          : response.data.data || [];
    } catch {
      dashboardArray = [];
    }

    return { success: true, data: dashboardArray[0] || {} };

  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.Message ||
        "Failed to fetch dashboard",
    };
  }
};

// ======================================================
// INSERT BOOKING
// ======================================================

export const insertNewBooking = async (bookingData) => {
  try {
    const response = await AxiosClient.post(
      ENDPOINTS.INSERT_NEW_BOOKING,
      bookingData
    );
    return { success: true, data: response.data };

  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Booking failed",
    };
  }
};

// ======================================================
// GET BOOKINGS
// ======================================================

export const getNewBookings = async () => {
  try {
    const response = await AxiosClient.post(
      ENDPOINTS.GET_NEW_BOOKINGS,
      { FilterType: "", FromDttm: "", ToDttm: "" }
    );

    let bookingArray = [];

    try {
      bookingArray =
        typeof response.data.data === "string"
          ? JSON.parse(response.data.data)
          : response.data.data || [];
    } catch (e) {
      console.log("PARSE ERROR =>", e);
      bookingArray = [];
    }

    console.log("BOOKING ARRAY =>", bookingArray);

    const formattedData = bookingArray.map((item, index) => {
      const checkIn  = new Date(item.CheckInDate);
      const checkOut = new Date(item.CheckOutDate);
      const diffTime = Math.abs(checkOut - checkIn);
      const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        id:            index + 1,
        bookingId:     item.Id            || "",
        member:        item.FullName      || "",
        property:      item.PropertyName  || "",
        plan:          `${totalDays}D`,
        amount:        `₹${item.BookingAmount || item.DealAmount || 0}`,
        status:        item.BookingStatus || "Confirmed",
        mobile:        item.MobileNumber  || "",
        category:      item.Category      || "",
        startDate:     item.CheckInDate   || "",
        endDate:       item.CheckOutDate  || "",
        host:          item.Host          || "",
        bookingSource: item.BookingSource || "",
        dealAmount:    item.DealAmount    || 0,
        advanceAmount: item.AdvanceAmount || 0,
        balanceAmount: item.BalanceAmount || 0,
        receivedBy:    item.ReceivedBy    || "",
        noOfGuest:     item.NoOfGuest     || "",
        adults:        item.Adults        || "",
        children:      item.Children      || "",
        specialReq:    item.SpecialRequest|| "",
        email:         item.EmailId       || "",
        BookingStatus: item.BookingStatus || "Confirmed",
      };
    });

    return { success: true, data: formattedData };

  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Failed to fetch bookings",
    };
  }
};

// ======================================================
// GET SINGLE BOOKING
// ======================================================

export const getSingleBooking = async (id) => {
  try {
    console.log("📦 GET SINGLE BOOKING => Id:", id);

    const response = await AxiosClient.post(
      ENDPOINTS.GET_SINGLE_BOOKING,
      { Id: id }
    );

    console.log(
      "✅ GET SINGLE BOOKING RESPONSE =>",
      JSON.stringify(response.data, null, 2)
    );

    let data = response.data;

    if (data?.data && typeof data.data === "string") {
      data = JSON.parse(data.data);
      if (Array.isArray(data)) data = data[0];
    } else if (data?.data && Array.isArray(data.data)) {
      data = data.data[0];
    } else if (data?.data && typeof data.data === "object") {
      data = data.data;
    } else if (Array.isArray(data)) {
      data = data[0];
    }

    return { success: true, data };

  } catch (error) {
    console.log(
      "❌ GET SINGLE BOOKING ERROR =>",
      JSON.stringify(error.response?.data, null, 2)
    );
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Failed to fetch booking",
    };
  }
};

// ======================================================
// UPDATE BOOKING
// ======================================================

export const updateBooking = async (bookingData) => {
  try {
    console.log(
      "📦 UPDATE BOOKING PAYLOAD =>",
      JSON.stringify(bookingData, null, 2)
    );

    const response = await AxiosClient.post(
      ENDPOINTS.UPDATE_BOOKING,
      bookingData
    );

    console.log(
      "✅ UPDATE BOOKING RESPONSE =>",
      JSON.stringify(response.data, null, 2)
    );

    return { success: true, data: response.data };

  } catch (error) {
    console.log(
      "❌ UPDATE BOOKING ERROR =>",
      JSON.stringify(error.response?.data, null, 2)
    );
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Update failed",
    };
  }
};

// ======================================================
// DELETE BOOKING
// ======================================================

export const deleteBooking = async (id) => {
  try {
    console.log("📦 DELETE BOOKING => Id:", id);

    const response = await AxiosClient.post(
      ENDPOINTS.DELETE_BOOKING,
      { Id: id }
    );

    console.log(
      "✅ DELETE BOOKING RESPONSE =>",
      JSON.stringify(response.data, null, 2)
    );

    return { success: true, data: response.data };

  } catch (error) {
    console.log(
      "❌ DELETE BOOKING ERROR =>",
      JSON.stringify(error.response?.data, null, 2)
    );
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Delete failed",
    };
  }
};

// ======================================================
// INSERT ENQUIRY
// ======================================================

export const insertEnquiry = async (enquiryData) => {
  try {
    const response = await AxiosClient.post(
      ENDPOINTS.INSERT_ENQUIRY,
      enquiryData
    );
    return { success: true, data: response.data };

  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Failed to insert enquiry",
    };
  }
};

// ======================================================
// GET ENQUIRIES
// ======================================================

export const getEnquiries = async (
  filterType = "",
  fromDate = "",
  toDate = ""
) => {
  try {
    const payload = {
      FilterType: filterType,
      FromDttm:   fromDate,
      ToDttm:     toDate,
    };

    console.log(
      "📦 GET ENQUIRIES PAYLOAD =>",
      JSON.stringify(payload, null, 2)
    );

    const response = await AxiosClient.post(
      ENDPOINTS.GET_ENQUIRIES,
      payload
    );

    console.log(
      "✅ GET ENQUIRIES RESPONSE =>",
      JSON.stringify(response.data, null, 2)
    );

    let enquiryArray = [];
    try {
      enquiryArray =
        typeof response.data.data === "string"
          ? JSON.parse(response.data.data)
          : response.data.data || [];
    } catch {
      enquiryArray = [];
    }

    const formattedData = enquiryArray.map((item, index) => ({
      id:              index + 1,
      enquiryId:       item.Id              || "",
      name:            item.FullName        || "",
      property:        item.PropertyName    || "",
      category:        item.Category        || "",
      date:            item.CheckInDate     || "",
      enquiryDate:     item.CreatedDate     || "",
      status:          item.EnquiryStatus   || "Pending",
      mobile:          item.MobileNumber    || "",
      email:           item.EmailId         || "",
      adults:          item.Adults          || "",
      children:        item.Children        || "",
      guests:          item.NoOfGuest       || "",
      specialRequests: item.SpecialRequests || "",
      estimatedAmount: item.EstimatedAmount || 0,
      checkInDate:     item.CheckInDate     || "",
      checkOutDate:    item.CheckOutDate    || "",

      // ✅ Raw fields bhi rakho — getSingleEnquiry ke baad
      // updateEnquiryStatus inhe use karta hai
      FullName:        item.FullName        || "",
      Category:        item.Category        || "",
      PropertyName:    item.PropertyName    || "",
      MobileNumber:    item.MobileNumber    || "",
      EmailId:         item.EmailId         || "",
      CheckInDate:     item.CheckInDate     || "",
      CheckOutDate:    item.CheckOutDate    || "",
      NoOfGuest:       item.NoOfGuest       || "",
      EstimatedAmount: item.EstimatedAmount || "",
      EnquiryStatus:   item.EnquiryStatus   || "Pending",
    }));

    console.log(
      "✅ FINAL ENQUIRIES =>",
      JSON.stringify(formattedData, null, 2)
    );

    return { success: true, data: formattedData };

  } catch (error) {
    console.log(
      "❌ GET ENQUIRIES ERROR =>",
      JSON.stringify(error.response?.data, null, 2)
    );
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Failed to fetch enquiries",
    };
  }
};

// ======================================================
// GET SINGLE ENQUIRY  ✅
// ======================================================

export const getSingleEnquiry = async (id) => {
  try {
    console.log("📦 GET SINGLE ENQUIRY => Id:", id);

    const response = await AxiosClient.post(
      ENDPOINTS.GET_SINGLE_ENQUIRY,
      { Id: id }
    );

    console.log(
      "✅ GET SINGLE ENQUIRY RESPONSE =>",
      JSON.stringify(response.data, null, 2)
    );

    let data = response.data;

    if (data?.data && typeof data.data === "string") {
      data = JSON.parse(data.data);
      if (Array.isArray(data)) data = data[0];
    } else if (data?.data && Array.isArray(data.data)) {
      data = data.data[0];
    } else if (data?.data && typeof data.data === "object") {
      data = data.data;
    } else if (Array.isArray(data)) {
      data = data[0];
    }

    return { success: true, data };

  } catch (error) {
    console.log(
      "❌ GET SINGLE ENQUIRY ERROR =>",
      JSON.stringify(error.response?.data, null, 2)
    );
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Failed to fetch enquiry",
    };
  }
};

export const convertEnquiryToBooking = async (enquiryItem) => {
  try {
    // Step 1: Status Converted karo
    const statusResult = await updateEnquiryStatus(
      enquiryItem.enquiryId, 
      'Converted'
    );

    if (!statusResult.success) {
      return { success: false, message: "Status update failed" };
    }

    // Step 2: Booking insert karo enquiry data se
    const bookingData = {
      Category:      enquiryItem.category      || "",
      PropertyName:  enquiryItem.property      || "",
      FullName:      enquiryItem.name          || "",
      MobileNumber:  enquiryItem.mobile        || "",
      EmailId:       enquiryItem.email         || "",
      Host:          "",
      BookingSource: "",
      CheckInDate:   enquiryItem.checkInDate   || "",
      CheckOutDate:  enquiryItem.checkOutDate  || "",
      NoOfGuest:     enquiryItem.guests        || "",
      BookingAmount: enquiryItem.estimatedAmount || 0,
      DealAmount:    enquiryItem.estimatedAmount || 0,
      AdvanceAmount: "0",
      BalanceAmount: String(enquiryItem.estimatedAmount || 0),
      ReceivedBy:    "",
      BookingStatus: "Confirmed",
    };

    const bookingResult = await insertNewBooking(bookingData);

    if (!bookingResult.success) {
      return { success: false, message: "Booking insert failed" };
    }

    return { success: true };

  } catch (error) {
    return { success: false, message: "Convert failed" };
  }
};

// ======================================================
// UPDATE ENQUIRY STATUS  ✅
// Pehle single enquiry fetch karta hai, phir poora data
// update karta hai sirf status change karke
// ======================================================

export const updateEnquiryStatus = async (id, status) => {
  try {
    console.log("📦 UPDATE ENQUIRY STATUS => Id:", id, "Status:", status);

    // Step 1: Pehle poora enquiry data fetch karo
    const single = await getSingleEnquiry(id);

    if (!single.success) {
      return { success: false, message: "Enquiry data nahi mila" };
    }

    const e = single.data;

    // Step 2: Poora data bhejo + sirf status update karo
    const response = await AxiosClient.post(
      ENDPOINTS.UPDATE_ENQUIRY,
      {
        Id:              id,
        Category:        e.Category        || "",
        PropertyName:    e.PropertyName    || "",
        FullName:        e.FullName        || "",
        MobileNumber:    e.MobileNumber    || "",
        EmailId:         e.EmailId         || "",
        CheckInDate:     e.CheckInDate     || "",
        CheckOutDate:    e.CheckOutDate    || "",
        NoOfGuest:       e.NoOfGuest       || "",
        EstimatedAmount: e.EstimatedAmount || "",
        EnquiryStatus:   status,            // ✅ sirf ye change hoga
      }
    );

    console.log(
      "✅ UPDATE ENQUIRY STATUS RESPONSE =>",
      JSON.stringify(response.data, null, 2)
    );

    return { success: true, data: response.data };

  } catch (error) {
    console.log(
      "❌ UPDATE ENQUIRY STATUS ERROR =>",
      JSON.stringify(error.response?.data, null, 2)
    );
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Status update failed",
    };
  }
};

// ======================================================
// DELETE ENQUIRY  ✅
// ======================================================

export const deleteEnquiry = async (id) => {
  try {
    console.log("📦 DELETE ENQUIRY => Id:", id);

    const response = await AxiosClient.post(
      ENDPOINTS.DELETE_ENQUIRY,
      { Id: id }
    );

    console.log(
      "✅ DELETE ENQUIRY RESPONSE =>",
      JSON.stringify(response.data, null, 2)
    );

    return { success: true, data: response.data };

  } catch (error) {
    console.log(
      "❌ DELETE ENQUIRY ERROR =>",
      JSON.stringify(error.response?.data, null, 2)
    );
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Delete failed",
    };
  }
};

// ======================================================
// INSERT EXPENSE
// ======================================================

export const insertExpense = async (expenseData) => {
  try {
    const response = await AxiosClient.post(
      ENDPOINTS.INSERT_EXPENSE,
      expenseData
    );
    return { success: true, data: response.data };

  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Failed to insert expense",
    };
  }
};

// ======================================================
// GET EXPENSES
// ======================================================

export const getExpenses = async (
  filterType = "",
  fromDate = "",
  toDate = ""
) => {
  try {
    const payload = {
      FilterType: filterType,
      FromDttm:   fromDate,
      ToDttm:     toDate,
    };

    const response = await AxiosClient.post(
      ENDPOINTS.GET_EXPENSES,
      payload
    );

    let expenseArray = [];
    try {
      expenseArray =
        typeof response.data.data === "string"
          ? JSON.parse(response.data.data)
          : response.data.data || [];
    } catch {
      expenseArray = [];
    }

    return { success: true, data: expenseArray };

  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Failed to fetch expenses",
    };
  }
};

// ======================================================
// GET TOTAL REVENUE
// ======================================================

export const getTotalRevenue = async (
  filterType = "Today",
  fromDate = "",
  toDate = ""
) => {
  try {
    const payload = {
      FilterType: filterType,
      FromDttm:   fromDate,
      ToDttm:     toDate,
    };

    const response = await AxiosClient.post(
      ENDPOINTS.GET_TOTAL_REVENUE,
      payload
    );

    let revenueArray = [];
    try {
      revenueArray =
        typeof response.data.data === "string"
          ? JSON.parse(response.data.data)
          : response.data.data || [];
    } catch {
      revenueArray = [];
    }

    return { success: true, data: revenueArray };

  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Failed to fetch revenue",
    };
  }
};

// ======================================================
// GET REVENUE DETAILS
// ======================================================

export const getRevenueDetails = async (
  filterType = "Today",
  fromDate = "",
  toDate = ""
) => {
  try {
    const payload = {
      FilterType: filterType,
      FromDttm:   fromDate,
      ToDttm:     toDate,
    };

    console.log(
      "📦 GET REVENUE DETAILS PAYLOAD =>",
      JSON.stringify(payload, null, 2)
    );

    const response = await AxiosClient.post(
      ENDPOINTS.GET_REVENUE_DETAILS,
      payload
    );

    console.log(
      "✅ GET REVENUE DETAILS RAW RESPONSE =>",
      JSON.stringify(response.data, null, 2)
    );

    let parsed = [];
    const raw  = response.data;

    if (raw?.data && typeof raw.data === "string") {
      try { parsed = JSON.parse(raw.data); } catch { parsed = []; }
    } else if (raw?.data && Array.isArray(raw.data)) {
      parsed = raw.data;
    } else if (raw?.data && typeof raw.data === "object") {
      parsed = [raw.data];
    } else if (Array.isArray(raw)) {
      parsed = raw;
    } else if (raw && typeof raw === "object") {
      parsed = [raw];
    }

    console.log(
      "📊 REVENUE DETAILS PARSED =>",
      JSON.stringify(parsed, null, 2)
    );

    return { success: true, data: parsed };

  } catch (error) {
    console.log(
      "❌ GET REVENUE DETAILS ERROR =>",
      JSON.stringify(error.response?.data, null, 2)
    );
    return {
      success: false,
      message:
        error.response?.data?.Message ||
        error.response?.data?.message ||
        "Failed to fetch revenue details",
    };
  }
};
// ======================================================
// UPDATE ENQUIRY
// ======================================================

export const updateEnquiry = async (enquiryData) => {
  try {
    console.log(
      "📦 UPDATE ENQUIRY PAYLOAD =>",
      JSON.stringify(enquiryData, null, 2)
    );

    const response = await AxiosClient.post(
      ENDPOINTS.UPDATE_ENQUIRY,
      enquiryData
    );

    console.log(
      "✅ UPDATE ENQUIRY RESPONSE =>",
      JSON.stringify(response.data, null, 2)
    );

    return { success: true, data: response.data };

  } catch (error) {
    console.log(
      "❌ UPDATE ENQUIRY ERROR =>",
      JSON.stringify(error.response?.data, null, 2)
    );
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Update enquiry failed",
    };
  }
};

// ======================================================
// UPLOAD GUEST IDS
// ======================================================

export const uploadGuestIds = async (formData) => {
  try {
    const response = await AxiosClient.post(
      ENDPOINTS.UPLOAD_GUEST_IDS,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      }
    );
    return { success: true, data: response.data };

  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Upload failed",
    };
  }
};

