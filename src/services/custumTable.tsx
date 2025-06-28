import { Api_Methods } from "@/utils/common/enum"
import { apiService } from "./apiService"

export const apiHelperService = {
    fetchData: async (endpoint: string, params: Record<string, any>) => {
        return apiService({
            method: Api_Methods.GET,
            endpoint,
            params
        })
    }
}