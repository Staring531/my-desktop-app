export const httpStatus = {
  ok: 200,
  registration_rejected: 400,
  verification_rejected: 400,
  cancellation_rejected: 400,
  login_rejected: 400,
  recovery_rejected: 400,
  send_failed: 503,
  operation_failed: 500,
  logged_out: 401,
  save_rejected: 400,
  not_found: 404,
  account_gone: 409,
} as const;

export type ResultName = keyof typeof httpStatus;

export type ResultBody = { result: ResultName };

export function resultBody(result: ResultName): ResultBody {
  return { result };
}
