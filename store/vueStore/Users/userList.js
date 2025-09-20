import { ipcHandle } from "../../../ipc/ipcHandler.js";
import { loadAccountRoles } from "../Settings/accountRoles.js";

export async function getUserList() {
    try {
        return await ipcHandle("getUsers");
    } catch (error) {
        return error;
    }
}

export async function updateUser(data) {
    try {
        const cleanedData = JSON.parse(JSON.stringify(data));
        return await ipcHandle("updateUser", cleanedData);
    } catch (error) {
        return error;
    }
}

export async function deleteUser(id) {
    try {
        const cleanedData = JSON.parse(JSON.stringify(id));
        return await ipcHandle("deleteUser", cleanedData);
    } catch (error) {
        return error;
    }
}

const userListModalFields = [ 
  {
    field: "first_name",
    placeholder: "First Name",
    type: "text",
    label: "First Name",
    isRequired: true,
  },
  {
    field: "last_name",
    placeholder: "Last Name",
    type: "text",
    label: "Last Name",
    isRequired: true,
  },
  {
    field: "contact_number",
    placeholder: "09xxxxxxxxx",
    type: "tel",
    pattern: "^(09|\\+639)\\d{9}$",
    label: "Contact Number",
  },
  {
    field: "birthday",
    placeholder: "mm/dd/yyyy",
    type: "date",
    label: "Date of Birth",
  },
  {
    field: "gender",
    placeholder: "Select Gender",
    type: "dropdown",
    label: "Gender",
    options: ["Male", "Female"],
  },
  {
    field: "email",
    placeholder: "example@gmail.com",
    type: "email",
    label: "Email",
  },
  {
    field: "account_role_id",
    placeholder: "Select Account Role",
    type: "dropdown",
    label: "Account Role",
    divClass: "col-span-1 lg:col-span-2",
    options: [],

    isRequired: true,
  },
];

export async function getUserListModalFields() {
    let accountRoles = await loadAccountRoles();
    return userListModalFields.map(field => {
        if (field.field === "account_role_id") {
            field.options = accountRoles.map(role => ({
                name: role.name,
                id: role.id
            }));
        }
        return field;
    });
}