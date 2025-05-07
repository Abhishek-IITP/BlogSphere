import { createSlice } from "@reduxjs/toolkit";

const UserSlice= createSlice({
    name:"UserSlice",
    initialState: JSON.parse(localStorage.getItem("user"))  || {token : null},
    reducers: {
        login(state, action){
            localStorage.setItem("user", JSON.stringify(action.payload))
            return action.payload;
        },
        logout(state,action){
            localStorage.removeItem("user")
            return {
                
                token : null
            }

        }
    }
})

export const {login,logout}= UserSlice.actions;
export default UserSlice.reducer;