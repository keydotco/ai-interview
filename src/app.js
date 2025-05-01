/**
 * Main Express application file
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { configureRoutes } from './routes/index.js';
import { loadConfig } from './utils/config.js';

const config = loadConfig();

const app = express();

app.use(helmet()); // Security headers
app.use(cors()); // CORS support
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(morgan('dev')); // Request logging

configureRoutes(app);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
