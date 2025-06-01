# CRUDGen

CRUDGen is a code generation tool designed to streamline the creation of backend and frontend applications based on Prisma models. It automates the generation of CRUD components, DTOs, and API clients, saving developers time and effort.

## Features

- **Frontend Generation**: Generates React components for CRUD operations using templates.
- **Backend Generation**: Creates NestJS modules, services, and DTOs based on Prisma models.
- **Prisma Integration**: Reads Prisma schema files to extract models and fields.
- **Customizable Templates**: Uses Handlebars templates for flexible code generation.
- **Type Mapping**: Maps Prisma field types to TypeScript types for consistency.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/crudgen.git
   cd crudgen
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

## Usage

### Generate an Application

To generate a frontend and backend application based on a Prisma schema:

1. Place your Prisma schema file in the desired location (e.g., `./prisma/schema.prisma`).
2. Run the following command:
   ```bash
   bun run generate-app ./prisma/schema.prisma
   ```

### Frontend Generation

The frontend is generated in the `generated/app-frontend` directory. It includes:

- React components for CRUD operations.
- An API client for interacting with the backend.

### Backend Generation

The backend is generated in the `generated/app-backend` directory. It includes:

- NestJS modules and services for each Prisma model.
- DTOs for data validation and transfer.

## Development

### File Structure

- **scripts/utils/map-field-type.ts**: Maps Prisma field types to TypeScript types.
- **scripts/prisma-parser.ts**: Extracts models and fields from a Prisma schema.
- **scripts/generate-frontend.ts**: Generates frontend components and API client.
- **scripts/generate-backend.ts**: Generates backend modules, services, and DTOs.
- **scripts/generate-app.ts**: Orchestrates the generation of both frontend and backend.

### TODOs

See the [Todo.md](./Todo.md) file for pending tasks and improvements.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License.
