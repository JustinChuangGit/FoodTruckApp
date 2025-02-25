// store/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MenuItem } from "@/constants/types";
import { User, Coupon } from "@/constants/types";

// Define the User interface


// Define the initial state
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

// Create the auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      console.log("Redux State after setUser:", JSON.stringify(state, null, 2));
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      console.log("Redux State after clearUser:", JSON.stringify(state, null, 2));
    },
    updateLocation: (
      state,
      action: PayloadAction<{ latitude: number; longitude: number }>
    ) => {
      if (state.user) {
        state.user.latitude = action.payload.latitude;
        state.user.longitude = action.payload.longitude;
        console.log(
          "Redux State after updateLocation:",
          JSON.stringify(state, null, 2)
        );
      }
    },
    updateMenu: (state, action: PayloadAction<MenuItem[]>) => {
      if (state.user) {
        state.user.menu = action.payload;
        console.log("Redux State after updateMenu:", JSON.stringify(state, null, 2));
      }
    },
    addCoupon: (state, action: PayloadAction<Coupon>) => {
      if (state.user) {
        if (!state.user.coupons) {
          state.user.coupons = []; // Initialize coupons if they don't exist
        }
        state.user.coupons.push(action.payload); // Add the coupon to the array
        console.log("Redux State after addCoupon:", JSON.stringify(state, null, 2));
      }
    },
    deleteCoupon: (state, action: PayloadAction<string>) => {
      if (state.user && state.user.coupons) {
        state.user.coupons = state.user.coupons.filter(
          (coupon) => coupon.id !== action.payload // Use `action.payload` as the coupon ID
        );
        console.log("Redux State after deleteCoupon:", JSON.stringify(state, null, 2));
      }
    },
    redeemCoupon: (state, action: PayloadAction<string>) => {
      console.log("Adding to Redux:", action.payload);
      if (state.user) {
        if (!state.user.addedCoupons) {
          state.user.addedCoupons = []; // Initialize if it doesn't exist
        }
        if (!state.user.addedCoupons.includes(action.payload)) {
          state.user.addedCoupons.push(action.payload); // Add the coupon UID
          console.log(
            "Redux State after redeemCoupon:",
            JSON.stringify(state, null, 2)
          );
        }
      }
    },
    removeActiveCoupon: (state, action: PayloadAction<string>) => {
      console.log("Removing from Redux:", action.payload);
      if (state.user && state.user.addedCoupons) {
        state.user.addedCoupons = state.user.addedCoupons.filter(
          (couponId) => couponId !== action.payload
        );
        console.log(
          "Redux State after removeActiveCoupon:",
          JSON.stringify(state, null, 2)
        );
      }
    },
    decrementCouponUsesState: (
      state,
      action: PayloadAction<{ coupons: Coupon[] }>
    ) => {
      const { coupons } = action.payload;
    
      if (state.user && state.user.coupons) {
        coupons.forEach((updatedCoupon) => {
          const coupon = state.user?.coupons?.find((c) => c.id === updatedCoupon.id);
          if (coupon) {
            // Use 0 as the default value if `uses` is null
            const currentUses = coupon.uses ?? 0;
            coupon.uses = Math.max(currentUses - 1, 0); // Ensure `uses` doesn't go below 0
          } else {
            console.warn(`Coupon with ID ${updatedCoupon.id} not found in state.`);
          }
        });
      }
    },
    updateTrackingPermission: (state, action: PayloadAction<boolean>) => {
      // If no user is in the Redux state, log a warning and bail out
      if (!state.user) {
        console.warn("No user found in state; cannot update tracking permissions.");
        return;
      }
    
      // Only update if there's a change
      if (state.user.trackingPermissions !== action.payload) {
        state.user.trackingPermissions = action.payload;
    
        console.info(
          `[Redux] trackingPermissions updated to: ${action.payload}`
        );
    
        console.debug(
          "[Redux] State after updateTrackingPermission:",
          JSON.stringify(state, null, 2)
        );
      }
    },
    
  },
});

export const {
  setUser,
  clearUser,
  updateLocation,
  updateMenu,
  addCoupon,
  deleteCoupon,
  redeemCoupon,
  removeActiveCoupon,
  decrementCouponUsesState,  
  updateTrackingPermission,
} = authSlice.actions;

// Export selectors
export const selectUser = (state: { auth: AuthState }) =>
  state.auth.user && state.auth.isAuthenticated ? state.auth.user : null;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;

// Export reducer
export default authSlice.reducer;
