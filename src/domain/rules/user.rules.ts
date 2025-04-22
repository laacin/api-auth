import type { UserIdentifier, UserPersonalInfo } from "@domain/entities";
import { patterns, type RulesFor } from "./types";

export const userIdentifierRules: RulesFor<UserIdentifier> = {
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

export const userPersonalInfoRules: RulesFor<UserPersonalInfo> = {
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
};
