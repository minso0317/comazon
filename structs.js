import * as s from "superstruct";
import isEmail from "is-email";

export const CreateUser = s.object({
  email: s.define("Email", isEmail),
  firstName: s.size(s.string(), 1, 30),
  lastName: s.size(s.string(), 1, 30),
  address: s.string(),
});

export const PatchUser = s.partial(CreateUser);
