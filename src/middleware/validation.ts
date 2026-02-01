import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Validation middleware
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array(),
    });
    return;
  }
  next();
};

// Meter telemetry validation rules
export const validateMeterTelemetry = [
  body('meterId')
    .notEmpty()
    .withMessage('meterId is required')
    .isString()
    .withMessage('meterId must be a string'),
  body('kwhConsumedAc')
    .notEmpty()
    .withMessage('kwhConsumedAc is required')
    .isFloat({ min: 0 })
    .withMessage('kwhConsumedAc must be a positive number'),
  body('voltage')
    .notEmpty()
    .withMessage('voltage is required')
    .isFloat({ min: 0 })
    .withMessage('voltage must be a positive number'),
  body('timestamp')
    .notEmpty()
    .withMessage('timestamp is required')
    .isISO8601()
    .withMessage('timestamp must be a valid ISO8601 date string'),
  validate,
];

// Vehicle telemetry validation rules
export const validateVehicleTelemetry = [
  body('vehicleId')
    .notEmpty()
    .withMessage('vehicleId is required')
    .isString()
    .withMessage('vehicleId must be a string'),
  body('soc')
    .notEmpty()
    .withMessage('soc is required')
    .isFloat({ min: 0, max: 100 })
    .withMessage('soc must be a number between 0 and 100'),
  body('kwhDeliveredDc')
    .notEmpty()
    .withMessage('kwhDeliveredDc is required')
    .isFloat({ min: 0 })
    .withMessage('kwhDeliveredDc must be a positive number'),
  body('batteryTemp')
    .notEmpty()
    .withMessage('batteryTemp is required')
    .isFloat()
    .withMessage('batteryTemp must be a number'),
  body('timestamp')
    .notEmpty()
    .withMessage('timestamp is required')
    .isISO8601()
    .withMessage('timestamp must be a valid ISO8601 date string'),
  validate,
];
