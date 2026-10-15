# Use a base image with Ruby and Node.js
FROM ruby:3.2-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy Gemfile and Gemfile.lock to the container
COPY Gemfile Gemfile.lock /app/

# Install Jekyll and other dependencies
RUN apk add --no-cache build-base \
    && bundle install

# Copy the entire Jekyll project to the container
COPY . /app/

# Expose the default Jekyll port
EXPOSE 4000

# Command to run the Jekyll server
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--livereload"]
