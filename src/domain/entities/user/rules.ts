import { patterns, type RulesFor } from "../types";
import type {
  UserAddress,
  UserIdentifier,
  UserPersonalInfo,
} from "./user.entity";

export const rulesUserIdentifier: RulesFor<UserIdentifier> = {
  email: {
    name: "email",
    type: "",
    pattern: [patterns.email],
    maxSize: 100,
  },

  identityNumber: {
    name: "identity number",
    type: "",
    minSize: 5,
    maxSize: 20,
  },

  password: {
    name: "password",
    type: "",
    pattern: [patterns.strong],
    minSize: 7,
    maxSize: 20,
  },
};

export const rulesUserInfo: RulesFor<UserPersonalInfo> = {
  firstname: {
    name: "firstname",
    type: "",
    minSize: 2,
    maxSize: 20,
  },

  lastname: {
    name: "lastname",
    type: "",
    minSize: 2,
    maxSize: 20,
  },

  birthdate: {
    name: "birthdate",
    type: "date",
  },

  nationality: {
    name: "nationality",
    type: "",
  },

  gender: {
    name: "gender",
    type: "",
    optional: true,
  },
};

export const rulesUserAddress: RulesFor<UserAddress> = {
  region: {
    name: "region",
    type: "",
  },

  postalCode: {
    name: "postal code",
    type: "",
  },

  city: {
    name: "city",
    type: "",
  },

  address: {
    name: "address",
    type: "",
  },
};
