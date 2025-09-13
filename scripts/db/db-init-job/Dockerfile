FROM joseluisq/mysql-client:latest

WORKDIR /scripts/db

COPY local.sql .
COPY init.sql .
COPY init.sh .

RUN chmod +x init.sh

ENTRYPOINT ["./init.sh"]