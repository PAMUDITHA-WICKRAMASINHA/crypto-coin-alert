import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import log from '../logger'

const validateResource = (schema: AnyZodObject) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    return next();
  } catch (e: any) {
    log.error(e);
    return res.status(400).send(e.errors);
  }
};

export default validateResource;