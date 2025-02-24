import { API_URL } from "../utils/constants";

export default class ApiPlaceOrder {
    async read() {
        try {
            const response = await fetch(`${API_URL}/api/sdek_points`) // https://dev.r18.coffee/api/sdek_points
            // const response = await fetch('https://dev.r18.coffee/api/sdek_points') // https://dev.r18.coffee/api/sdek_points
            const res = await response.json()
    
            return res;
        } catch (error) {
            return false;
        }
    }
}