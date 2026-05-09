FROM php:8.4-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    libpng-dev \
    libonig-dev \
    libxml2-dev

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy project files
COPY . .

# Copy PHP-FPM configuration (this replaces the broken RUN block)
COPY www.conf /usr/local/etc/php-fpm.d/www.conf

# Install PHP dependencies
RUN composer install

# Start PHP-FPM
CMD ["php-fpm"]
