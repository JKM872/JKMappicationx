import { Router } from 'express';
import SearchController from '../controllers/searchController';

const router = Router();
const searchController = new SearchController();

router.get('/', searchController.handleSearch.bind(searchController));

export default router;