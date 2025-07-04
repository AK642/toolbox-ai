import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.routes';
import { swaggerUi } from './swagger/swagger';
import path from 'path';
import YAML from 'yamljs';
import { errorMiddleware } from './middleware/error.middleware';

export class App {
    public express: Express = express();
    
    constructor() {
        // Middlewares
        this.express.use(cors());
        this.express.use(morgan('dev'));
        this.express.use(express.json({ limit: '200mb' }));
        this.express.use((req: Request, res: Response, next: NextFunction) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, access-token, Access-Control-Allow-Headers');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            next();
        });

        // Routes
        this.express.use('/api', routes);

        // Swagger route
        const swaggerSpec = YAML.load(path.join(__dirname, './swagger/swagger.yaml'));
        this.express.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

        // Route to check if server is working or not
        this.express.get('/', (req: Request, res: Response) => {
            res.send('Server Works! 🚀🚀 ');
        });

        this.express.use(errorMiddleware);

        // If no route is matched
        this.express.use((req: Request, res: Response) => {
            res.status(404).send('Endpoint not found!');
        });
    }
}