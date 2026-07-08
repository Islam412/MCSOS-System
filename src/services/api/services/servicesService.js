import { get, post, put, del } from '../client';
import { ENDPOINTS } from '../config';

export const servicesService = {
  getServices: async () => {
    const response = await get(ENDPOINTS.SERVICES.LIST);
    return response.data || response;
  },

  getActiveServices: async () => {
    const response = await get(ENDPOINTS.SERVICES.ACTIVE);
    return response.data || response;
  },

  getServiceById: async (id) => {
    const response = await get(ENDPOINTS.SERVICES.GET(id));
    return response.data || response;
  },

  createService: async (serviceData) => {
    const response = await post(ENDPOINTS.SERVICES.CREATE, serviceData);
    return response.data || response;
  },

  updateService: async (id, serviceData) => {
    const response = await put(ENDPOINTS.SERVICES.UPDATE(id), serviceData);
    return response.data || response;
  },

  deleteService: async (id) => {
    const response = await del(ENDPOINTS.SERVICES.DELETE(id));
    return response.data || response;
  }
};
