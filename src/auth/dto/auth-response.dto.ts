export class AuthRequestDto {
  accountNumber: string;
  password: string;
}

export class AuthResponseDto {
  accessToken: string;
}
