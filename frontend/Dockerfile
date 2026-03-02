# Use Debian-based image so Rollup's native binary (glibc) installs correctly;
# Alpine (musl) has npm optional-deps issues on ARM64.
FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 5173

# Start the development server
CMD ["npm", "run", "dev", "--", "--host"]