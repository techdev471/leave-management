// import multer from 'multer';
import express from 'express';
import auth from '../middlewares/auth';
import * as EmployeeContoller from '../controllers/employeeContoller';

const routes = express.Router();
/* Employee Login */
routes.post('/login', EmployeeContoller.login);

/* Employee Add,Update,Delete */
routes.get('/', auth, EmployeeContoller.getEmployee);
routes.get('/getAllEmployees', auth, EmployeeContoller.getEmployeeList);
routes.post('/', EmployeeContoller.registerEmployee);
routes.put('/:id', EmployeeContoller.updateEmployee);
routes.put('/updateByAdmin/:id', auth, EmployeeContoller.updateByAdmin);
routes.put('/changePassword/:id', auth, EmployeeContoller.changePassword);
routes.delete('/:id', EmployeeContoller.deleteEmployee);
// routes.post('/roles',au)

export default routes;
