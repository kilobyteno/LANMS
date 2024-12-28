ARG BUILD_ENV=production
ARG NODE=node:lts-alpine
ARG NGINX=nginx:stable-alpine

FROM ${NODE} as node

# Needed to pass the ENV variable to the build stage, so stupid
ARG BUILD_ENV
# Reference: https://qmacro.org/blog/posts/2024/05/13/using-arg-in-a-dockerfile-beware-the-gotcha/

# Set working directory
WORKDIR /app

# Copy source code
COPY . /app

# Update npm
RUN npm install -g npm@latest

# Install dependencies
RUN npm install

# Build for production or staging
RUN echo "Building for environment: $BUILD_ENV" >&2

# Override build command if build mode is staging
RUN if [ "$BUILD_ENV" = "sandbox" ]; then \
        npm run build:sandbox; \
    elif [ "$BUILD_ENV" = "staging" ]; then \
        npm run build:staging; \
    else \
        npm run build:production; \
    fi

# Build Nginx image
FROM ${NGINX}

# Copy Nginx configuration file into appropriate location (see docs of nginx image)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static files to nginx work folder
COPY --from=node app/dist /var/www/portal/

# Add redirecting requests and error logs to docker log
RUN ln -sf /dev/stdout /var/log/nginx/portal.access.log \
	&& ln -sf /dev/stderr /var/log/nginx/portal.error.log

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
