import express from 'express'

import { companiesController } from '../controllers/companies.controller.js'
import { isAuthenticated } from '../middlewares/auth.js'

export const companiesRouter = express.Router()

companiesRouter.get('/', companiesController.getCompanies)
companiesRouter.get('/current', isAuthenticated, companiesController.getCurrentUserCompany)
companiesRouter.get('/stores', isAuthenticated, companiesController.getStores)
companiesRouter.put('/current', isAuthenticated, companiesController.updateCurrentCompany)
companiesRouter.get('/:id', companiesController.getCompany)
companiesRouter.post('/', isAuthenticated, companiesController.registerCompany)
companiesRouter.put('/:id', isAuthenticated, companiesController.updateCompany)
