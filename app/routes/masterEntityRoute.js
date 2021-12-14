import express from 'express';
import * as MasterEntityController from '../controllers/masterEntityController';

const routes = express.Router();
routes.get('/:id', MasterEntityController.getMasterEntity);
routes.get('/getEntityValues/:id', MasterEntityController.getTeamData);
routes.post('/', MasterEntityController.addMasterEntity);
routes.put('/:id', MasterEntityController.updateMasterEntity);

// routes.put('/', MasterEntityController.editClient);
// routes.delete('/', MasterEntityController.deleteClient);

export default routes;
