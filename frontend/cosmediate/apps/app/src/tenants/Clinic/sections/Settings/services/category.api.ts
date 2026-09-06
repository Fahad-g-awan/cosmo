// import api from "@cosmediate/api";

// export const createCategoryAPI = async (data: unknown) => {
//   try {
//     const response = await api.post("/treatment/category", data, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     console.log("Create categories API response", response.data);
//     return response.data;
//   } catch (error: unknown) {
//     console.log("Create categories API error", error);

//     throw new Error("Something went wrong, please try again");
//   }
// };

// export const updateCategoryAPI = async (data: unknown) => {
//   try {
//     const response = await api.put("/treatment/category", data, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     console.log("Update categories API response", response.data);
//     return response.data;
//   } catch (error: unknown) {
//     console.log("Update categories API error", error);

//     throw new Error("Something went wrong, please try again");
//   }
// };

// export const deleteCategoryAPI = async (id: unknown) => {
//   try {
//     const response = await api.delete(`/treatment/category?id=${id}`);

//     console.log("Delete categories API response", response.data);
//     return response.data;
//   } catch (error: unknown) {
//     console.log("Delete categories API error", error);

//     throw new Error("Something went wrong, please try again");
//   }
// };

// export const fetchCategoryAPI = async () => {
//   try {
//     const response = await api.get("/treatment/category");

//     console.log("Get categories API response", response.data);
//     return response.data;
//   } catch (error: unknown) {
//     console.log("Get categories API error", error);

//     throw new Error("Something went wrong, please try again");
//   }
// };
