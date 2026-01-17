import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { User, AuthTokens, AuthState } from "../../shared/types/auth";
import { authApi } from "./auth.api";

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading to prevent redirect before checking localStorage
};

// Thunk to initialize auth from localStorage
export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken) {
        return rejectWithValue("No token found");
      }

      // Verify token is still valid by fetching current user
      const result = await dispatch(authApi.endpoints.me.initiate());

      if ("error" in result) {
        throw new Error("Invalid token");
      }

      const user = result.data;

      return {
        user,
        tokens: { accessToken, refreshToken: refreshToken || "" },
      };
    } catch (error) {
      // Token is invalid, clean up
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return rejectWithValue("Invalid token");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; tokens: AuthTokens }>
    ) => {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
      state.isLoading = false;

      // Persist to localStorage
      localStorage.setItem("accessToken", action.payload.tokens.accessToken);
      localStorage.setItem("refreshToken", action.payload.tokens.refreshToken);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      });
  },
});

export const { setCredentials, setLoading, logout, updateUser } =
  authSlice.actions;

export default authSlice.reducer;
