import { AxiosError } from 'axios'

import { LocalizedError } from './errors.model'

export interface ResponseError extends AxiosError<LocalizedError> {}
