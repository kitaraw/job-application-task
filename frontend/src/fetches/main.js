import axios from "src/utils/axios";

export const getRegistrationRoles = async ({ excludeAdmin } = {}) => {
  try {
    const params =
      excludeAdmin !== undefined ? { exclude_admin: excludeAdmin } : {};
    const response = await axios.get("/api/auth/get-registarion-roles/", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка получения ролей:", error);
    throw error;
  }
};

export const getStatistics = async () => {
  try {
    const response = await axios.get("/api/statistics/");
    return response.data;
  } catch (error) {
    console.error("Ошибка получения статистики:", error);
    throw error;
  }
};

export const getRoles = async () => {
  try {
    const response = await axios.get("/api/roles/");
    return response.data;
  } catch (error) {
    console.error("Ошибка получения ролей:", error);
    throw error;
  }
};

export const getPermissions = async () => {
  try {
    const response = await axios.get("/api/avail-permissions/");
    return response.data;
  } catch (error) {
    console.error("Ошибка получения прав:", error);
    throw error;
  }
};

export const addPermissions = async (data) => {
  try {
    const response = await axios.post("/api/roles/", data);
    return response.data;
  } catch (error) {
    console.error("Ошибка добавления роли:", error);
    throw error;
  }
};

export const updatePermissions = async (roleId, data) => {
  try {
    const response = await axios.put(`/api/roles/${roleId}/`, data);
    return response.data;
  } catch (error) {
    console.error("Ошибка изменения роли:", error);
    throw error;
  }
};

export const deletePermissions = async (roleName) => {
  try {
    const response = await axios.delete(`/api/roles/${roleName}/`);
    return response.data;
  } catch (error) {
    console.error("Ошибка удаления роли:", error);
    throw error;
  }
};

export const getUsers = async () => {
  try {
    const response = await axios.get("/api/users/");
    return response.data;
  } catch (error) {
    console.error("Ошибка получения пользователей:", error);
    throw error;
  }
};

export const updateUser = async (userId, data) => {
  try {
    const response = await axios.put(`/api/users/${userId}/`, data);
    return response.data;
  } catch (error) {
    console.error("Ошибка изменения пользователя:", error);
    throw error;
  }
};

export const updateUserPermission = async (userId, permName, newValue) => {
  try {
    const data = {
      permission: permName,
      allowed: newValue,
    };

    const response = await axios.put(`/api/users/${userId}/permissions/`, data);
    return response.data;
  } catch (error) {
    console.error("Ошибка изменения пользователя:", error);
    throw error;
  }
};

export const getSofts = async () => {
  try {
    const response = await axios.get("/api/softs/");
    return response.data;
  } catch (error) {
    console.error("Ошибка получения пакетов:", error);
    throw error;
  }
};

export const getExcludedUsers = async (softId, excludeLogins = []) => {
  try {
    const params = {};

    // Добавляем каждый элемент массива как отдельный параметр
    if (excludeLogins.length > 0) {
      params.exclude_logins = excludeLogins;
    }

    const response = await axios.get(`/api/softs/${softId}/excluded-users/`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка получения пользователей без доступа:", error);
    throw error;
  }
};

export const grantAccessToSoft = async (softId, accessData) => {
  try {
    const response = await axios.post(
      `/api/softs/${softId}/grant-access/`,
      accessData
    );
    return response.data;
  } catch (error) {
    console.error("Ошибка предоставления доступа:", error);
    throw error;
  }
};

export const createUser = async (data) => {
  try {
    const response = await axios.post(`/api/users/`, data);
    return response.data;
  } catch (error) {
    console.error("Ошибка создания пользователя:", error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`/api/users/${userId}/`);
    return response.data;
  } catch (error) {
    console.error("Ошибка удаления пользователя:", error);
    throw error;
  }
};
