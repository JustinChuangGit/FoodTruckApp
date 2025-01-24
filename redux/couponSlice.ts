import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Coupon } from "@/constants/types"; 
type CouponState = {
  coupons: Coupon[];
};

const initialState: CouponState = {
  coupons: [],
};

const couponSlice = createSlice({
  name: "coupons",
  initialState,
  reducers: {
    addCoupon: (state, action: PayloadAction<Coupon>) => {
      state.coupons.push(action.payload);
    },
    deleteCoupon: (state, action: PayloadAction<number>) => {
      state.coupons.splice(action.payload, 1); // Remove coupon by index
    },
  },
});

export const { addCoupon, deleteCoupon } = couponSlice.actions;

export const selectCoupons = (state: { coupons: CouponState }) =>
  state.coupons.coupons;

export default couponSlice.reducer;
