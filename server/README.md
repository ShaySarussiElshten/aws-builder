# AWS Workflow Designer - Backend Server

This is the backend server for the AWS Workflow Designer application. It provides API endpoints for workflow management and AWS CloudFormation deployment.

## Features

- **Workflow Management**: CRUD operations for workflows stored in Supabase
- **CloudFormation Integration**: Deploy workflows as CloudFormation stacks
- **Template Validation**: Validate CloudFormation templates before deployment
- **Stack Monitoring**: Check deployment status and stack information

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# AWS Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 3. Start the Server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).

## API Endpoints

### Health Check
- `GET /api/health` - Check if the server is running

### Workflows
- `GET /api/workflows` - Get all workflows
- `GET /api/workflows/:id` - Get a specific workflow
- `POST /api/workflows` - Create a new workflow
- `PUT /api/workflows/:id` - Update a workflow
- `DELETE /api/workflows/:id` - Delete a workflow

### CloudFormation
- `POST /api/deploy` - Deploy a CloudFormation stack
- `GET /api/deploy/:stackName/status` - Get stack deployment status
- `POST /api/validate-template` - Validate a CloudFormation template

## Project Structure

```
server/
├── index.js              # Main server file
├── package.json          # Server dependencies
├── .env                  # Environment variables (not in git)
├── .env.example          # Environment template
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## Dependencies

### Production Dependencies
- **express**: Web framework for Node.js
- **cors**: Cross-Origin Resource Sharing middleware
- **dotenv**: Environment variable loader
- **@supabase/supabase-js**: Supabase client library
- **aws-sdk**: AWS SDK for JavaScript
- **js-yaml**: YAML parser and stringifier

### Development Dependencies
- **nodemon**: Development server with auto-restart
- **@types/express**: TypeScript definitions for Express
- **@types/js-yaml**: TypeScript definitions for js-yaml
- **@types/node**: TypeScript definitions for Node.js

## Configuration

### Supabase Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and service role key from the project settings
3. Apply the database migration from `../supabase/migrations/`

### AWS Setup
1. Create an AWS account and IAM user with CloudFormation permissions
2. Generate access keys for the IAM user
3. Configure the keys in your `.env` file

## Security Notes

- Never commit your `.env` file to version control
- Use the service role key (not the anon key) for server-side operations
- Ensure your AWS IAM user has minimal required permissions
- Consider using AWS IAM roles instead of access keys in production

## Development

The server uses ES modules (`"type": "module"` in package.json), so use `import/export` syntax instead of `require/module.exports`.

For development with auto-restart:
```bash
npm run dev
```

## Deployment

For production deployment:

1. Set `NODE_ENV=production` in your environment
2. Use a process manager like PM2 or Docker
3. Configure proper logging and monitoring
4. Use environment-specific configuration files

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the `PORT` in your `.env` file
2. **Supabase connection errors**: Verify your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. **AWS permission errors**: Check your IAM user permissions for CloudFormation
4. **CORS issues**: Ensure the frontend URL is allowed in CORS configuration

### Logs

Check the console output for detailed error messages. The server logs all requests and errors to help with debugging.