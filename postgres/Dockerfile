FROM postgres:15-alpine

# Add any custom PostgreSQL configurations if needed
COPY postgresql.conf /etc/postgresql/postgresql.conf

# The default command will run PostgreSQL with the custom config
CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"] 