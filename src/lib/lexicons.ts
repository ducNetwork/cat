import { Schema } from '@atproto/lex';
import { HTTPException } from 'hono/http-exception';

export function $lex<I extends Schema>(schema: I, input: unknown) {
  const check = schema.$safeParse(input);
  if (!check.success) throw new HTTPException(400);

  return check.value;
}