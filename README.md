OnlyFrogs StyleSync Server

The OnlyFrogs StyleSync Server is the backend server for the StyleSync platform. It powers the app's key features such as clothing analysis, image processing, database management, and more. Built with Node.js, TypeScript, and Prisma, it is designed for scalability, performance, and reliability.

Features

Core Features
Image Processing: Leverages Puppeteer, Sharp, and Firebase for advanced image manipulation, such as background removal and preprocessing.
Clothing Analysis: Integrates OpenAI GPT-4 for analyzing clothing images and providing insights.
Database Management: Uses Prisma with PostgreSQL for a structured, efficient, and scalable database solution.
API Services: Provides robust REST APIs built with Express for seamless integration with the frontend.
Development Tools: Includes tools like Prettier, ESLint, and Jest to maintain code quality and reliability.
Developer Features
TypeScript Support: Fully typed codebase for better maintainability and developer experience.
Linting & Formatting: Integrated with ESLint and Prettier for a clean and consistent code style.
Testing: Includes Jest for unit and integration testing.
Hot Reloading: Supports development with tsx for fast iteration.
Getting Started

Prerequisites
Node.js >= 20.6.0
PostgreSQL database
Prisma CLI installed globally (npm install -g prisma)
Installation
Clone the repository:
git clone https://github.com/GangeiKan510/onlyfrogs-stylesync-server.git
cd onlyfrogs-stylesync-server
Install dependencies:
npm install
Set up environment variables:
Create a .env file in the root directory.
Add the following variables:
DATABASE_URL=your_postgresql_connection_string
FIREBASE_API_KEY=your_firebase_api_key
OPENAI_API_KEY=your_openai_api_key
Generate Prisma client:
npx prisma generate
Apply database migrations:
npx prisma migrate dev
Running the Server
Development

npm run dev
Production

Build the project:
npm run build
Start the server:
npm start
Testing
Run tests using:

npm test
Scripts

npm run dev: Starts the development server with hot reloading.
npm run build: Builds the project for production.
npm run start: Starts the production server.
npm run lint: Runs ESLint to check for linting issues.
npm run format: Formats the codebase with Prettier.
npm test: Runs unit tests with Jest.
Technologies Used

Node.js: Backend runtime environment.
TypeScript: Typed JavaScript for better developer experience.
Prisma: ORM for database management.
PostgreSQL: Database system.
Express: Lightweight and fast web framework.
Firebase: Image storage and processing.
OpenAI API: Integration for clothing analysis using GPT-4.
Sharp: High-performance image processing library.
Puppeteer: Headless browser for web scraping and automation.
Contribution

We welcome contributions! Feel free to fork the repository and submit pull requests. Follow these steps to contribute:

Fork the repository.
Create a new branch:
git checkout -b feature-name
Make your changes.
Commit your changes:
git commit -m "Add feature-name"
Push the branch:
git push origin feature-name
Submit a pull request.
License

This project is licensed under the ISC License.
