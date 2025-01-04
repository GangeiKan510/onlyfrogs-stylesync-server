# OnlyFrogs StyleSync Server

[![Join us on Slack](https://img.shields.io/badge/slack-chat-green.svg?logo=slack)](https://join.slack.com/t/ngc-goz8665/shared_invite/zt-r01kumfq-dQUT3c95BxEP_fnk4yJFfQ)
![Contributors](https://img.shields.io/github/contributors/GangeiKan510/onlyfrogs-stylesync-server?style=plastic)
![Forks](https://img.shields.io/github/forks/GangeiKan510/onlyfrogs-stylesync-server)
![Stars](https://img.shields.io/github/stars/GangeiKan510/onlyfrogs-stylesync-server)
![Licence](https://img.shields.io/github/license/GangeiKan510/onlyfrogs-stylesync-server)
![Issues](https://img.shields.io/github/issues/GangeiKan510/onlyfrogs-stylesync-server)

## Description

The **OnlyFrogs StyleSync Server** is the backend server for the StyleSync platform. It powers the app's key features such as clothing analysis, image processing, database management, and more. Built with Node.js, TypeScript, and Prisma, it is designed for scalability, performance, and reliability.

### Features

#### Core Features
- **Image Processing**: Leverages Puppeteer, Sharp, and Firebase for advanced image manipulation, such as background removal and preprocessing.
- **Clothing Analysis**: Integrates OpenAI GPT-4 for analyzing clothing images and providing insights.
- **Database Management**: Uses Prisma with PostgreSQL for a structured, efficient, and scalable database solution.
- **API Services**: Provides robust REST APIs built with Express for seamless integration with the frontend.
- **Development Tools**: Includes tools like Prettier, ESLint, and Jest to maintain code quality and reliability.

#### Developer Features
- **TypeScript Support**: Fully typed codebase for better maintainability and developer experience.
- **Linting & Formatting**: Integrated with ESLint and Prettier for a clean and consistent code style.
- **Testing**: Includes Jest for unit and integration testing.
- **Hot Reloading**: Supports development with tsx for fast iteration.

### Getting Started

#### Prerequisites
- Node.js >= 20.6.0
- PostgreSQL database
- Prisma CLI installed globally (`npm install -g prisma`)

#### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/GangeiKan510/onlyfrogs-stylesync-server.git
   cd onlyfrogs-stylesync-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory.

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Apply database migrations:
   ```bash
   npx prisma migrate dev
   ```

#### Running the Server

- **Development**:
  ```bash
  npm run dev
  ```

- **Production**:
  1. Build the project:
     ```bash
     npm run build
     ```
  2. Start the server:
     ```bash
     npm start
     ```

#### Testing
Run tests using:
```bash
npm test
```

### Scripts

- `npm run dev`: Starts the development server with hot reloading.
- `npm run build`: Builds the project for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint to check for linting issues.
- `npm run format`: Formats the codebase with Prettier.
- `npm test`: Runs unit tests with Jest.

### Technologies Used

- ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white) **Node.js**: Backend runtime environment.
- ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white) **TypeScript**: Typed JavaScript for better developer experience.
- ![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white) **Prisma**: ORM for database management.
- ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white) **PostgreSQL**: Database system.
- ![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white) **Express**: Lightweight and fast web framework.
- ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=white) **Firebase**: Image storage and processing.
- ![OpenAI](https://img.shields.io/badge/OpenAI-412991?logo=openai&logoColor=white) **OpenAI API**: Integration for clothing analysis using GPT-4.
- ![Sharp](https://img.shields.io/badge/Sharp-0078D6?logo=sharp&logoColor=white) **Sharp**: High-performance image processing library.
- ![Puppeteer](https://img.shields.io/badge/Puppeteer-40B5A4?logo=puppeteer&logoColor=white) **Puppeteer**: Headless browser for web scraping and automation.

### Contribution

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Make your changes.
4. Commit your changes:
   ```bash
   git commit -m "Add feature-name"
   ```
5. Push the branch:
   ```bash
   git push origin feature-name
   ```
6. Submit a pull request.


