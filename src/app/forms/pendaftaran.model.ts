export class Pendaftaran {
  uid?: string;
  firstName: string;
  lastName: string;
  placeOfBirth: string;
  dateOfBirth: string;
  email: string;
  nik: string;
  phone: string;
  city: string;
  team: string;
  class: string[];

  constructor(input: Pendaftaran) {
    this.uid = input.uid;
    this.firstName = input.firstName;
    this.lastName = input.lastName;
    this.placeOfBirth = input.placeOfBirth;
    this.dateOfBirth = input.dateOfBirth;
    this.email = input.email;
    this.nik = input.nik;
    this.phone = input.phone;
    this.city = input.city;
    this.team = input.team;
    this.class = input.class;
  }
}
