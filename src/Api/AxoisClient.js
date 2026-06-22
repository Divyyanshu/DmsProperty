import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─────────────────────────────────────────────────────────────
// AXIOS CLIENT
// ─────────────────────────────────────────────────────────────

const AxiosClient = axios.create({

  timeout: 30000,

  headers: {
    "Content-Type": "application/json",
  },
});

// ─────────────────────────────────────────────────────────────
// REQUEST INTERCEPTOR
// Har request se pehle token automatically lagayega
// ─────────────────────────────────────────────────────────────

AxiosClient.interceptors.request.use(

  async (config) => {

    try {

      // TOKEN STORAGE SE LO
      const token = await AsyncStorage.getItem("token");

      console.log(
        "🔑 TOKEN FROM STORAGE =>",
        token
      );

      // AGAR TOKEN HAI TO HEADER ME LAGAO
      if (token) {

        config.headers.Authorization =
          `Bearer ${token}`;

        console.log(
          "✅ AUTH HEADER =>",
          config.headers.Authorization
        );

      } else {

        console.log(
          "⚠️ NO TOKEN FOUND"
        );
      }

      // FINAL REQUEST DEBUG
      console.log(
        "📤 API REQUEST =>",
        {
          url: config.url,
          method: config.method,
          data: config.data,
          headers: config.headers,
        }
      );

      return config;

    } catch (error) {

      console.log(
        "❌ REQUEST INTERCEPTOR ERROR =>",
        error
      );

      return Promise.reject(error);
    }
  },

  (error) => {

    console.log(
      "❌ REQUEST ERROR =>",
      error
    );

    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR
// ─────────────────────────────────────────────────────────────

AxiosClient.interceptors.response.use(

  (response) => {

    console.log(
      "✅ API RESPONSE =>",
      {
        url: response.config.url,
        status: response.status,
        data: response.data,
      }
    );

    return response;
  },

  async (error) => {

    console.log(
      "❌ API ERROR =>",
      {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      }
    );

    // ─────────────────────────────────────────────────────────
    // TOKEN EXPIRE / UNAUTHORIZED
    // ─────────────────────────────────────────────────────────

    if (error.response?.status === 401) {

      console.log(
        "⛔ TOKEN EXPIRED / UNAUTHORIZED"
      );

      // TOKEN REMOVE
      await AsyncStorage.removeItem("token");

      // FUTURE:
      // Login screen navigate kar sakte ho yaha
    }

    return Promise.reject(error);
  }
);

export default AxiosClient;