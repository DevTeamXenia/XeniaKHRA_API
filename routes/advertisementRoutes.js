const express = require('express');
const router = express.Router();    
const advertisementController = require('../controllers/advertisementController')
const tokenService = require('../utils/JWTtokenService');

router.post('/create', tokenService.verifyWebUser, advertisementController.createadvertisement);
router.put('/:advertisementId',tokenService.verifyWebUser, advertisementController.updateAdvertisement);
router.get('/search/:partialName', tokenService.verifyWebUser, advertisementController.getInformation);

router.get('/state', tokenService.verifyWebUser, advertisementController.getStateadvertisement);
router.put('/Approve/:advertisementId', tokenService.verifyWebUser, advertisementController.ApproveAdvertisement);
router.get('/advertisementList',  advertisementController.getadvertisementList);
module.exports = router;



/**
 * @swagger
 * tags:
 *   name: Advertisement
 *   description: Advertisement management operations
 */

/**
 * @swagger
 * /v1/api/advertisement/create:
 *   post:
 *     summary: Create a new advertisement
 *     tags: [Advertisement]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the advertisement
 *               description:
 *                 type: string
 *                 description: The description of the advertisement
 *               imageUrl:
 *                 type: string
 *                 description: URL of the advertisement image
 *             required:
 *               - title
 *               - description
 *     responses:
 *       '201':
 *         description: Advertisement created successfully
 *       '401':
 *         description: Unauthorized
 *       '400':
 *         description: Bad Request
 */

/**
 * @swagger
 * /v1/api/advertisement/{advertisementId}:
 *   put:
 *     summary: Update an advertisement
 *     tags: [Advertisement]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: advertisementId
 *         required: true
 *         description: The ID of the advertisement to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the advertisement
 *               description:
 *                 type: string
 *                 description: The description of the advertisement
 *               imageUrl:
 *                 type: string
 *                 description: URL of the advertisement image
 *     responses:
 *       '200':
 *         description: Advertisement updated successfully
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Advertisement not found
 */

/**
 * @swagger
 * /v1/api/advertisement/search/{partialName}:
 *   get:
 *     summary: Search advertisements by partial name
 *     tags: [Advertisement]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: partialName
 *         required: true
 *         description: The partial name to search for
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Advertisement ID
 *                   title:
 *                     type: string
 *                     description: Advertisement title
 *                   description:
 *                     type: string
 *                     description: Advertisement description
 *                   imageUrl:
 *                     type: string
 *                     description: URL of the advertisement image
 *       '401':
 *         description: Unauthorized
 */

/**
 * @swagger
 * /v1/api/advertisement/state:
 *   get:
 *     summary: Get state advertisement data
 *     tags: [Advertisement]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: State advertisement data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: string
 *                   description: State information
 *       '401':
 *         description: Unauthorized
 */

/**
 * @swagger
 * /v1/api/advertisement/Approve/{advertisementId}:
 *   put:
 *     summary: Approve an advertisement
 *     tags: [Advertisement]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: advertisementId
 *         required: true
 *         description: The ID of the advertisement to approve
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Advertisement approved successfully
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Advertisement not found
 */

/**
 * @swagger
 * /v1/api/advertisement/advertisementList:
 *   get:
 *     summary: Get list of advertisements
 *     tags: [Advertisement]
 *     responses:
 *       '200':
 *         description: List of advertisements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Advertisement ID
 *                   title:
 *                     type: string
 *                     description: Advertisement title
 *                   description:
 *                     type: string
 *                     description: Advertisement description
 *                   imageUrl:
 *                     type: string
 *                     description: URL of the advertisement image
 *       '401':
 *         description: Unauthorized
 */