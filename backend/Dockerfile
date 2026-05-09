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

# Configure PHP-FPM pool for better production performance
RUN echo '\
[www]\
pm = dynamic\
pm.max_children = 20\
pm.start_servers = 5\
pm.min_spare_servers = 5\
pm.max_spare_servers = 15\
pm.max_requests = 100\
catch_workers_output = yes\
' > /usr/local/etc/php-fpm.d/www.conf.patch && \
sed -i '/^\[www\]/,/^$/c\\
[www]\
pm = dynamic\
pm.max_children = 20\
pm.start_servers = 5\
pm.min_spare_servers = 5\
pm.max_spare_servers = 15\
pm.max_requests = 100\
catch_workers_output = yes\
' /usr/local/etc/php-fpm.d/www.conf

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

# Copy PHP-FPM configuration
COPY www.conf /usr/local/etc/php-fpm.d/www.conf

RUN composer install

CMD ["php-fpm"]  

