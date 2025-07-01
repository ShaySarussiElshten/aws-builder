# AWS Workflow Designer

A visual drag-and-drop interface for designing AWS infrastructure workflows and automatically generating CloudFormation templates.

## 🚀 Features

- **Visual Design**: Drag and drop AWS services to create infrastructure workflows
- **Real-time Configuration**: Configure service properties with an intuitive interface
- **CloudFormation Export**: Automatically generate CloudFormation templates (JSON/YAML)
- **User Authentication**: Secure user accounts with Supabase
- **Workflow Management**: Save, load, and manage your workflows
- **Connection Validation**: Smart validation of AWS service connections
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

This project consists of two main parts:

### Frontend (React + Vite)
- **Location**: Root directory
- **Port**: 5173 (development)
- **Tech Stack**: React, TypeScript, Material-UI, ReactFlow, Tailwind CSS
- **Purpose**: Visual workflow designer interface

### Backend (Express + Node.js)
- **Location**: `./server/` directory
- **Port**: 3001 (development)
- **Tech Stack**: Express, Node.js, Supabase, AWS SDK
- **Purpose**: API for workflow management and CloudFormation deployment

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for database and authentication)
- AWS account (for CloudFormation deployment - optional)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aws-workflow-designer
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure environment variables**
   
   **Frontend (.env):**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
   
   **Backend (server/.env):**
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   AWS_ACCESS_KEY_ID=your-aws-access-key-id
   AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
   AWS_REGION=us-east-1
   PORT=3001
   ```

4. **Set up Supabase database**
   - Apply the migration from `supabase/migrations/20250701073234_curly_base.sql`
   - See `MIGRATION_INSTRUCTIONS.md` for detailed steps

5. **Start development servers**
   
   **Frontend:**
   ```bash
   npm run dev
   ```
   
   **Backend (optional):**
   ```bash
   npm run server:dev
   ```

## 🎯 Usage

### Basic Workflow Creation

1. **Start the frontend**: `npm run dev` and open http://localhost:5173
2. **Sign up/Sign in**: Create an account or sign in to save workflows
3. **Drag services**: From the left sidebar, drag AWS services onto the canvas
4. **Connect services**: Draw connections between compatible services
5. **Configure**: Click on services to configure their properties
6. **Save**: Save your workflow to your account
7. **Export**: Export as CloudFormation JSON or YAML template

### Available AWS Services

- **Compute**: Lambda, EC2
- **Storage**: S3
- **Database**: DynamoDB, RDS
- **Networking**: API Gateway
- **Messaging**: SNS, SQS
- **Triggers**: Manual click triggers

### Service Connections

The application validates connections based on AWS best practices:
- ✅ API Gateway → Lambda
- ✅ Lambda → DynamoDB/S3/SNS/SQS
- ✅ S3 → Lambda (event triggers)
- ✅ Triggers → Any AWS service
- ❌ Invalid connections are prevented

## 🛠️ Development

### Project Structure

```
aws-workflow-designer/
├── src/                          # Frontend source code
│   ├── components/              # React components
│   ├── store/                   # Zustand state management
│   ├── services/               # API services
│   ├── types/                  # TypeScript types
│   └── utils/                  # Utility functions
├── server/                      # Backend server
│   ├── index.js               # Express server
│   ├── package.json           # Server dependencies
│   └── .env                   # Server environment variables
├── supabase/                   # Database migrations
└── public/                     # Static assets
```

### Frontend Development

```bash
# Start frontend development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Backend Development

```bash
# Start backend development server
npm run server:dev

# Start backend production server
npm run server

# Install server dependencies only
npm run server:install
```

### Environment Variables

**Frontend (.env):**
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

**Backend (server/.env):**
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `AWS_ACCESS_KEY_ID`: AWS access key for CloudFormation
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for CloudFormation
- `AWS_REGION`: AWS region for deployments
- `PORT`: Server port (default: 3001)

## 🔧 Configuration

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Get your project URL and keys from Settings → API
3. Apply the database migration (see `MIGRATION_INSTRUCTIONS.md`)
4. Configure authentication settings as needed

### AWS Setup (Optional)

For CloudFormation deployment features:

1. Create an AWS account
2. Create an IAM user with CloudFormation permissions
3. Generate access keys
4. Configure in `server/.env`

## 🚀 Deployment

### Frontend Deployment

The frontend can be deployed to any static hosting service:

```bash
npm run build
# Deploy the 'dist' folder to your hosting service
```

### Backend Deployment

The backend can be deployed to any Node.js hosting service:

```bash
cd server
npm install --production
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the README files in each directory
- **Issues**: Open an issue on GitHub
- **Migration Help**: See `MIGRATION_INSTRUCTIONS.md` for database setup

## 🔮 Roadmap

- [ ] More AWS services (ECS, EKS, CloudWatch, etc.)
- [ ] Real CloudFormation deployment integration
- [ ] Workflow templates and sharing
- [ ] Advanced validation and cost estimation
- [ ] Team collaboration features
- [ ] Infrastructure state management