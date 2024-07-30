export class CreateMessagingDto {
  sender: string;
}

export class ErrorMessagingDto {
  statusCode: string;
  message: string;

  error?: string[];
}
