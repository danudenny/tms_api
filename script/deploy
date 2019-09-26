#!/bin/sh
tar czf sicepat-tms-api.tar.gz dist ormconfig.js ormconfig.production.js package.json package-lock.json yarn.lock
scp ubuntu@18.138.172.59:~
rm sicepat-tms-api.tar.gz
ssh ubuntu@18.138.172.59 <<'ENDSSH'
  mv /home/ubuntu/sicepat-tms-api.tar.gz /var/www/
  echo "Testing Deploy"
ENDSSH