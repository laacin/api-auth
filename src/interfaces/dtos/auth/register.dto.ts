import validateObject from "@application/validations/object.validation";
import type {
  UserAddress,
  UserIdentifier,
  UserPersonalInfo,
} from "@domain/entities";
import { ErrUserAuth } from "@domain/errs";
import {
  rulesUserAddress,
  rulesUserIdentifier,
  rulesUserInfo,
} from "@domain/rules";

export class RegisterDto {
  private constructor(
    public identifier: UserIdentifier,
    public personalInfo: UserPersonalInfo,
    public address: UserAddress,
  ) {}

  static create(data: Record<string, unknown>): RegisterDto {
    // Get user identifier
    const { email, identity_number, password } = data;
    let err = validateObject(rulesUserIdentifier, {
      email,
      identityNumber: identity_number,
      password,
    });
    if (err) throw ErrUserAuth.invalidField(err);

    // Get user personal info
    const { firstname, lastname, birthdate, nationality, gender } = data;
    err = validateObject(rulesUserInfo, {
      firstname,
      lastname,
      birthdate,
      nationality,
      gender,
    });
    if (err) throw ErrUserAuth.invalidField(err);

    // Get user address
    const { region, postal_code, city, address } = data;
    err = validateObject(rulesUserAddress, {
      region,
      postalCode: postal_code,
      city,
      address,
    });
    if (err) throw ErrUserAuth.invalidField(err);

    // Setup DTO
    return new RegisterDto(
      {
        email: email as string,
        identityNumber: identity_number as string,
        password: password as string,
      },
      {
        firstname: firstname as string,
        lastname: lastname as string,
        birthdate: new Date(birthdate as number),
        nationality: nationality as string,
        gender: gender as string,
      },
      {
        region: region as string,
        postalCode: postal_code as string,
        city: city as string,
        address: address as string,
      },
    );
  }
}
