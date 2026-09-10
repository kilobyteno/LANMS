FROM postgres:15-alpine

COPY postgresql.conf /etc/postgresql/postgresql.conf

EXPOSE 5432

HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
    CMD pg_isready -U postgres || exit 1

CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]
